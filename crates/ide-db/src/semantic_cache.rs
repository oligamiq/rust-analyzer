//! The database portion of a semantic cache. The caller must validate the build,
//! configuration and file manifest before restoring these build-specific bytes.

use std::mem::ManuallyDrop;

use base_db::{CratesMap, Files, Nonce};
#[cfg(feature = "cache-item-trees")]
use hir::db::DefDatabase;
use serde::{Deserialize, Serialize};

use crate::RootDatabase;

#[derive(Serialize)]
struct SnapshotRef<'a> {
    #[serde(with = "serde_bytes")]
    salsa: &'a [u8],
    files: &'a Files,
    crates_map: &'a CratesMap,
}

#[derive(Deserialize)]
struct Snapshot<'a> {
    #[serde(borrow, with = "serde_bytes")]
    salsa: &'a [u8],
    files: Files,
    crates_map: CratesMap,
}

#[cfg(feature = "cache-codec-bench")]
#[derive(Debug, Serialize)]
pub struct CacheCodecStats {
    pub codec: &'static str,
    pub bytes: usize,
    pub encode_ms: u128,
    pub decode_ms: Vec<u128>,
    pub error: Option<String>,
}

impl RootDatabase {
    #[cfg(feature = "cache-codec-bench")]
    pub fn benchmark_cache_codecs(&mut self, rounds: usize) -> Vec<CacheCodecStats> {
        use std::time::Instant;
        let mut rows = Vec::new();
        for codec in ["rmp", "pot"] {
            let start = Instant::now();
            let encoded = if codec == "rmp" {
                self.serialize_cache().map_err(|error| error.to_string())
            } else {
                let salsa = pot::to_vec(&<dyn salsa::Database>::as_serialize(self));
                salsa
                    .and_then(|salsa| {
                        pot::to_vec(&SnapshotRef {
                            salsa: &salsa,
                            files: &self.files,
                            crates_map: &self.crates_map,
                        })
                    })
                    .map_err(|error| error.to_string())
            };
            let mut row = CacheCodecStats {
                codec,
                bytes: 0,
                encode_ms: start.elapsed().as_millis(),
                decode_ms: vec![],
                error: None,
            };
            match encoded {
                Err(error) => row.error = Some(error),
                Ok(bytes) => {
                    row.bytes = bytes.len();
                    for _ in 0..rounds {
                        let start = Instant::now();
                        let restored = if codec == "rmp" {
                            Self::deserialize_cache(&bytes).map_err(|error| error.to_string())
                        } else {
                            deserialize_pot_snapshot(&bytes).map_err(|error| error.to_string())
                        };
                        match restored {
                            Err(error) => {
                                row.error = Some(error);
                                break;
                            }
                            Ok(restored) => {
                                row.decode_ms.push(start.elapsed().as_millis());
                                for &krate in base_db::all_crates(self).iter() {
                                    assert_eq!(
                                        hir::crate_def_map(self, krate),
                                        hir::crate_def_map(&restored, krate)
                                    );
                                }
                            }
                        }
                    }
                }
            }
            rows.push(row);
        }
        rows
    }
    /// Serialize with all snapshots dropped and no concurrent database readers.
    /// This format is specific to the exact rust-analyzer executable.
    pub fn serialize_cache(&mut self) -> Result<Vec<u8>, rmp_serde::encode::Error> {
        let salsa = rmp_serde::to_vec(&<dyn salsa::Database>::as_serialize(self))?;
        rmp_serde::to_vec(&SnapshotRef {
            salsa: &salsa,
            files: &self.files,
            crates_map: &self.crates_map,
        })
    }

    /// Restore into fresh storage, never into an already initialized database.
    /// File/source-root IDs in the caller's VFS must match the saved manifest.
    pub fn deserialize_cache(bytes: &[u8]) -> Result<Self, rmp_serde::decode::Error> {
        Self::deserialize_cache_with_events(bytes, None)
    }

