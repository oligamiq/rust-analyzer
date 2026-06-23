#[cfg(target_os = "wasi")]
pub mod ffi {
    use std::io;
    use std::process::Command;

    #[link(wasm_import_module = "__wasip1_vfs-host")]
    unsafe extern "C" {
        fn host_run_cargo(
            req_ptr: *const u8,
            req_len: usize,
            out_stdout_ptr: *mut *mut u8,
            out_stdout_len: *mut usize,
            out_stderr_ptr: *mut *mut u8,
            out_stderr_len: *mut usize,
            out_status: *mut i32,
        ) -> u32;

        fn host_free_memory(ptr: *mut u8, len: usize);
    }

    #[derive(serde::Serialize)]
    struct CargoRequest {
        args: Vec<String>,
        envs: std::collections::HashMap<String, String>,
        cwd: Option<String>,
    }

    pub struct WasiCargoOutput {
        pub status_success: bool,
        pub stdout: Vec<u8>,
        pub stderr: Vec<u8>,
    }

    pub fn invoke_cargo(cmd: &Command) -> io::Result<WasiCargoOutput> {
        let mut args = Vec::new();
        args.push(cmd.get_program().to_string_lossy().to_string());
        for arg in cmd.get_args() {
            args.push(arg.to_string_lossy().to_string());
        }

        let mut envs = std::collections::HashMap::new();
        for (k, v) in cmd.get_envs() {
            if let Some(v) = v {
                envs.insert(k.to_string_lossy().to_string(), v.to_string_lossy().to_string());
            }
        }

        let cwd = cmd.get_current_dir().map(|p| p.to_string_lossy().to_string());

        let req = CargoRequest { args, envs, cwd };
        let req_str = serde_json::to_string(&req)
            .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;

        let mut stdout_ptr: *mut u8 = std::ptr::null_mut();
        let mut stdout_len: usize = 0;
        let mut stderr_ptr: *mut u8 = std::ptr::null_mut();
        let mut stderr_len: usize = 0;
        let mut status: i32 = 0;

        let res = unsafe {
            host_run_cargo(
                req_str.as_ptr(),
                req_str.len(),
                &mut stdout_ptr,
                &mut stdout_len,
                &mut stderr_ptr,
                &mut stderr_len,
                &mut status,
            )
        };

        if res != 0 {
            return Err(io::Error::new(io::ErrorKind::Other, "host_run_cargo failed"));
        }

        let stdout = if stdout_ptr.is_null() || stdout_len == 0 {
            Vec::new()
        } else {
            let s = unsafe { std::slice::from_raw_parts(stdout_ptr, stdout_len) }.to_vec();
            unsafe { host_free_memory(stdout_ptr, stdout_len) };
            s
        };

        let stderr = if stderr_ptr.is_null() || stderr_len == 0 {
            Vec::new()
        } else {
            let s = unsafe { std::slice::from_raw_parts(stderr_ptr, stderr_len) }.to_vec();
            unsafe { host_free_memory(stderr_ptr, stderr_len) };
            s
        };

        Ok(WasiCargoOutput {
            status_success: status == 0,
            stdout,
            stderr,
        })
    }
}