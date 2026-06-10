const fs = require('fs');
console.log("Reading...");
const wasmBuffer = fs.readFileSync('target/wasm32-wasip1-threads/release/rust-analyzer.wasm');
console.log("Compiling...");
WebAssembly.compile(wasmBuffer).then(() => {
    console.log("Compiled!");
}).catch(console.error);
