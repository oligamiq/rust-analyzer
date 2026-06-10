use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};

pub struct TempDir {
    delete_on_drop: bool,
    panic_on_delete_err: bool,
    path_buf: PathBuf,
}

static INTERNAL_COUNTER: AtomicUsize = AtomicUsize::new(0);

impl TempDir {
    pub fn new() -> Result<Self, std::io::Error> {
        Self::with_prefix("t")
    }

    pub fn with_prefix(prefix: impl AsRef<str>) -> Result<Self, std::io::Error> {
        #[cfg(not(target_os = "wasi"))]
        let base = std::env::temp_dir();
        #[cfg(target_os = "wasi")]
        let base = PathBuf::from("/tmp");

        #[cfg(not(target_os = "wasi"))]
        let pid = std::process::id();
        #[cfg(target_os = "wasi")]
        let pid = 0;

        loop {
            let path_buf = base.join(format!(
                "{}{:x}-{:x}",
                prefix.as_ref(),
                pid,
                INTERNAL_COUNTER.fetch_add(1, Ordering::AcqRel),
            ));
            match std::fs::create_dir(&path_buf) {
                Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {}
                Err(e) => {
                    return Err(std::io::Error::new(
                        e.kind(),
                        format!("error creating directory {path_buf:?}: {e}"),
                    ))
                }
                Ok(()) => {
                    return Ok(Self {
                        delete_on_drop: true,
                        panic_on_delete_err: false,
                        path_buf,
                    })
                }
            }
        }
    }

    pub fn path(&self) -> &Path {
        &self.path_buf
    }

    pub fn child(&self, name: impl AsRef<Path>) -> PathBuf {
        self.path_buf.join(name)
    }

    pub fn cleanup(self) -> Result<(), std::io::Error> {
        std::fs::remove_dir_all(&self.path_buf)
    }

    pub fn panic_on_cleanup_error(mut self) -> Self {
        self.panic_on_delete_err = true;
        self
    }

    pub fn leak(mut self) {
        self.delete_on_drop = false;
    }

    pub fn dont_delete_on_drop(mut self) -> Self {
        self.delete_on_drop = false;
        self
    }
}

impl Drop for TempDir {
    fn drop(&mut self) {
        if self.delete_on_drop {
            let res = std::fs::remove_dir_all(&self.path_buf);
            if self.panic_on_delete_err {
                res.unwrap();
            }
        }
    }
}

impl AsRef<Path> for TempDir {
    fn as_ref(&self) -> &Path {
        self.path()
    }
}