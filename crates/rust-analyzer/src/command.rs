//! Utilities for running a cargo command like `cargo check` or `cargo test` in a separate thread
//! and parse its stdout/stderr.

use std::{
    ffi::OsString,
    fmt,
    io::{self, BufWriter, Write},
    marker::PhantomData,
    path::PathBuf,
    process::{ChildStderr, ChildStdout, Command, Stdio},
};

use anyhow::Context;
use crossbeam_channel::Sender;
use paths::Utf8PathBuf;
use process_wrap::std::{StdChildWrapper, StdCommandWrap};
use stdx::process::streaming_output;

/// This trait abstracts parsing one line of JSON output into a Rust
/// data type.
///
/// This is useful for `cargo check` output, `cargo test` output, as
/// well as custom discover commands.
pub(crate) trait JsonLinesParser<T>: Send + 'static {
    fn from_line(&self, line: &str, error: &mut String) -> Option<T>;
    fn from_eof(&self) -> Option<T>;
}

struct CommandActor<T> {
    parser: Box<dyn JsonLinesParser<T>>,
    sender: Sender<T>,
    stdout: Box<dyn io::Read + Send + 'static>,
    stderr: Box<dyn io::Read + Send + 'static>,
}

impl<T: Sized + Send + 'static> CommandActor<T> {
    fn new(
        parser: impl JsonLinesParser<T>,
        sender: Sender<T>,
        stdout: impl io::Read + Send + 'static,
        stderr: impl io::Read + Send + 'static,
    ) -> Self {
        let parser = Box::new(parser);
        CommandActor { parser, sender, stdout: Box::new(stdout), stderr: Box::new(stderr) }
    }
}

impl<T: Sized + Send + 'static> CommandActor<T> {
    fn run(self, outfile: Option<Utf8PathBuf>) -> io::Result<(bool, String)> {
        // We manually read a line at a time, instead of using serde's
        // stream deserializers, because the deserializer cannot recover
        // from an error, resulting in it getting stuck, because we try to
        // be resilient against failures.
        //
        // Because cargo only outputs one JSON object per line, we can
        // simply skip a line if it doesn't parse, which just ignores any
        // erroneous output.

        let mut stdout = outfile.as_ref().and_then(|path| {
            _ = std::fs::create_dir_all(path);
            Some(BufWriter::new(std::fs::File::create(path.join("stdout")).ok()?))
        });
        let mut stderr = outfile.as_ref().and_then(|path| {
            _ = std::fs::create_dir_all(path);
            Some(BufWriter::new(std::fs::File::create(path.join("stderr")).ok()?))
        });

        let mut stdout_errors = String::new();
        let mut stderr_errors = String::new();
        let mut read_at_least_one_stdout_message = false;
        let mut read_at_least_one_stderr_message = false;
        let process_line = |line: &str, error: &mut String| {
            // Try to deserialize a message from Cargo or Rustc.
            if let Some(t) = self.parser.from_line(line, error) {
                self.sender.send(t).unwrap();
                true
            } else {
                false
            }
        };

        use std::io::BufRead;
        let mut stdout_reader = std::io::BufReader::new(self.stdout);
        let mut stderr_reader = std::io::BufReader::new(self.stderr);
        let mut out_line = String::new();
        let mut err_line = String::new();

        while let Ok(n) = stdout_reader.read_line(&mut out_line) {
            if n == 0 { break; }
            let line = out_line.trim_end();
            if let Some(stdout) = &mut stdout {
                _ = stdout.write_all(line.as_bytes());
                _ = stdout.write_all(b"\n");
            }
            if process_line(line, &mut stdout_errors) {
                read_at_least_one_stdout_message = true;
            }
            out_line.clear();
        }

        while let Ok(n) = stderr_reader.read_line(&mut err_line) {
            if n == 0 { break; }
            let line = err_line.trim_end();
            if let Some(stderr) = &mut stderr {
                _ = stderr.write_all(line.as_bytes());
                _ = stderr.write_all(b"\n");
            }
            if process_line(line, &mut stderr_errors) {
                read_at_least_one_stderr_message = true;
            }
            err_line.clear();
        }

        if let Some(t) = self.parser.from_eof() {
            self.sender.send(t).unwrap();
        }

        let read_at_least_one_message =
            read_at_least_one_stdout_message || read_at_least_one_stderr_message;
        let mut error = stdout_errors;
        error.push_str(&stderr_errors);
        
        Ok((read_at_least_one_message, error))
    }
}

/// 'Join On Drop' wrapper for a child process.
///
/// This wrapper kills the process when the wrapper is dropped.
struct JodGroupChild(Option<Box<dyn StdChildWrapper>>);

