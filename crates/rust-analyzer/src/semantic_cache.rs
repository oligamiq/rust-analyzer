//! Build-specific, pre-generated standard-library Salsa snapshots.

use std::{
    borrow::Cow,
    collections::HashSet,
    fs,
    path::Path,
    sync::{Arc, Mutex, OnceLock},
    time::Instant,
};

use anyhow::{Context, bail, ensure};
#[cfg(feature = "cache-item-trees")]
use hir::db::DefDatabase;
use ide_db::{
    RootDatabase,
    base_db::{SourceDatabase, all_crates, salsa},
};
use load_cargo::{LoadCargoConfig, ProcMacroServerChoice, load_workspace_at};
use serde::{Deserialize, Serialize};
use vfs::{FileId, Vfs, VfsPath};

const SCHEMA: u32 = 2;
const IMMUTABLE_SOURCE_ROOT: &str = "/sysroot/lib/rustlib/src/rust/library";
const IMAGE_ID_PATH: &str = "/sysroot/lib/rustlib/src/rust/library/.rubrc-source-id";

pub(crate) enum CacheStatusNotification {}
impl lsp_types::notification::Notification for CacheStatusNotification {
    type Params = lsp_types::LogMessageParams;
    const METHOD: &'static str = "rust-analyzer/stdlibCacheStatus";
}

#[derive(Serialize, Deserialize)]
struct CacheEnvelope<'a> {
    build_id: String,
    schema: u32,
    files: Vec<FileInfo>,
    checksum: [u8; 32],
    source_image: Option<String>,
    #[serde(borrow, with = "serde_bytes")]
    payload: Cow<'a, [u8]>,
}

#[derive(Serialize, Deserialize)]
struct FileInfo {
    id: u32,
    path: String,
    hash: Option<[u8; 32]>,
}

#[derive(Debug)]
pub(crate) struct PreparedCache {
    pub db: RootDatabase,
    pub files: Vec<(FileId, VfsPath, bool)>,
    pub audit: Option<CacheAudit>,
    pub status: String,
}

impl PreparedCache {
    pub(crate) fn can_merge(&self, graph: &ide_db::base_db::CrateGraphBuilder) -> bool {
        let roots: HashSet<_> = graph
            .iter()
            .filter_map(|id| {
                let data = &graph[id].basic;
                data.origin.is_lang().then_some(data.root_file_id)
            })
            .collect();
        let cached = all_crates(&self.db);
        !cached.is_empty()
            && cached.iter().all(|krate| roots.contains(&krate.data(&self.db).root_file_id))
    }
}

#[derive(Debug)]
pub(crate) struct CacheAudit {
    events: Arc<Mutex<Vec<salsa::Event>>>,
    finished: Arc<OnceLock<()>>,
    inputs: Vec<(ide_db::base_db::Crate, [[u8; 32]; 5])>,
}

impl CacheAudit {
    fn new() -> Self {
        Self { events: Arc::default(), finished: Arc::default(), inputs: vec![] }
    }

    fn event_callback(&self) -> Box<dyn Fn(salsa::Event) + Send + Sync> {
        let events = Arc::clone(&self.events);
        let finished = Arc::clone(&self.finished);
        Box::new(move |event| {
            if finished.get().is_none()
                && matches!(event.kind, salsa::EventKind::WillExecute { .. })
            {
                events.lock().unwrap().push(event);
            }
        })
    }

