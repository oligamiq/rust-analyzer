const { Worker } = require('worker_threads');
const fs = require('fs');
const wasmBuffer = fs.readFileSync('target/wasm32-wasip1-threads/release/rust-analyzer.wasm');
WebAssembly.compile(wasmBuffer).then(mod => {
    console.log("Compiled. Posting to worker...");
    const w = new Worker("const { parentPort } = require('worker_threads'); parentPort.on('message', () => console.log('Worker received msg!'));", { eval: true });
    w.postMessage(mod);
    console.log("Posted!");
});