impl Drop for JodGroupChild {
    fn drop(&mut self) {
        if let Some(child) = &mut self.0 {
            _ = child.kill();
            _ = child.wait();
        }
    }
}

/// A handle to a shell command, such as cargo for diagnostics (flycheck).
pub(crate) struct CommandHandle<T> {
    /// The handle to the actual child process. As we cannot cancel directly from with
    /// a read syscall dropping and therefore terminating the process is our best option.
    child: JodGroupChild,
    thread: stdx::thread::JoinHandle<io::Result<(bool, String)>>,
    program: OsString,
    arguments: Vec<OsString>,
    current_dir: Option<PathBuf>,
    _phantom: PhantomData<T>,
}

impl<T> fmt::Debug for CommandHandle<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("CommandHandle")
            .field("program", &self.program)
            .field("arguments", &self.arguments)
            .field("current_dir", &self.current_dir)
            .finish()
    }
}

impl<T: Sized + Send + 'static> CommandHandle<T> {
    pub(crate) fn spawn(
        mut command: Command,
        parser: impl JsonLinesParser<T>,
        sender: Sender<T>,
        out_file: Option<Utf8PathBuf>,
    ) -> anyhow::Result<Self> {
        #[cfg(target_os = "wasi")]
        if command.get_program() == "cargo" || command.get_program().to_string_lossy().ends_with("cargo") {
            let program = command.get_program().into();
            let arguments = command.get_args().map(|arg| arg.into()).collect::<Vec<OsString>>();
            let current_dir = command.get_current_dir().map(|arg| arg.to_path_buf());
            
            let thread = stdx::thread::Builder::new(stdx::thread::ThreadIntent::Worker, "CommandHandle")
                .spawn(move || {
                    let output = toolchain::wasi_cargo::ffi::invoke_cargo(&command).unwrap();
                    let stdout = std::io::Cursor::new(output.stdout);
                    let stderr = std::io::Cursor::new(output.stderr);
                    let mut actor = CommandActor::<T>::new(parser, sender, stdout, stderr);
                    actor.run(out_file)
                })
                .expect("failed to spawn thread");

            return Ok(CommandHandle {
                program,
                arguments,
                current_dir,
                child: JodGroupChild(None),
                thread,
                _phantom: PhantomData,
            });
        }

        command.stdout(Stdio::piped()).stderr(Stdio::piped()).stdin(Stdio::null());

        let program = command.get_program().into();
        let arguments = command.get_args().map(|arg| arg.into()).collect::<Vec<OsString>>();
        let current_dir = command.get_current_dir().map(|arg| arg.to_path_buf());

        let mut child = StdCommandWrap::from(command);
        #[cfg(unix)]
        child.wrap(process_wrap::std::ProcessSession);
        #[cfg(windows)]
        child.wrap(process_wrap::std::JobObject);
        let mut child = child
            .spawn()
            .map(|c| JodGroupChild(Some(c)))
            .with_context(|| "Failed to spawn command: {child:?}")?;

        let stdout = child.0.as_mut().unwrap().stdout().take().unwrap();
        let stderr = child.0.as_mut().unwrap().stderr().take().unwrap();

        let actor = CommandActor::<T>::new(parser, sender, stdout, stderr);
        let thread =
            stdx::thread::Builder::new(stdx::thread::ThreadIntent::Worker, "CommandHandle")
                .spawn(move || actor.run(out_file))
                .expect("failed to spawn thread");
        Ok(CommandHandle { program, arguments, current_dir, child, thread, _phantom: PhantomData })
    }

    pub(crate) fn cancel(mut self) {
        if let Some(child) = &mut self.child.0 {
            let _ = child.kill();
            let _ = child.wait();
        }
    }

    pub(crate) fn join(mut self) -> io::Result<()> {
        let exit_success = if let Some(child) = &mut self.child.0 {
            child.wait()?.success()
        } else {
            true
        };
        let (read_at_least_one_message, error) = self.thread.join()?;
        if read_at_least_one_message || exit_success {
            Ok(())
        } else {
            Err(io::Error::other(format!(
                "Cargo watcher failed, the command produced no valid metadata:\n{error}"
            )))
        }
    }

    pub(crate) fn has_exited(&mut self) -> bool {
        if let Some(child) = &mut self.child.0 {
            match child.try_wait() {
                Ok(Some(_exit_code)) => {
                    // We have an exit code.
                    true
                }
                Ok(None) => {
                    // Hasn't exited yet.
                    false
                }
                Err(_) => {
                    // Couldn't get an exit code. Assume that we've
                    // exited.
                    true
                }
            }
        } else {
            true
        }
    }
}