    /// Restore with an optional Salsa event observer for cache-reuse diagnostics.
    pub fn deserialize_cache_with_events(
        bytes: &[u8],
        events: Option<Box<dyn Fn(salsa::Event) + Send + Sync + 'static>>,
    ) -> Result<Self, rmp_serde::decode::Error> {
        let snapshot: Snapshot<'_> = rmp_serde::from_slice(bytes)?;
        let mut db = Self {
            storage: ManuallyDrop::new(salsa::Storage::new(events)),
            files: triomphe::Arc::new(snapshot.files),
            crates_map: triomphe::Arc::new(snapshot.crates_map),
            nonce: Nonce::new(),
        };
        <dyn salsa::Database>::deserialize(
            &mut db,
            &mut rmp_serde::Deserializer::from_read_ref(snapshot.salsa),
        )?;
        // Salsa 0.26 initializes a tracked function's database view caster on
        // first invocation, not when its memo is deserialized. Initialize the
        // persisted ItemTree function before a later revision validates a
        // DefMap's dependency edge into it. A warmed snapshot hits this memo.
        db.initialize_cache_queries();
        Ok(db)
    }

    fn initialize_cache_queries(&self) {
        #[cfg(feature = "cache-item-trees")]
        if let Some(&krate) = base_db::all_crates(self).first() {
            self.file_item_tree(krate.root_file_id(self).into(), krate);
        }
    }
}

#[cfg(feature = "cache-codec-bench")]
fn deserialize_pot_snapshot(bytes: &[u8]) -> Result<RootDatabase, pot::Error> {
    // from_slice constructs Pot's transient (borrowing) symbol table, unlike
    // the persistent session SymbolMap which can require owned string keys.
    struct DatabaseValue(RootDatabase);
    impl<'de> Deserialize<'de> for DatabaseValue {
        fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
            let mut db = RootDatabase {
                storage: ManuallyDrop::new(salsa::Storage::default()),
                files: Default::default(),
                crates_map: Default::default(),
                nonce: Nonce::new(),
            };
            <dyn salsa::Database>::deserialize(&mut db, deserializer)?;
            Ok(Self(db))
        }
    }
    let snapshot: Snapshot<'_> = pot::from_slice(bytes)?;
    let mut db = pot::from_slice::<DatabaseValue>(snapshot.salsa)?.0;
    db.files = triomphe::Arc::new(snapshot.files);
    db.crates_map = triomphe::Arc::new(snapshot.crates_map);
    db.initialize_cache_queries();
    Ok(db)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(feature = "cache-codec-bench")]
    #[test]
    fn codec_benchmark_reports_roundtrip_and_incompatibility() {
        use test_fixture::WithFixture;
        let mut db = RootDatabase::with_files(
            "//- /core/lib.rs crate:core library\n#![no_core]\npub struct Sentinel;",
        );
        hir::crate_def_map(&db, base_db::all_crates(&db)[0]);
        let rows = db.benchmark_cache_codecs(2);
        assert_eq!(rows.len(), 2);
        for row in rows {
            if row.codec == "pot" {
                // Salsa 0.26.2 CycleHeads serializes an unknown-length
                // sequence, which Pot 3.0.1 does not support. Report that
                // incompatibility instead of presenting a bogus speed result.
                assert!(
                    row.error.as_deref().is_some_and(|e| e.contains("unknown size")),
                    "{row:?}"
                );
                assert!(row.decode_ms.is_empty());
            } else {
                assert!(row.error.is_none(), "{row:?}");
                assert!(row.bytes > 0);
                assert_eq!(row.decode_ms.len(), 2);
            }
        }
    }

    #[test]
    fn snapshot_borrows_its_salsa_buffer() {
        let bytes = RootDatabase::default().serialize_cache().unwrap();
        let snapshot: Snapshot<'_> = rmp_serde::from_slice(&bytes).unwrap();
        let outer = bytes.as_ptr_range();
        let inner = snapshot.salsa.as_ptr_range();
        assert!(
            inner.start >= outer.start && inner.end <= outer.end,
            "snapshot decoding must not allocate/copy a second Salsa buffer"
        );
    }
}
