import { Worker, isMainThread, parentPort } from 'worker_threads';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
}

globalThis.Worker = class extends Worker {
    constructor(url, options) {
        console.log(`[Polyfill] new Worker(${url})`);
        if (typeof url === 'string' && url.startsWith('blob:')) {
            // unlikely to be hit if URL.createObjectURL works
        }
        let workerUrl = url;
        if (typeof url === 'string' && url.startsWith('file://')) {
            workerUrl = new URL(url);
        } else if (typeof url === 'string' && path.isAbsolute(url)) {
            workerUrl = new URL('file://' + url);
        }
        super(workerUrl, options);

        this.on('message', (msg) => {
            if (typeof this.onmessage === 'function') {
                this.onmessage({ data: msg });
            }
        });
        
        // Ensure postMessage is compatible if needed, but worker_threads.Worker.postMessage is usually fine
    }
};

if (!isMainThread && parentPort) {
    globalThis.postMessage = (msg) => {
        console.log("[Polyfill] postMessage called:", msg);
        parentPort.postMessage(msg);
    };
    parentPort.on('message', (msg) => {
        console.log("[Polyfill] Worker received message");
        if (typeof globalThis.onmessage === 'function') {
            globalThis.onmessage({ data: msg });
        } else {
            console.log("[Polyfill] globalThis.onmessage is not a function!");
        }
    });
}

const OriginalBlob = globalThis.Blob;
if (!OriginalBlob) {
    globalThis.Blob = class Blob {
        constructor(parts) {
            this._parts = parts;
        }
    };
} else {
    globalThis.Blob = class Blob extends OriginalBlob {
        constructor(parts, options) {
            super(parts, options);
            this._parts = parts;
        }
    };
}

globalThis.URL.createObjectURL = function(blob) {
    const code = blob._parts ? blob._parts.join('') : '';
    const tempFile = path.join(os.tmpdir(), `worker_${Math.random().toString(36).slice(2)}.mjs`);
    fs.writeFileSync(tempFile, code);
    return 'file://' + tempFile;
};
