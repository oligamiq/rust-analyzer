use std::{env, fs, path::PathBuf, process::Command};

fn main() {
    set_rerun();
    set_commit_info();
    set_build_id();
    if option_env!("CFG_RELEASE").is_none() {
        println!("cargo:rustc-env=POKE_RA_DEVS=1");
    }
}

fn set_build_id() {
    let mut hasher = blake3::Hasher::new();
    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap());
    let root = manifest_dir.parent().unwrap().parent().unwrap();
    // Include uncommitted/new sources too. The serde schema depends on all
    // analysis crates, not just the server crate or the latest git commit.
    let mut paths = vec![root.join("Cargo.toml"), root.join("Cargo.lock")];
    fn collect(dir: &std::path::Path, paths: &mut Vec<PathBuf>) {
        println!("cargo:rerun-if-changed={}", dir.display());
        for entry in fs::read_dir(dir).expect("read cache schema sources") {
            let entry = entry.unwrap();
            let kind = entry.file_type().unwrap();
            if kind.is_dir() {
                if entry.file_name() != "target" {
                    collect(&entry.path(), paths);
                }
            } else if kind.is_file() {
                paths.push(entry.path());
            }
        }
    }
    collect(&root.join("crates"), &mut paths);
    for entry in fs::read_dir(root).unwrap().flatten() {
        if entry.file_name().to_string_lossy().starts_with("dummy_") && entry.path().is_dir() {
            collect(&entry.path(), &mut paths);
        }
    }
    paths.sort();
    for path in paths {
        let relative = path.strip_prefix(root).unwrap().to_string_lossy();
        let bytes = fs::read(&path).expect("read cache schema input");
        hasher.update(&(relative.len() as u64).to_le_bytes());
        hasher.update(relative.as_bytes());
        hasher.update(&(bytes.len() as u64).to_le_bytes());
        hasher.update(&bytes);
        println!("cargo:rerun-if-changed={}", path.display());
    }
    let compiler = Command::new(env::var("RUSTC").unwrap()).arg("-vV").output().unwrap();
    assert!(compiler.status.success());
    hasher.update(&compiler.stdout);
    let mut settings: Vec<_> = env::vars()
        .filter(|(key, _)| {
            key.starts_with("CARGO_FEATURE_")
                || key.starts_with("CARGO_CFG_")
                || matches!(key.as_str(), "TARGET" | "CARGO_ENCODED_RUSTFLAGS")
        })
        .collect();
    settings.sort();
    for (key, value) in settings {
        hasher.update(key.as_bytes());
        hasher.update(&[0]);
        hasher.update(value.as_bytes());
        hasher.update(&[0]);
    }
    println!("cargo:rustc-env=RA_BUILD_ID={}", hasher.finalize().to_hex());
}

fn set_rerun() {
    println!("cargo:rerun-if-env-changed=CFG_RELEASE");

    let mut manifest_dir = PathBuf::from(
        env::var("CARGO_MANIFEST_DIR").expect("`CARGO_MANIFEST_DIR` is always set by cargo."),
    );

    while manifest_dir.parent().is_some() {
        let head_ref = manifest_dir.join(".git/HEAD");
        if head_ref.exists() {
            println!("cargo:rerun-if-changed={}", head_ref.display());
            return;
        }

        manifest_dir.pop();
    }

    println!("cargo:warning=Could not find `.git/HEAD` from manifest dir!");
}

fn set_commit_info() {
    #[allow(clippy::disallowed_methods)]
    let output = match Command::new("git")
        .arg("log")
        .arg("-1")
        .arg("--date=short")
        .arg("--format=%H %h %cd")
        .output()
    {
        Ok(output) if output.status.success() => output,
        _ => return,
    };
    let stdout = String::from_utf8(output.stdout).unwrap();
    let mut parts = stdout.split_whitespace();
    let mut next = || parts.next().unwrap();
    println!("cargo:rustc-env=RA_COMMIT_HASH={}", next());
    println!("cargo:rustc-env=RA_COMMIT_SHORT_HASH={}", next());
    println!("cargo:rustc-env=RA_COMMIT_DATE={}", next())
}
