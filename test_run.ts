import { isMainThread, parentPort, Worker, workerData } from 'worker_threads';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

import './polyfills.mjs';

import { WASIFarm, WASIFarmAnimal, thread_spawn_on_worker } from '@oligami/browser_wasi_shim-threads';
import { Fd, PreopenDirectory, OpenFile, File } from '@bjorn3/browser_wasi_shim';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!isMainThread) {
    if (workerData?.is_main_runner) {
        const run = async () => {
            const { wasi_farm_refs_object, wasmModule, args, env, projectPath } = workerData;
            console.log("[Main Runner] Creating WASIFarmAnimal...");
            const animal = new WASIFarmAnimal(wasi_farm_refs_object, args, env, {
                can_thread_spawn: true,
                thread_spawn_worker_url: 'file://' + __filename.replace('.ts', '.mjs'),
                worker_background_worker_url: new URL('file://' + path.resolve(__dirname, 'custom_worker_background.mjs')) as any,
                thread_spawn_wasm: wasmModule
            });
            const patchFdRead = () => {
                const origFdRead = animal.wasiImport.fd_read.bind(animal.wasiImport);
                animal.wasiImport.fd_read = (fd: number, iovs_ptr: number, iovs_len: number, nread_ptr: number) => {
                    const ret = origFdRead(fd, iovs_ptr, iovs_len, nread_ptr);
                    if (fd === 0 && ret === 0) {
                        const buffer = new DataView(animal.inst.exports.memory.buffer);
                        const nread = buffer.getUint32(nread_ptr, true);
                        if (nread === 0) {
                            // EOF reached on stdin. Block this WASM thread indefinitely so it doesn't close!
                            console.log(`[WASM Thread] stdin EOF reached. Blocking to keep alive...`);
                            const sleepBuf = new Int32Array(new SharedArrayBuffer(4));
                            Atomics.wait(sleepBuf, 0, 0); // Wait forever
                        }
                    }
                    return ret;
                };
            };
            patchFdRead();

            console.log("[Main Runner] Starting WASM on worker thread...");
            try {
                console.log("[Main Runner] Calling async_start_on_thread...");
                const exitCode = await animal.async_start_on_thread();
                console.log("[Main Runner] async_start_on_thread returned", exitCode);
                parentPort?.postMessage({ type: 'exit', code: exitCode });
            } catch (e: any) {
                console.error("[Main Runner] Caught error:", e.stack || e);
                parentPort?.postMessage({ type: 'error', error: e.message || e.toString() });
            }
        };
        run();
    } else {
        parentPort?.on('message', (msg) => {
            console.log("[Spawned Worker] Received message!");
            thread_spawn_on_worker(msg, WebAssembly.instantiate.bind(WebAssembly), (animal: any) => {
                const origGetShareMemory = animal.get_share_memory.bind(animal);
                animal.get_share_memory = () => {
                    const mem = origGetShareMemory();
                    return {
                        ...mem,
                        host_run_cargo: (
                            req_ptr: number, req_len: number,
                            out_stdout_ptr: number, out_stdout_len: number,
                            out_stderr_ptr: number, out_stderr_len: number,
                            out_status: number
                        ) => {
                            const memoryBuffer = animal.inst.exports.memory.buffer;
                            const reqStr = new TextDecoder().decode(new Uint8Array(memoryBuffer, req_ptr, req_len));
                            const req = JSON.parse(reqStr);

                            const projectPath = path.resolve(__dirname, 'dummy_test_project');

                            console.log(`[Worker] Running cargo:`, req.args);
                            let localCargoPath = req.args[0] || "cargo";
                            if (localCargoPath.endsWith("cargo")) {
                                if (process.env.CARGO_HOME) {
                                    localCargoPath = path.join(process.env.CARGO_HOME, "bin", "cargo");
                                    if (!fs.existsSync(localCargoPath)) localCargoPath = "cargo";
                                }
                                if (localCargoPath === "cargo") {
                                    const homeCargo = path.join(os.homedir(), ".cargo", "bin", "cargo");
                                    if (fs.existsSync(homeCargo)) {
                                        localCargoPath = homeCargo;
                                    }
                                }
                            } else if (localCargoPath.endsWith("rustc")) {
                                if (process.env.CARGO_HOME) {
                                    localCargoPath = path.join(process.env.CARGO_HOME, "bin", "rustc");
                                    if (!fs.existsSync(localCargoPath)) localCargoPath = "rustc";
                                }
                                if (localCargoPath === "rustc") {
                                    const homeRustc = path.join(os.homedir(), ".cargo", "bin", "rustc");
                                    if (fs.existsSync(homeRustc)) {
                                        localCargoPath = homeRustc;
                                    }
                                }
                            }
                            
                            // To prevent blocking the main thread (which is holding stdin), 
                            // we do spawnSync directly here. This worker is not the main thread.
                            // Always run cargo in the dummy test project root
                            const cwd = projectPath;

                            const args = req.args.slice(1).map((arg: string) => {
                                if (arg === '/Cargo.toml') {
                                    return path.join(projectPath, 'Cargo.toml');
                                }
                                if (arg.startsWith('/home/oligami')) {
                                    return arg; // Already absolute on host
                                }
                                return arg;
                            });

                            const res = spawnSync(localCargoPath, args, {
                                env: { ...process.env, ...req.envs },
                                cwd
                            });

                            console.log(`[Worker] Cargo exited with ${res.status}`);
                            if (res.error) console.error(`[Worker] Cargo error:`, res.error);

                            const stdoutBuf = res.stdout || Buffer.alloc(0);
                            const stderrBuf = res.stderr || Buffer.alloc(0);

                            if (req.args[1] === 'metadata') {
                                console.log(`[Worker] Cargo metadata stdout length: ${stdoutBuf.length}`);
                                console.log(`[Worker] Cargo metadata stderr length: ${stderrBuf.length}`);
                                if (stderrBuf.length > 0) {
                                    console.log(`[Worker] Cargo metadata stderr:\n${stderrBuf.toString()}`);
                                }
                            }

                            const exports = animal.inst.exports;
                            const memory = exports.memory;
                            const totalBytes = stdoutBuf.length + stderrBuf.length;
                            const pagesNeeded = Math.ceil(totalBytes / 65536);
                            
                            let out_stdout = 0;
                            let out_stderr = 0;
                            
                            if (pagesNeeded > 0) {
                                const oldPages = memory.grow(pagesNeeded);
                                const ptr = oldPages * 65536;
                                out_stdout = ptr;
                                out_stderr = ptr + stdoutBuf.length;
                                
                                const memView = new Uint8Array(memory.buffer);
                                memView.set(stdoutBuf, out_stdout);
                                memView.set(stderrBuf, out_stderr);
                            }

                            const dataView = new DataView(exports.memory.buffer);
                            dataView.setUint32(out_stdout_ptr, out_stdout, true);
                            dataView.setUint32(out_stdout_len, stdoutBuf.length, true);
                            dataView.setUint32(out_stderr_ptr, out_stderr, true);
                            dataView.setUint32(out_stderr_len, stderrBuf.length, true);
                            dataView.setInt32(out_status, res.status || 0, true);

                            return 0;
                        },
                        host_free_memory: (ptr: number, len: number) => {
                            // Memory leak is fine for test
                        }
                    };
                };

                const origFdRead = animal.wasiImport.fd_read.bind(animal.wasiImport);
                animal.wasiImport.fd_read = (fd: number, iovs_ptr: number, iovs_len: number, nread_ptr: number) => {
                    const ret = origFdRead(fd, iovs_ptr, iovs_len, nread_ptr);
                    if (fd === 0 && ret === 0) {
                        const buffer = new DataView(animal.inst.exports.memory.buffer);
                        const nread = buffer.getUint32(nread_ptr, true);
                        if (nread === 0) {
                            console.log(`[WASM Thread] stdin EOF reached. Blocking to keep alive...`);
                            const sleepBuf = new Int32Array(new SharedArrayBuffer(4));
                            Atomics.wait(sleepBuf, 0, 0); // Wait forever
                        }
                    }
                    return ret;
                };

                const origPollOneoff = animal.wasiImport.poll_oneoff.bind(animal.wasiImport);
                animal.wasiImport.poll_oneoff = (in_ptr: number, out_ptr: number, nsubscriptions: number, stored_events_count_ptr: number) => {
                    try {
                        return origPollOneoff(in_ptr, out_ptr, nsubscriptions, stored_events_count_ptr);
                    } catch (e: any) {
                        if (e instanceof TypeError && e.message.includes("Cannot mix BigInt")) {
                            if (nsubscriptions !== 1) return 28; // EINVAL
                            const buffer = new DataView(animal.inst.exports.memory.buffer);
                            const userdata = buffer.getBigUint64(in_ptr, true);
                            const eventtype = buffer.getUint8(in_ptr + 8);
                            const clockid = buffer.getUint32(in_ptr + 16, true);
                            const timeout = buffer.getBigUint64(in_ptr + 24, true);
                            const precision = buffer.getBigUint64(in_ptr + 32, true);
                            const flags = buffer.getUint16(in_ptr + 40, true);

                            let getNow = () => BigInt(Date.now()) * 1000000n;
                            let endTime = timeout;
                            if ((flags & 1) === 0) {
                                endTime += getNow();
                            }
                            endTime -= precision;

                            const remainingNs = endTime - getNow();
                            if (remainingNs > 0n) {
                                const remainingMs = Number(remainingNs / 1000000n);
                                if (remainingMs > 0) {
                                    const sleepBuf = new Int32Array(new SharedArrayBuffer(4));
                                    Atomics.wait(sleepBuf, 0, 0, remainingMs);
                                }
                            }
                            
                            buffer.setBigUint64(out_ptr, userdata, true);
                            buffer.setUint16(out_ptr + 8, 0, true); // error
                            buffer.setUint8(out_ptr + 10, eventtype); // type
                            buffer.setUint32(stored_events_count_ptr, 1, true);
                            return 0; // SUCCESS
                        }
                        throw e;
                    }
                };
            });
        });
    }
} else {
    async function main() {
        const wasmPath = path.resolve(__dirname, 'target/wasm32-wasip1-threads/release/rust-analyzer.wasm');
        const wasmBuffer = fs.readFileSync(wasmPath);

        const projectPath = path.resolve(__dirname, 'dummy_test_project');
        const cargoTomlContent = fs.readFileSync(path.join(projectPath, 'Cargo.toml'));
        const mainRsContent = fs.readFileSync(path.join(projectPath, 'src/main.rs'));

        const dirMap = new Map();
        dirMap.set("Cargo.toml", new File(cargoTomlContent));
        const srcMap = new Map();
        srcMap.set("main.rs", new File(mainRsContent));
        dirMap.set("src", new PreopenDirectory("src", srcMap));

        const dir = new PreopenDirectory("/", dirMap);
        const tmpDir = new PreopenDirectory("/tmp", new Map());
        const sysrootPath = process.env.RUSTUP_HOME || path.join(os.homedir(), ".rustup");
        const rustupDir = new PreopenDirectory("/home/oligami/.rustup", new Map()); // This needs to be a real mapped directory or we need to intercept file reads to host...
        
        // Wait! The WASI shim doesn't support mounting arbitrary host directories to `PreopenDirectory` easily.
        // It's all in-memory unless we hook into `unknown_fn`.
        // Alternatively, rust-analyzer doesn't strictly need `rust-src` for *all* diagnostics, but it complains.
        // To fix this test, we can just intercept `sysroot` queries. 
        // Or we can mock the `rust-src` in `test_run.ts`.
        // It's actually easier to just let it complain about `rust-src` and see if it still reports the dummy project error!
        // Does the dummy project error come through despite the `rust-src` error? Let's check `STDOUT`.
        // The last STDOUT had Content-Length 620, but no diagnostics for `main.rs`.
        // Oh wait, `dummy_test_project/src/main.rs` requires `i32` and string literal, which requires core.
        // So rust-analyzer needs `core` to report the type mismatch!
        // So we MUST have `rust-src`.

        const initRequest = {
            jsonrpc: '2.0', id: 1, method: 'initialize',
            params: {
                processId: null,
                rootUri: `file://${projectPath}`,
                initializationOptions: {
                    cargo: {
                        sysroot: null
                    }
                },
                capabilities: { textDocument: { publishDiagnostics: { relatedInformation: true } } },
                workspaceFolders: [ { uri: `file://${projectPath}`, name: 'dummy_test_project' } ]
            }
        };
        
        function createMessage(message: any): Uint8Array {
            const json = JSON.stringify(message);
            const str = `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`;
            return new TextEncoder().encode(str);
        }
        
        const req1 = createMessage(initRequest);
        
        const initializedNotification = {
            jsonrpc: '2.0', method: 'initialized', params: {}
        };
        const req2 = createMessage(initializedNotification);

        const didOpenRequest = {
            jsonrpc: '2.0', method: 'textDocument/didOpen',
            params: {
                textDocument: { uri: `file://${path.join(projectPath, 'src/main.rs')}`, languageId: 'rust', version: 1, text: mainRsContent.toString() }
            }
        };
        const req3 = createMessage(didOpenRequest);

        const totalStdin = new Uint8Array(req1.length + req2.length + req3.length);
        totalStdin.set(req1, 0);
        totalStdin.set(req2, req1.length);
        totalStdin.set(req3, req1.length + req2.length);
        
        const stdinFile = new OpenFile(new File(totalStdin));
        
        const fds = [
            stdinFile, // stdin
            new OpenFile(new File(new Uint8Array([]))), // stdout
            new OpenFile(new File(new Uint8Array([]))), // stderr
            dir,
            tmpDir
        ];

        console.log("Creating WASIFarm...");
        const farm = new WASIFarm(fds[0] as Fd, fds[1] as Fd, fds[2] as Fd, [fds[3] as Fd, fds[4] as Fd], {
            unknown_fn: async (arg: any) => {
                console.log(`[Main Thread] Running cargo:`, arg.args);
                let localCargoPath = "cargo";
                if (process.env.CARGO_HOME) {
                    localCargoPath = path.join(process.env.CARGO_HOME, "bin", "cargo");
                    if (!fs.existsSync(localCargoPath)) localCargoPath = "cargo";
                }
                const res = spawnSync(localCargoPath, arg.args.slice(1), {
                    env: { ...process.env, ...arg.envs },
                    cwd: projectPath
                });
                return {
                    status: res.status || 0,
                    stdout: (res.stdout || Buffer.alloc(0)).toString('base64'),
                    stderr: (res.stderr || Buffer.alloc(0)).toString('base64')
                };
            }
        });

        console.log("Compiling WASM...");
        const WebAssemblyAny = (globalThis as any).WebAssembly;
        const wasmModule = await WebAssemblyAny.compile(wasmBuffer);
        console.log("WASM compiled!");

        console.log("Spawning Main Runner Worker...");
        const worker = new Worker(new URL('file://' + __filename.replace('.ts', '.mjs')), {
            workerData: {
                is_main_runner: true,
                wasi_farm_refs_object: farm.get_ref(),
                wasmModule,
                args: ["rust-analyzer"],
                env: ["CARGO_HOME=/", "RUSTUP_HOME=/", "TMPDIR=/tmp", "TEMP=/tmp", "TMP=/tmp", "RUST_BACKTRACE=full"],
                projectPath
            }
        });

        const flushOutput = () => {
            const stdoutFile = (fds[1] as any).file;
            const stderrFile = (fds[2] as any).file;
            if (stdoutFile.data.length > lastStdout) {
                const stdoutStr = new TextDecoder().decode(stdoutFile.data.subarray(lastStdout));
                console.log("STDOUT:", stdoutStr);
                lastStdout = stdoutFile.data.length;
            }
            if (stderrFile.data.length > lastStderr) {
                const stderrStr = new TextDecoder().decode(stderrFile.data.subarray(lastStderr));
                console.log("STDERR:", stderrStr);
                lastStderr = stderrFile.data.length;
            }
        };

        worker.on('message', (msg) => {
            flushOutput();
            if (msg.type === 'exit') {
                console.log("WASM exited with code", msg.code);
                process.exit(msg.code);
            } else if (msg.type === 'error') {
                console.error("WASM threw an error:", msg.error);
                process.exit(1);
            }
        });

        worker.on('error', (err) => {
            flushOutput();
            console.error("Worker error:", err);
            process.exit(1);
        });

        let lastStdout = 0;
        let lastStderr = 0;
        const checkOutput = setInterval(flushOutput, 1000);

        // stop after 60s
        setTimeout(() => {
            clearInterval(checkOutput);
            console.log("Timeout reached, exiting test script.");
            process.exit(0);
        }, 60000);
    }
    main();
}