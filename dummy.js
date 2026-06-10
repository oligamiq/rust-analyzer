const { Worker } = require('worker_threads');
const w = new Worker('/home/oligami/projects/rust-analyzer/test_run.ts');
w.on('message', console.log);
w.on('error', console.error);
w.on('exit', console.log);