    pub(crate) fn finish(self, db: &RootDatabase, progress: impl Fn(String)) -> String {
        use salsa::plumbing::AsId;
        let start = Instant::now();
        let crates: Vec<_> = all_crates(db)
            .iter()
            .copied()
            .filter(|krate| krate.data(db).origin.is_lang())
            .collect();
        for &krate in &crates {
            progress(format!("[stdlib-cache] probe_start: {}", crate_name(db, krate)));
            let crate_start = Instant::now();
            hir::crate_def_map(db, krate);
            #[cfg(feature = "cache-item-trees")]
            db.file_item_tree(krate.root_file_id(db).into(), krate);
            progress(format!(
                "[stdlib-cache] probe_done: {} ms={}",
                crate_name(db, krate),
                crate_start.elapsed().as_millis()
            ));
        }
        let _ = self.finished.set(());
        let events = std::mem::take(&mut *self.events.lock().unwrap());
        let executed: Vec<_> = events
            .iter()
            .filter_map(|event| match event.kind {
                salsa::EventKind::WillExecute { database_key }
                    if crates.iter().any(|krate| krate.as_id() == database_key.key_index()) =>
                {
                    let name = (db as &dyn salsa::Database)
                        .ingredient_debug_name(database_key.ingredient_index());
                    name.contains("crate_local_def_map").then(|| {
                        let krate = crates
                            .iter()
                            .find(|krate| krate.as_id() == database_key.key_index())
                            .unwrap();
                        crate_name(db, *krate)
                    })
                }
                _ => None,
            })
            .collect();
        let recomputed = executed.len();
        let item_trees = events
            .iter()
            .filter(|event| match event.kind {
                salsa::EventKind::WillExecute { database_key } => (db as &dyn salsa::Database)
                    .ingredient_debug_name(database_key.ingredient_index())
                    .contains("file_item_tree_query"),
                _ => false,
            })
            .count();
        let changed: Vec<_> = self
            .inputs
            .iter()
            .filter(|(krate, _)| crates.contains(krate))
            .filter_map(|(krate, before)| {
                let after = input_signatures(db, *krate);
                let fields: Vec<_> = ["data", "extra", "cfg", "env", "workspace"]
                    .into_iter()
                    .enumerate()
                    .filter_map(|(i, field)| (before[i] != after[i]).then_some(field))
                    .collect();
                (!fields.is_empty())
                    .then(|| format!("{}:{}", crate_name(db, *krate), fields.join(",")))
            })
            .collect();
        format!(
            "[stdlib-cache] audit: std_crates={}, recomputed_defmaps={recomputed}, probe_ms={}, recomputed={executed:?}, changed_inputs={changed:?}, recomputed_item_trees={item_trees}, item_tree_cache_enabled={}",
            crates.len(),
            start.elapsed().as_millis(),
            cfg!(feature = "cache-item-trees")
        )
    }
}

fn crate_name(db: &RootDatabase, krate: ide_db::base_db::Crate) -> String {
    krate
        .extra_data(db)
        .display_name
        .as_ref()
        .map(|name| name.crate_name().to_string())
        .unwrap_or_else(|| format!("{:?}", krate.data(db).origin))
}

fn input_signatures(db: &RootDatabase, krate: ide_db::base_db::Crate) -> [[u8; 32]; 5] {
    fn hash<T: Serialize>(value: &T) -> [u8; 32] {
        blake3::hash(&rmp_serde::to_vec(value).expect("cache input serialization")).into()
    }
    [
        hash(krate.data(db)),
        hash(krate.extra_data(db)),
        hash(krate.cfg_options(db)),
        hash(krate.env(db)),
        hash(krate.workspace_data(db)),
    ]
}

fn decode_envelope(bytes: &[u8]) -> anyhow::Result<CacheEnvelope<'_>> {
    let envelope: CacheEnvelope<'_> =
        rmp_serde::from_slice(bytes).context("invalid cache envelope")?;
    ensure!(envelope.schema == SCHEMA, "cache schema mismatch");
    ensure!(envelope.build_id == env!("RA_BUILD_ID"), "cache build mismatch");
    ensure!(
        blake3::hash(&envelope.payload).as_bytes() == &envelope.checksum,
        "cache checksum mismatch"
    );
    Ok(envelope)
}

pub(crate) fn load(path: &Path) -> anyhow::Result<PreparedCache> {
    let start = Instant::now();
    let bytes = fs::read(path)?;
    let envelope = decode_envelope(&bytes)?;
    let actual_image = source_image_identity();
    let image_matches = match (&envelope.source_image, &actual_image) {
        (Some(expected), Some(actual)) => {
            ensure!(expected == actual, "rust-src image changed");
            true
        }
        _ => false,
    };
    let mut files = Vec::with_capacity(envelope.files.len());
    let mut seen = HashSet::new();
    for (expected, file) in envelope.files.iter().enumerate() {
        ensure!(file.id as usize == expected, "noncontiguous cache file IDs");
        ensure!(Path::new(&file.path).is_absolute(), "cache path is not absolute");
        ensure!(seen.insert(&file.path), "duplicate cache path");
        if let Some(hash) = file.hash {
            if !image_matches || !is_image_path(Path::new(&file.path)) {
                let bytes = fs::read(&file.path).with_context(|| format!("read {}", file.path))?;
                ensure!(
                    blake3::hash(&bytes).as_bytes() == &hash,
                    "sysroot content changed: {}",
                    file.path
                );
            }
        } else {
            ensure!(!Path::new(&file.path).is_file(), "previously missing sysroot file now exists");
        }
        files.push((
            FileId::from_raw(file.id),
            VfsPath::new_real_path(file.path.clone()),
            file.hash.is_some(),
        ));
    }
    let validation_ms = start.elapsed().as_millis();
    let audit_enabled = std::env::var_os("RA_STD_CACHE_AUDIT").is_some()
        || (cfg!(target_os = "wasi") && Path::new("/rust-analyzer-std.audit").is_file());
    let mut audit = audit_enabled.then(CacheAudit::new);
    let callback = audit.as_ref().map(CacheAudit::event_callback);
    let db = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        RootDatabase::deserialize_cache_with_events(&envelope.payload, callback)
    }))
    .map_err(|_| anyhow::anyhow!("invalid Salsa cache state"))??;
    ensure!(!all_crates(&db).is_empty(), "empty sysroot cache");
    ensure!(
        all_crates(&db).iter().all(|krate| krate.data(&db).origin.is_lang()),
        "cache contains user crates"
    );
    if let Some(audit) = &mut audit {
        audit.inputs =
            all_crates(&db).iter().map(|&krate| (krate, input_signatures(&db, krate))).collect();
    }
    tracing::info!(
        validation_ms,
        decode_ms = start.elapsed().as_millis() - validation_ms,
        bytes = envelope.payload.len(),
        "[stdlib-cache] loaded"
    );
    let status = format!(
        "[stdlib-cache] loaded: format=MessagePack bytes={} validation_ms={validation_ms} decode_ms={} audit_enabled={audit_enabled} image_validation={image_matches}",
        envelope.payload.len(),
        start.elapsed().as_millis() - validation_ms
    );
    Ok(PreparedCache { db, files, audit, status })
}

