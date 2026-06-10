console.log("[Worker Wrapper] Starting...");
import './polyfills.mjs';
import './node_modules/@oligami/browser_wasi_shim-threads/dist/worker_background_worker.min.js';
console.log("[Worker Wrapper] Loaded.");