pub(crate) fn generate(project: &Path, output: &Path, benchmark: bool) -> anyhow::Result<()> {
    #[cfg(not(feature = "cache-codec-bench"))]
    ensure!(!benchmark, "build with cache-codec-bench to compare cache codecs");
    let load_config = LoadCargoConfig {
        load_out_dirs_from_check: false,
        with_proc_macro_server: ProcMacroServerChoice::None,
        prefill_caches: false,
        num_worker_threads: 1,
        proc_macro_processes: 1,
    };
    // Match the server's defaults (not CargoConfig::default(), which omits
    // rust-analyzer's cfg overrides such as miri and debug_assertions).
    let project_path = std::env::current_dir()?.join(project);
    let root = vfs::AbsPathBuf::assert_utf8(
        project_path.parent().context("project has no parent")?.to_path_buf(),
    );
    let config = crate::config::Config::new(root, Default::default(), vec![], None);
    let (mut db, vfs, _) = load_workspace_at(project, &config.cargo(None), &load_config, &|_| {})?;
    let crates = all_crates(&db).to_vec();
    ensure!(!crates.is_empty(), "project has no sysroot crates");
    for krate in crates {
        ensure!(
            krate.data(&db).origin.is_lang(),
            "generate from a rust-project.json with sysroot and an empty crates array"
        );
        hir::crate_def_map(&db, krate);
    }
    let mut files = Vec::new();
    for (id, path) in vfs.iter_all_paths() {
        if vfs.exists(id) {
            let root_id = db.file_source_root(id).source_root_id(&db);
            ensure!(
                db.source_root(root_id).source_root(&db).is_library,
                "cache generation encountered a non-library source: {path}"
            );
        }
        let Some(path) = path.as_path() else {
            bail!("sysroot contains virtual paths");
        };
        files.push(FileInfo {
            id: id.index(),
            path: path.to_string(),
            hash: if vfs.exists(id) { Some(blake3::hash(&fs::read(path)?).into()) } else { None },
        });
    }
    files.sort_by_key(|file| file.id);
    ensure!(
        files.iter().enumerate().all(|(i, file)| i == file.id as usize),
        "sysroot VFS has gaps"
    );
    let payload = db.serialize_cache()?;
    #[cfg(feature = "cache-codec-bench")]
    if benchmark {
        #[allow(clippy::print_stderr)]
        for row in db.benchmark_cache_codecs(3) {
            eprintln!("[stdlib-cache-codec] {}", serde_json::to_string(&row)?);
        }
    }
    // Verify the build-specific round trip before publishing an artifact. This
    // also exercises IDs reachable only in the real sysroot, beyond minicore.
    let restored = RootDatabase::deserialize_cache(&payload)?;
    for &krate in all_crates(&db).iter() {
        ensure!(
            hir::crate_def_map(&db, krate) == hir::crate_def_map(&restored, krate),
            "restored sysroot name resolution differs"
        );
    }
    drop(restored);
    let envelope = CacheEnvelope {
        build_id: env!("RA_BUILD_ID").into(),
        schema: SCHEMA,
        files,
        checksum: blake3::hash(&payload).into(),
        source_image: source_image_identity(),
        payload: Cow::Owned(payload),
    };
    let bytes = rmp_serde::to_vec(&envelope)?;
    let temporary = output.with_extension("cache.tmp");
    fs::write(&temporary, bytes)?;
    fs::rename(&temporary, output)?;
    Ok(())
}

fn source_image_identity() -> Option<String> {
    // Only the rubrc WASI host provides this contract: a read-only synthetic
    // file backed by the mounted image, not a mutable sidecar on disk.
    if !cfg!(target_os = "wasi") {
        return None;
    }
    let value = fs::read_to_string(IMAGE_ID_PATH).ok()?;
    let hash = value.strip_prefix("rubrc-ro-v1:")?;
    (hash.len() == 64 && hash.bytes().all(|b| b.is_ascii_hexdigit())).then_some(value)
}

fn is_image_path(path: &Path) -> bool {
    path.starts_with(IMMUTABLE_SOURCE_ROOT)
        && !path.components().any(|part| matches!(part, std::path::Component::ParentDir))
}

pub(crate) fn seed_vfs(cache: &PreparedCache, vfs: &mut Vfs) -> anyhow::Result<()> {
    ensure!(vfs.iter().next().is_none(), "cache requires an empty VFS");
    for (id, path, exists) in &cache.files {
        let contents = exists.then(|| cache.db.file_text(*id).text(&cache.db).as_bytes().to_vec());
        vfs.set_file_contents(path.clone(), contents);
        ensure!(vfs.file_path(*id) == path, "cache VFS identity mismatch");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_fixture::WithFixture;

    #[test]
    fn image_validation_is_scoped_to_the_immutable_mount() {
        assert!(is_image_path(Path::new("/sysroot/lib/rustlib/src/rust/library/core/src/lib.rs")));
        assert!(!is_image_path(Path::new("/src/main.rs")));
        assert!(!is_image_path(Path::new("/sysroot/lib/rustlib/src/rust/library/../mutable.rs")));
        assert!(!is_image_path(Path::new("/sysroot/lib/rustlib/src/rust/library-other/file.rs")));
    }

    #[test]
    fn envelope_borrows_its_payload() {
        let bytes = rmp_serde::to_vec(&envelope()).unwrap();
        let decoded = decode_envelope(&bytes).unwrap();
        let outer = bytes.as_ptr_range();
        let inner = decoded.payload.as_ptr_range();
        assert!(
            inner.start >= outer.start && inner.end <= outer.end,
            "cache decoding must not allocate/copy a second payload buffer"
        );
    }

    #[test]
    fn audit_distinguishes_reused_and_invalidated_std_queries() {
        let mut warm = RootDatabase::with_files(
            "//- /core/lib.rs crate:core library\n#![no_core]\npub struct Old;\n",
        );
        hir::crate_def_map(&warm, all_crates(&warm)[0]);
        let bytes = warm.serialize_cache().unwrap();
        for (invalidate, expected) in [(false, 0), (true, 1)] {
            let audit = CacheAudit::new();
            let mut restored =
                RootDatabase::deserialize_cache_with_events(&bytes, Some(audit.event_callback()))
                    .unwrap();
            if invalidate {
                let core = all_crates(&restored)[0];
                restored.set_file_text(
                    core.data(&restored).root_file_id,
                    "#![no_core]\npub struct New;",
                );
            }
            let report = audit.finish(&restored, |_| {});
            assert!(report.contains(&format!("recomputed_defmaps={expected}")), "{report}");
        }
    }

    #[test]
    fn cache_waits_until_its_sysroot_is_in_the_workspace_graph() {
        let fixture = "//- /core/lib.rs crate:core library\n#![no_core]\npub struct Core;\n";
        let cache = PreparedCache {
            db: RootDatabase::with_files(fixture),
            files: vec![],
            audit: None,
            status: String::new(),
        };
        assert!(!cache.can_merge(&Default::default()));
        let graph =
            test_fixture::ChangeFixture::parse(fixture).change.source_change.crate_graph.unwrap();
        assert!(cache.can_merge(&graph));
    }

    fn envelope() -> CacheEnvelope<'static> {
        CacheEnvelope {
            build_id: env!("RA_BUILD_ID").into(),
            schema: SCHEMA,
            files: vec![],
            checksum: blake3::hash(&[1, 2, 3]).into(),
            source_image: None,
            payload: Cow::Borrowed(&[1, 2, 3]),
        }
    }

    #[test]
    fn incompatible_or_corrupt_envelope_is_rejected_before_salsa() {
        let mut cache = envelope();
        cache.schema += 1;
        assert!(decode_envelope(&rmp_serde::to_vec(&cache).unwrap()).is_err());
        let mut cache = envelope();
        cache.build_id.push('x');
        assert!(decode_envelope(&rmp_serde::to_vec(&cache).unwrap()).is_err());
        let mut cache = envelope();
        cache.payload.to_mut()[0] ^= 1;
        assert!(decode_envelope(&rmp_serde::to_vec(&cache).unwrap()).is_err());
        let bytes = rmp_serde::to_vec(&envelope()).unwrap();
        assert!(decode_envelope(&bytes).is_ok());
        assert!(decode_envelope(&bytes[..bytes.len() - 1]).is_err());
    }
}
