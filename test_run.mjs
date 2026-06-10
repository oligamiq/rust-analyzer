// test_run.ts
import { isMainThread as isMainThread2, parentPort as parentPort2, Worker as Worker3, workerData } from "worker_threads";
import * as path2 from "path";
import * as os2 from "os";
import * as fs2 from "fs";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

// polyfills.mjs
import { Worker as Worker2, isMainThread, parentPort } from "worker_threads";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
if (typeof globalThis.self === "undefined") {
  globalThis.self = globalThis;
}
globalThis.Worker = class extends Worker2 {
  constructor(url2, options) {
    console.log(`[Polyfill] new Worker(${url2})`);
    if (typeof url2 === "string" && url2.startsWith("blob:")) {
    }
    let workerUrl = url2;
    if (typeof url2 === "string" && url2.startsWith("file://")) {
      workerUrl = new URL(url2);
    } else if (typeof url2 === "string" && path.isAbsolute(url2)) {
      workerUrl = new URL("file://" + url2);
    }
    super(workerUrl, options);
    this.on("message", (msg) => {
      if (typeof this.onmessage === "function") {
        this.onmessage({ data: msg });
      }
    });
  }
};
if (!isMainThread && parentPort) {
  globalThis.postMessage = (msg) => {
    console.log("[Polyfill] postMessage called:", msg);
    parentPort.postMessage(msg);
  };
  parentPort.on("message", (msg) => {
    console.log("[Polyfill] Worker received message");
    if (typeof globalThis.onmessage === "function") {
      globalThis.onmessage({ data: msg });
    } else {
      console.log("[Polyfill] globalThis.onmessage is not a function!");
    }
  });
}
var OriginalBlob = globalThis.Blob;
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
  const code = blob._parts ? blob._parts.join("") : "";
  const tempFile = path.join(os.tmpdir(), `worker_${Math.random().toString(36).slice(2)}.mjs`);
  fs.writeFileSync(tempFile, code);
  return "file://" + tempFile;
};

// node_modules/@oligami/browser_wasi_shim-threads/dist/browser-wasi-shim-threads.es.js
var CLOCKID_REALTIME = 0;
var CLOCKID_MONOTONIC = 1;
var ERRNO_SUCCESS = 0;
var ERRNO_BADF = 8;
var ERRNO_INVAL = 28;
var ERRNO_NAMETOOLONG = 37;
var ERRNO_NOSYS = 52;
var ERRNO_NOTSUP = 58;
var ERRNO_OVERFLOW = 61;
var Iovec = class _Iovec {
  static read_bytes(view, ptr) {
    const iovec = new _Iovec();
    iovec.buf = view.getUint32(ptr, true);
    iovec.buf_len = view.getUint32(ptr + 4, true);
    return iovec;
  }
  static read_bytes_array(view, ptr, len) {
    const iovecs = [];
    for (let i = 0; i < len; i++) {
      iovecs.push(_Iovec.read_bytes(view, ptr + 8 * i));
    }
    return iovecs;
  }
};
var Ciovec = class _Ciovec {
  static read_bytes(view, ptr) {
    const iovec = new _Ciovec();
    iovec.buf = view.getUint32(ptr, true);
    iovec.buf_len = view.getUint32(ptr + 4, true);
    return iovec;
  }
  static read_bytes_array(view, ptr, len) {
    const iovecs = [];
    for (let i = 0; i < len; i++) {
      iovecs.push(_Ciovec.read_bytes(view, ptr + 8 * i));
    }
    return iovecs;
  }
};
var Fdstat = class {
  write_bytes(view, ptr) {
    view.setUint8(ptr, this.fs_filetype);
    view.setUint16(ptr + 2, this.fs_flags, true);
    view.setBigUint64(ptr + 8, this.fs_rights_base, true);
    view.setBigUint64(ptr + 16, this.fs_rights_inherited, true);
  }
  constructor(filetype, flags) {
    this.fs_rights_base = 0n;
    this.fs_rights_inherited = 0n;
    this.fs_filetype = filetype;
    this.fs_flags = flags;
  }
};
var Filestat = class {
  write_bytes(view, ptr) {
    view.setBigUint64(ptr, this.dev, true);
    view.setBigUint64(ptr + 8, this.ino, true);
    view.setUint8(ptr + 16, this.filetype);
    view.setBigUint64(ptr + 24, this.nlink, true);
    view.setBigUint64(ptr + 32, this.size, true);
    view.setBigUint64(ptr + 38, this.atim, true);
    view.setBigUint64(ptr + 46, this.mtim, true);
    view.setBigUint64(ptr + 52, this.ctim, true);
  }
  constructor(ino, filetype, size) {
    this.dev = 0n;
    this.nlink = 0n;
    this.atim = 0n;
    this.mtim = 0n;
    this.ctim = 0n;
    this.ino = ino;
    this.filetype = filetype;
    this.size = size;
  }
};
var EVENTTYPE_CLOCK = 0;
var SUBCLOCKFLAGS_SUBSCRIPTION_CLOCK_ABSTIME = 1 << 0;
var Subscription = class _Subscription {
  static read_bytes(view, ptr) {
    return new _Subscription(view.getBigUint64(ptr, true), view.getUint8(ptr + 8), view.getUint32(ptr + 16, true), view.getBigUint64(ptr + 24, true), view.getUint16(ptr + 36, true));
  }
  constructor(userdata, eventtype, clockid, timeout, flags) {
    this.userdata = userdata;
    this.eventtype = eventtype;
    this.clockid = clockid;
    this.timeout = timeout;
    this.flags = flags;
  }
};
var Event = class {
  write_bytes(view, ptr) {
    view.setBigUint64(ptr, this.userdata, true);
    view.setUint16(ptr + 8, this.error, true);
    view.setUint8(ptr + 10, this.eventtype);
  }
  constructor(userdata, error, eventtype) {
    this.userdata = userdata;
    this.error = error;
    this.eventtype = eventtype;
  }
};
var Debug = class Debug2 {
  enable(enabled) {
    this.log = createLogger(enabled === void 0 ? true : enabled, this.prefix);
  }
  get enabled() {
    return this.isEnabled;
  }
  constructor(isEnabled) {
    this.isEnabled = isEnabled;
    this.prefix = "wasi:";
    this.enable(isEnabled);
  }
};
function createLogger(enabled, prefix) {
  if (enabled) {
    const a = console.log.bind(console, "%c%s", "color: #265BA0", prefix);
    return a;
  } else {
    return () => {
    };
  }
}
new Debug(false);
var WASIProcExit = class extends Error {
  constructor(code) {
    super("exit with exit code " + code);
    this.code = code;
  }
};
var WASIFarmPark = class {
  unknown_fn;
  fds;
  stdin;
  stdout;
  stderr;
  default_allow_fds;
  constructor(fds, stdin, stdout, stderr, default_allow_fds, unknown_fn) {
    this.unknown_fn = unknown_fn;
    this.fds = fds;
    this.stdin = stdin;
    this.stdout = stdout;
    this.stderr = stderr;
    this.default_allow_fds = default_allow_fds;
    this.fds_map = new Array(fds.length);
    for (let i = 0; i < fds.length; i++) {
      this.fds_map[i] = [];
    }
  }
  get_new_fd_lock = [];
  fds_map;
  async get_new_fd() {
    const promise = new Promise((resolve2) => {
      const len = this.get_new_fd_lock.push(async () => {
        let ret = -1;
        for (let i = 0; i < this.fds.length; i++) {
          if (this.fds[i] === void 0) {
            ret = i;
            break;
          }
        }
        if (ret === -1) {
          ret = this.fds.length;
          this.fds.push(void 0);
          this.fds_map.push([]);
        }
        const [can, promise2] = this.can_set_new_fd(ret);
        if (!can) {
          await promise2;
        }
        resolve2([async () => {
          this.get_new_fd_lock.shift();
          const fn = this.get_new_fd_lock[0];
          if (fn !== void 0) {
            fn();
          }
          await this.notify_set_fd(ret);
        }, ret]);
      });
      if (len === 1) {
        this.get_new_fd_lock[0]();
      }
    });
    return promise;
  }
  fd_advise(fd) {
    if (this.fds[fd] !== void 0) {
      return ERRNO_SUCCESS;
    }
    return ERRNO_BADF;
  }
  fd_allocate(fd, offset, len) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].fd_allocate(offset, len);
    }
    return ERRNO_BADF;
  }
  async fd_close(fd) {
    if (this.fds[fd] !== void 0) {
      const ret = this.fds[fd].fd_close();
      this.fds[fd] = void 0;
      await this.notify_rm_fd(fd);
      return ret;
    }
    return ERRNO_BADF;
  }
  fd_datasync(fd) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].fd_sync();
    }
    return ERRNO_BADF;
  }
  fd_fdstat_get(fd) {
    if (this.fds[fd] !== void 0) {
      const { ret, fdstat } = this.fds[fd].fd_fdstat_get();
      if (fdstat != null) {
        return [fdstat, ret];
      }
      return [void 0, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_fdstat_set_flags(fd, flags) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].fd_fdstat_set_flags(flags);
    }
    return ERRNO_BADF;
  }
  fd_fdstat_set_rights(fd, fs_rights_base, fs_rights_inheriting) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].fd_fdstat_set_rights(fs_rights_base, fs_rights_inheriting);
    }
    return ERRNO_BADF;
  }
  fd_filestat_get(fd) {
    if (this.fds[fd] !== void 0) {
      const { ret, filestat } = this.fds[fd].fd_filestat_get();
      if (filestat != null) {
        return [filestat, ret];
      }
      return [void 0, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_filestat_set_size(fd, size) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].fd_filestat_set_size(size);
    }
    return ERRNO_BADF;
  }
  fd_filestat_set_times(fd, atim, mtim, fst_flags) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].fd_filestat_set_times(atim, mtim, fst_flags);
    }
    return ERRNO_BADF;
  }
  fd_pread(fd, iovecs, offset) {
    if (this.fds[fd] !== void 0) {
      let nread = 0;
      let buffer8 = new Uint8Array(0);
      for (const iovec of iovecs) {
        const { ret, data } = this.fds[fd].fd_pread(iovec.buf_len, offset);
        if (ret !== ERRNO_SUCCESS) {
          return [[nread, buffer8], ret];
        }
        const new_buffer = new Uint8Array(buffer8.byteLength + data.byteLength);
        new_buffer.set(buffer8);
        new_buffer.set(data, buffer8.byteLength);
        buffer8 = new_buffer;
        nread += data.byteLength;
        if (data.byteLength !== iovec.buf_len) {
          break;
        }
      }
      return [[nread, buffer8], ERRNO_SUCCESS];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_prestat_get(fd) {
    if (this.fds[fd] !== void 0) {
      const { ret, prestat } = this.fds[fd].fd_prestat_get();
      if (prestat != null) {
        return [prestat, ret];
      }
      return [void 0, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_prestat_dir_name(fd, path_len) {
    if (this.fds[fd] !== void 0) {
      const { ret, prestat } = this.fds[fd].fd_prestat_get();
      if (prestat) {
        const prestat_dir_name = prestat.inner.pr_name;
        if (prestat_dir_name.length <= path_len) {
          return [prestat_dir_name, ret];
        }
        return [prestat_dir_name.slice(0, path_len), ERRNO_NAMETOOLONG];
      }
      return [void 0, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_pwrite(fd, write_data, offset) {
    if (this.fds[fd] !== void 0) {
      const { ret, nwritten } = this.fds[fd].fd_pwrite(write_data, offset);
      return [nwritten, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_read(fd, iovecs) {
    if (this.fds[fd] !== void 0) {
      let nread = 0;
      let buffer8 = new Uint8Array(0);
      for (const iovec of iovecs) {
        const { ret, data } = this.fds[fd].fd_read(iovec.buf_len);
        if (ret !== ERRNO_SUCCESS) {
          return [[nread, buffer8], ret];
        }
        const new_buffer = new Uint8Array(buffer8.byteLength + data.byteLength);
        new_buffer.set(buffer8);
        new_buffer.set(data, buffer8.byteLength);
        buffer8 = new_buffer;
        nread += data.byteLength;
        if (data.byteLength !== iovec.buf_len) {
          break;
        }
      }
      return [[nread, buffer8], ERRNO_SUCCESS];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_readdir(fd, buf_len, cookie) {
    if (this.fds[fd] !== void 0) {
      const array = new Uint8Array(buf_len);
      let buf_used = 0;
      let offset = 0;
      while (true) {
        const { ret, dirent } = this.fds[fd].fd_readdir_single(cookie);
        if (ret !== ERRNO_SUCCESS) {
          return [[array, buf_used], ret];
        }
        if (dirent == null) {
          break;
        }
        if (buf_len - buf_used < dirent.head_length()) {
          buf_used = buf_len;
          break;
        }
        const head_bytes = new ArrayBuffer(dirent.head_length());
        dirent.write_head_bytes(new DataView(head_bytes), 0);
        array.set(new Uint8Array(head_bytes).slice(0, Math.min(head_bytes.byteLength, buf_len - buf_used)), offset);
        offset += head_bytes.byteLength;
        buf_used += head_bytes.byteLength;
        if (buf_len - buf_used < dirent.name_length()) {
          buf_used = buf_len;
          break;
        }
        dirent.write_name_bytes(array, offset, buf_len - buf_used);
        offset += dirent.name_length();
        buf_used += dirent.name_length();
        cookie = dirent.d_next;
      }
      return [[array, buf_used], ERRNO_SUCCESS];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_seek(fd, offset, whence) {
    if (this.fds[fd] !== void 0) {
      const { ret, offset: new_offset } = this.fds[fd].fd_seek(offset, whence);
      return [new_offset, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  fd_sync(fd) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].fd_sync();
    }
    return ERRNO_BADF;
  }
  fd_tell(fd) {
    if (this.fds[fd] !== void 0) {
      const { ret, offset } = this.fds[fd].fd_tell();
      return [offset, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  async fd_write(fd, write_data) {
    if (this.fds[fd] !== void 0) {
      const fd_ret = this.fds[fd].fd_write(write_data);
      let ret;
      let nwritten;
      if (fd_ret instanceof Promise) {
        ({ ret, nwritten } = await fd_ret);
      } else {
        ({ ret, nwritten } = fd_ret);
      }
      return [nwritten, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  path_create_directory(fd, path3) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].path_create_directory(path3);
    }
    return ERRNO_BADF;
  }
  path_filestat_get(fd, flags, path3) {
    if (this.fds[fd] !== void 0) {
      const { ret, filestat } = this.fds[fd].path_filestat_get(flags, path3);
      if (filestat != null) {
        return [filestat, ret];
      }
      return [void 0, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  path_filestat_set_times(fd, flags, path3, atim, mtim, fst_flags) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].path_filestat_set_times(flags, path3, atim, mtim, fst_flags);
    }
    return ERRNO_BADF;
  }
  path_link(old_fd, old_flags, old_path, new_fd, new_path) {
    if (this.fds[old_fd] !== void 0 && this.fds[new_fd] !== void 0) {
      const { ret, inode_obj } = this.fds[old_fd].path_lookup(old_path, old_flags);
      if (inode_obj == null) {
        return ret;
      }
      return this.fds[new_fd].path_link(new_path, inode_obj, false);
    }
    return ERRNO_BADF;
  }
  async path_open(fd, dirflags, path3, oflags, fs_rights_base, fs_rights_inheriting, fs_flags) {
    if (this.fds[fd] !== void 0) {
      const { ret, fd_obj } = this.fds[fd].path_open(dirflags, path3, oflags, fs_rights_base, fs_rights_inheriting, fs_flags);
      if (ret !== ERRNO_SUCCESS) {
        return [void 0, ret];
      }
      const [resolve2, opened_fd] = await this.get_new_fd();
      if (!fd_obj) {
        throw "fd_obj should not be null";
      }
      this.fds[opened_fd] = fd_obj;
      await resolve2();
      return [opened_fd, ERRNO_SUCCESS];
    }
    return [void 0, ERRNO_BADF];
  }
  path_readlink(fd, path3, buf_len) {
    if (this.fds[fd] !== void 0) {
      const { ret, data } = this.fds[fd].path_readlink(path3);
      if (data != null) {
        const data_buf = new TextEncoder().encode(data);
        if (data_buf.byteLength > buf_len) {
          return [data_buf.slice(0, buf_len), ERRNO_OVERFLOW];
        }
        return [data_buf, ret];
      }
      return [void 0, ret];
    }
    return [void 0, ERRNO_BADF];
  }
  path_remove_directory(fd, path3) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].path_remove_directory(path3);
    }
    return ERRNO_BADF;
  }
  path_rename(old_fd, old_path, new_fd, new_path) {
    if (this.fds[old_fd] !== void 0 && this.fds[new_fd] !== void 0) {
      let { ret, inode_obj } = this.fds[old_fd].path_unlink(old_path);
      if (inode_obj == null) {
        return ret;
      }
      ret = this.fds[new_fd].path_link(new_path, inode_obj, true);
      if (ret !== ERRNO_SUCCESS) {
        if (this.fds[old_fd].path_link(old_path, inode_obj, true) !== ERRNO_SUCCESS) {
          throw "path_link should always return success when relinking an inode back to the original place";
        }
      }
      return ret;
    }
    return ERRNO_BADF;
  }
  path_symlink(_old_path, fd, _new_path) {
    if (this.fds[fd] !== void 0) {
      return ERRNO_NOTSUP;
    }
    return ERRNO_BADF;
  }
  path_unlink_file(fd, path3) {
    if (this.fds[fd] !== void 0) {
      return this.fds[fd].path_unlink_file(path3);
    }
    return ERRNO_BADF;
  }
};
var AllocatorUseArrayBuffer = class _AllocatorUseArrayBuffer {
  share_arrays_memory;
  constructor(share_arrays_memory = new SharedArrayBuffer(10 * 1024 * 1024)) {
    this.share_arrays_memory = share_arrays_memory;
    const view = new Int32Array(this.share_arrays_memory);
    Atomics.store(view, 0, 0);
    Atomics.store(view, 1, 0);
    Atomics.store(view, 2, 12);
  }
  static init_self(sl) {
    return new _AllocatorUseArrayBuffer(sl.share_arrays_memory);
  }
  async async_write(data, memory, ret_ptr) {
    const view = new Int32Array(this.share_arrays_memory);
    while (true) {
      let lock;
      const { value } = Atomics.waitAsync(view, 0, 1);
      if (value instanceof Promise) {
        lock = await value;
      } else {
        lock = value;
      }
      if (lock === "timed-out") {
        throw new Error("timed-out lock");
      }
      const old = Atomics.compareExchange(view, 0, 0, 1);
      if (old !== 0) {
        continue;
      }
      const ret = this.write_inner(data, memory, ret_ptr);
      Atomics.store(view, 0, 0);
      Atomics.notify(view, 0, 1);
      return ret;
    }
  }
  block_write(data, memory, ret_ptr) {
    while (true) {
      const view = new Int32Array(this.share_arrays_memory);
      const lock = Atomics.wait(view, 0, 1);
      if (lock === "timed-out") {
        throw new Error("timed-out lock");
      }
      const old = Atomics.compareExchange(view, 0, 0, 1);
      if (old !== 0) {
        continue;
      }
      const ret = this.write_inner(data, memory, ret_ptr);
      Atomics.store(view, 0, 0);
      Atomics.notify(view, 0, 1);
      return ret;
    }
  }
  write_inner(data, memory, ret_ptr) {
    const view = new Int32Array(this.share_arrays_memory);
    const view8 = new Uint8Array(this.share_arrays_memory);
    const old_num = Atomics.add(view, 1, 1);
    let share_arrays_memory_kept;
    if (old_num === 0) {
      share_arrays_memory_kept = Atomics.store(view, 2, 12);
    } else {
      share_arrays_memory_kept = Atomics.load(view, 2);
    }
    const memory_len = this.share_arrays_memory.byteLength;
    const len = data.byteLength;
    const new_memory_len = share_arrays_memory_kept + len;
    if (memory_len < new_memory_len) {
      throw new Error("size is bigger than memory. \nTODO! fix memory limit. support big size another way.");
    }
    let data8;
    if (data instanceof Uint8Array) {
      data8 = data;
    } else if (data instanceof Uint32Array) {
      const tmp = new ArrayBuffer(data.byteLength);
      new Uint32Array(tmp).set(data);
      data8 = new Uint8Array(tmp);
    }
    view8.set(new Uint8Array(data8), share_arrays_memory_kept);
    Atomics.store(view, 2, new_memory_len);
    const memory_view = new Int32Array(memory);
    Atomics.store(memory_view, ret_ptr, share_arrays_memory_kept);
    Atomics.store(memory_view, ret_ptr + 1, len);
    return [share_arrays_memory_kept, len];
  }
  free(_pointer, _len) {
    Atomics.sub(new Int32Array(this.share_arrays_memory), 1, 1);
  }
  get_memory(ptr, len) {
    const data = new ArrayBuffer(len);
    const view = new Uint8Array(data);
    view.set(new Uint8Array(this.share_arrays_memory).slice(ptr, ptr + len));
    return data;
  }
  use_defined_memory(ptr, len, data) {
    const memory = new Uint8Array(this.share_arrays_memory);
    memory.set(new Uint8Array(data).slice(0, len), ptr);
  }
  get_object() {
    return { share_arrays_memory: this.share_arrays_memory };
  }
};
var ToRefSenderUseArrayBuffer = class {
  share_arrays_memory;
  data_size;
  constructor(data_size, max_share_arrays_memory = 100 * 1024, share_arrays_memory) {
    this.data_size = data_size;
    if (share_arrays_memory) {
      this.share_arrays_memory = share_arrays_memory;
    } else {
      this.share_arrays_memory = new SharedArrayBuffer(max_share_arrays_memory);
    }
    const view = new Int32Array(this.share_arrays_memory);
    Atomics.store(view, 0, 0);
    Atomics.store(view, 1, 0);
    Atomics.store(view, 2, 12);
  }
  static init_self_inner(sl) {
    return { data_size: sl.data_size, max_share_arrays_memory: sl.share_arrays_memory.byteLength, share_arrays_memory: sl.share_arrays_memory };
  }
  async async_lock() {
    const view = new Int32Array(this.share_arrays_memory);
    while (true) {
      let lock;
      const { value } = Atomics.waitAsync(view, 0, 1);
      if (value instanceof Promise) {
        lock = await value;
      } else {
        lock = value;
      }
      if (lock === "timed-out") {
        throw new Error("timed-out lock");
      }
      const old = Atomics.compareExchange(view, 0, 0, 1);
      if (old !== 0) {
        continue;
      }
      break;
    }
  }
  block_lock() {
    while (true) {
      const view = new Int32Array(this.share_arrays_memory);
      const lock = Atomics.wait(view, 0, 1);
      if (lock === "timed-out") {
        throw new Error("timed-out lock");
      }
      const old = Atomics.compareExchange(view, 0, 0, 1);
      if (old !== 0) {
        continue;
      }
      break;
    }
  }
  release_lock() {
    const view = new Int32Array(this.share_arrays_memory);
    Atomics.store(view, 0, 0);
    Atomics.notify(view, 0, 1);
  }
  async async_send(targets, data) {
    await this.async_lock();
    const view = new Int32Array(this.share_arrays_memory);
    const used_len = Atomics.load(view, 2);
    const data_len = data.byteLength;
    if (data_len !== this.data_size) {
      throw new Error(`invalid data size: ${data_len} !== ${this.data_size}`);
    }
    const new_used_len = used_len + data_len + 8 + targets.length * 4;
    if (new_used_len > this.share_arrays_memory.byteLength) {
      throw new Error("over memory");
    }
    Atomics.store(view, 2, new_used_len);
    const header = new Int32Array(this.share_arrays_memory, used_len);
    header[0] = targets.length;
    header[1] = targets.length;
    header.set(targets, 2);
    const data_view = new Uint32Array(this.share_arrays_memory, used_len + 8 + targets.length * 4);
    data_view.set(data);
    Atomics.add(view, 1, 1);
    this.release_lock();
  }
  get_data(id) {
    const view = new Int32Array(this.share_arrays_memory);
    const data_num_tmp = Atomics.load(view, 1);
    if (data_num_tmp === 0) {
      return void 0;
    }
    this.block_lock();
    const data_num = Atomics.load(view, 1);
    const return_data = [];
    let offset = 12;
    for (let i = 0; i < data_num; i++) {
      const header = new Int32Array(this.share_arrays_memory, offset);
      const target_num = header[1];
      const targets = new Int32Array(this.share_arrays_memory, offset + 8, target_num);
      const data_len = this.data_size;
      if (targets.includes(id)) {
        const data = new Uint32Array(this.share_arrays_memory, offset + 8 + target_num * 4, data_len / 4);
        return_data.push(new Uint32Array([...data]));
        const target_index = targets.indexOf(id);
        Atomics.store(targets, target_index, -1);
        const old_left_targets_num = Atomics.sub(header, 0, 1);
        if (old_left_targets_num === 1) {
          Atomics.sub(view, 1, 1);
          const used_len = Atomics.load(view, 2);
          const new_used_len = used_len - data_len - 8 - target_num * 4;
          Atomics.store(view, 2, new_used_len);
          const next_data_offset = offset + data_len + 8 + target_num * 4;
          const next_tail = new Int32Array(this.share_arrays_memory, next_data_offset);
          const now_tail = new Int32Array(this.share_arrays_memory, offset);
          now_tail.set(next_tail);
        } else {
          offset += data_len + 8 + target_num * 4;
        }
      } else {
        offset += data_len + 8 + target_num * 4;
      }
    }
    if (offset !== Atomics.load(view, 2)) {
      throw new Error(`invalid offset: ${offset} !== ${Atomics.load(view, 2)}`);
    }
    this.release_lock();
    return return_data;
  }
};
var FdCloseSenderUseArrayBuffer = class _FdCloseSenderUseArrayBuffer extends ToRefSenderUseArrayBuffer {
  constructor(max_share_arrays_memory, share_arrays_memory) {
    super(4, max_share_arrays_memory, share_arrays_memory);
  }
  async send(targets, fd) {
    if (targets === void 0 || targets.length === 0) {
      throw new Error("targets is empty");
    }
    await this.async_send(targets, new Uint32Array([fd]));
  }
  get(id) {
    const data = this.get_data(id);
    if (data === void 0) {
      return void 0;
    }
    const array = [];
    for (const i of data) {
      array.push(i[0]);
    }
    return array;
  }
  static init_self(sl) {
    const sel = ToRefSenderUseArrayBuffer.init_self_inner(sl);
    return new _FdCloseSenderUseArrayBuffer(sel.max_share_arrays_memory, sel.share_arrays_memory);
  }
};
function wrap_async(fn) {
  let terminate = () => {
    throw new Error("terminate called before async function started");
  };
  const promise = new Promise((resolve2, reject) => {
    terminate = () => reject();
    fn().then((v) => {
      resolve2(v);
    });
  });
  return { promise, terminate };
}
var fd_func_sig_u32_size = 18;
var fd_func_sig_bytes = fd_func_sig_u32_size * 4;
var WASIFarmParkUseArrayBuffer = class extends WASIFarmPark {
  allocator;
  lock_fds;
  fds_len_and_num;
  listen_fds = [];
  listen_fds_terminator = [];
  fd_func_sig;
  listen_base_handle;
  listen_base_terminator;
  base_func_util;
  fd_close_receiver;
  constructor(fds, stdin, stdout, stderr, default_allow_fds, allocator_size, max_fds_len, unknown_fn) {
    super(fds, stdin, stdout, stderr, default_allow_fds, unknown_fn);
    if (allocator_size === void 0) {
      this.allocator = new AllocatorUseArrayBuffer();
    } else {
      this.allocator = new AllocatorUseArrayBuffer(new SharedArrayBuffer(allocator_size));
    }
    const _max_fds_len = max_fds_len ?? 128;
    this.lock_fds = new SharedArrayBuffer(4 * _max_fds_len * 3);
    this.fd_func_sig = new SharedArrayBuffer(fd_func_sig_u32_size * 4 * _max_fds_len);
    this.fds_len_and_num = new SharedArrayBuffer(8);
    const view = new Int32Array(this.fds_len_and_num);
    Atomics.store(view, 0, fds.length);
    Atomics.store(view, 1, 0);
    this.fd_close_receiver = new FdCloseSenderUseArrayBuffer();
    this.base_func_util = new SharedArrayBuffer(32);
  }
  destroy() {
    for (let n = 0; n < this.fds.length; n++) {
      const terminator = this.listen_fds_terminator[n];
      if (terminator) {
        terminator();
        this.listen_fds_terminator[n] = null;
        this.listen_fds[n] = null;
      }
    }
    if (this.listen_base_terminator) {
      this.listen_base_terminator();
      this.listen_base_terminator = null;
      this.listen_base_handle = null;
    }
  }
  get_ref() {
    return { allocator: this.allocator, lock_fds: this.lock_fds, fds_len_and_num: this.fds_len_and_num, fd_func_sig: this.fd_func_sig, base_func_util: this.base_func_util, fd_close_receiver: this.fd_close_receiver, stdin: this.stdin, stdout: this.stdout, stderr: this.stderr, default_fds: this.default_allow_fds };
  }
  async notify_set_fd(fd) {
    if (this.fds[fd] === void 0) {
      throw new Error("fd is not defined");
    }
    if (fd >= 128) {
      throw new Error("fd is too big. expand is not supported yet");
    }
    if (this.listen_fds[fd] !== void 0) {
      if (this.listen_fds[fd] instanceof Promise) {
        console.warn("fd is already set yet");
        await this.listen_fds[fd];
      }
    }
    const { promise, terminate } = this.listen_fd(fd);
    this.listen_fds[fd] = promise;
    this.listen_fds_terminator[fd] = terminate;
    const view = new Int32Array(this.fds_len_and_num);
    Atomics.store(view, 0, this.fds.length);
  }
  async notify_rm_fd(fd) {
    (async () => {
      await this.listen_fds[fd];
      this.listen_fds[fd] = void 0;
      this.listen_fds_terminator[fd] = void 0;
    })();
    await this.fd_close_receiver.send(this.fds_map[fd], fd);
    this.fds_map[fd] = [];
  }
  can_set_new_fd(fd) {
    if (this.listen_fds[fd] instanceof Promise) {
      return [false, this.listen_fds[fd]];
    }
    return [true, void 0];
  }
  listen() {
    this.listen_fds = [];
    for (let n = 0; n < this.fds.length; n++) {
      const { promise: promise2, terminate: terminate2 } = this.listen_fd(n);
      this.listen_fds.push(promise2);
      this.listen_fds_terminator.push(terminate2);
    }
    const { promise, terminate } = this.listen_base();
    this.listen_base_handle = promise;
    this.listen_base_terminator = terminate;
  }
  listen_base() {
    return wrap_async(this.listen_base_inner.bind(this));
  }
  async listen_base_inner() {
    const lock_view = new Int32Array(this.base_func_util);
    Atomics.store(lock_view, 0, 0);
    Atomics.store(lock_view, 1, 1);
    while (true) {
      const { value } = Atomics.waitAsync(lock_view, 1, 1);
      if (await value === "timed-out") {
        throw new Error("timed-out");
      }
      const func_number = Atomics.load(lock_view, 3);
      switch (func_number) {
        case 0: {
          const ptr = Atomics.load(lock_view, 4);
          const len = Atomics.load(lock_view, 5);
          const data = new Uint32Array(this.allocator.get_memory(ptr, len));
          this.allocator.free(ptr, len);
          const wasi_farm_ref_id = Atomics.load(lock_view, 6);
          for (let i = 0; i < len / 4; i++) {
            const fd = data[i];
            if (this.fds_map[fd] === void 0) {
              this.fds_map[fd] = [];
              console.error("listen_base fd is not defined");
            }
            this.fds_map[fd].push(wasi_farm_ref_id);
          }
          await new Promise((resolve2) => setTimeout(resolve2, 1e3));
          break;
        }
        case 1: {
          this.destroy();
          Atomics.store(lock_view, 1, 1);
          Atomics.store(lock_view, 2, 0);
          Atomics.notify(lock_view, 2, 1);
          return;
        }
        case 2: {
          const arg_ptr = Atomics.load(lock_view, 4);
          const arg_len = Atomics.load(lock_view, 5);
          const arg_data = this.allocator.get_memory(arg_ptr, arg_len);
          const arg_str = new TextDecoder().decode(new Uint8Array(arg_data));
          this.allocator.free(arg_ptr, arg_len);
          const arg = JSON.parse(arg_str);
          let ret;
          if (this.unknown_fn) {
            ret = await this.unknown_fn(arg);
          }
          if (ret !== void 0) {
            const ret_str = JSON.stringify(ret);
            const ret_bytes = new TextEncoder().encode(ret_str);
            await this.allocator.async_write(ret_bytes, this.base_func_util, 6);
          } else {
            Atomics.store(lock_view, 6, 0);
            Atomics.store(lock_view, 7, 0);
          }
          break;
        }
      }
      Atomics.store(lock_view, 1, 1);
      Atomics.store(lock_view, 2, 0);
      const num = Atomics.notify(lock_view, 2, 1);
      if (num !== 1) {
        if (num === 0) {
          console.warn("notify failed, waiter is late");
          continue;
        }
        throw new Error(`notify failed: ${num}`);
      }
    }
  }
  listen_fd(fd_n) {
    return wrap_async(this.listen_fd_inner.bind(this, fd_n));
  }
  async listen_fd_inner(fd_n) {
    const lock_view = new Int32Array(this.lock_fds, fd_n * 12);
    const bytes_offset = fd_n * fd_func_sig_bytes;
    const func_sig_view_u8 = new Uint8Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u16 = new Uint16Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_i32 = new Int32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Int32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    const errno_offset = fd_func_sig_u32_size - 1;
    Atomics.store(lock_view, 0, 0);
    Atomics.store(lock_view, 1, 1);
    Atomics.store(func_sig_view_i32, errno_offset, -1);
    while (true) {
      const { value } = Atomics.waitAsync(lock_view, 1, 1);
      if (await value === "timed-out") {
        throw new Error("timed-out");
      }
      const set_error = (errno) => {
        Atomics.store(func_sig_view_i32, errno_offset, errno);
      };
      const func_number = Atomics.load(func_sig_view_u32, 0);
      switch (func_number) {
        case 7: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const error = this.fd_advise(fd);
          set_error(error);
          break;
        }
        case 8: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const offset = Atomics.load(func_sig_view_u64, 1);
          const len = Atomics.load(func_sig_view_u64, 2);
          const error = this.fd_allocate(fd, offset, len);
          set_error(error);
          break;
        }
        case 9: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const error = await this.fd_close(fd);
          set_error(error);
          break;
        }
        case 10: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const error = this.fd_datasync(fd);
          set_error(error);
          break;
        }
        case 11: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const [fdstat, ret] = this.fd_fdstat_get(fd);
          if (fdstat) {
            Atomics.store(func_sig_view_u8, 0, fdstat.fs_filetype);
            Atomics.store(func_sig_view_u16, 2, fdstat.fs_flags);
            Atomics.store(func_sig_view_u64, 1, fdstat.fs_rights_base);
            Atomics.store(func_sig_view_u64, 2, fdstat.fs_rights_inherited);
          }
          set_error(ret);
          break;
        }
        case 12: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const flags = Atomics.load(func_sig_view_u16, 4);
          const error = this.fd_fdstat_set_flags(fd, flags);
          set_error(error);
          break;
        }
        case 13: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const fs_rights_base = Atomics.load(func_sig_view_u64, 1);
          const fs_rights_inheriting = Atomics.load(func_sig_view_u64, 2);
          const error = this.fd_fdstat_set_rights(fd, fs_rights_base, fs_rights_inheriting);
          set_error(error);
          break;
        }
        case 14: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const [filestat, ret] = this.fd_filestat_get(fd);
          if (filestat) {
            Atomics.store(func_sig_view_u64, 0, filestat.dev);
            Atomics.store(func_sig_view_u64, 1, filestat.ino);
            Atomics.store(func_sig_view_u8, 16, filestat.filetype);
            Atomics.store(func_sig_view_u64, 3, filestat.nlink);
            Atomics.store(func_sig_view_u64, 4, filestat.size);
            Atomics.store(func_sig_view_u64, 5, filestat.atim);
            Atomics.store(func_sig_view_u64, 6, filestat.mtim);
            Atomics.store(func_sig_view_u64, 7, filestat.ctim);
          }
          set_error(ret);
          break;
        }
        case 15: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const size = Atomics.load(func_sig_view_u64, 1);
          const error = this.fd_filestat_set_size(fd, size);
          set_error(error);
          break;
        }
        case 16: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const atim = Atomics.load(func_sig_view_u64, 1);
          const mtim = Atomics.load(func_sig_view_u64, 2);
          const fst_flags = Atomics.load(func_sig_view_u16, 12);
          const error = this.fd_filestat_set_times(fd, atim, mtim, fst_flags);
          set_error(error);
          break;
        }
        case 17: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const iovs_ptr = Atomics.load(func_sig_view_u32, 2);
          const iovs_ptr_len = Atomics.load(func_sig_view_u32, 3);
          const offset = Atomics.load(func_sig_view_u64, 2);
          const data = new Uint32Array(this.allocator.get_memory(iovs_ptr, iovs_ptr_len));
          this.allocator.free(iovs_ptr, iovs_ptr_len);
          const iovecs = [];
          for (let i = 0; i < iovs_ptr_len; i += 8) {
            const iovec = new Iovec();
            iovec.buf = data[i * 2];
            iovec.buf_len = data[i * 2 + 1];
            iovecs.push(iovec);
          }
          const [nread_and_buffer, error] = this.fd_pread(fd, iovecs, offset);
          const [nread, buffer8] = nread_and_buffer ?? [void 0, void 0];
          if (nread !== void 0) {
            Atomics.store(func_sig_view_u32, 0, nread);
          }
          if (buffer8) {
            await this.allocator.async_write(buffer8, this.fd_func_sig, fd * fd_func_sig_u32_size + 1);
          }
          set_error(error);
          break;
        }
        case 18: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const [prestat, ret] = this.fd_prestat_get(fd);
          if (prestat) {
            Atomics.store(func_sig_view_u32, 0, prestat.tag);
            Atomics.store(func_sig_view_u32, 1, prestat.inner.pr_name.byteLength);
          }
          set_error(ret);
          break;
        }
        case 19: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const path_len = Atomics.load(func_sig_view_u32, 2);
          const [prestat_dir_name, ret] = this.fd_prestat_dir_name(fd, path_len);
          if (prestat_dir_name && (ret === ERRNO_SUCCESS || ret === ERRNO_NAMETOOLONG)) {
            await this.allocator.async_write(prestat_dir_name, this.fd_func_sig, fd * fd_func_sig_u32_size);
          }
          set_error(ret);
          break;
        }
        case 20: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const write_data_ptr = Atomics.load(func_sig_view_u32, 2);
          const write_data_len = Atomics.load(func_sig_view_u32, 3);
          const offset = Atomics.load(func_sig_view_u64, 2);
          const data = new Uint8Array(this.allocator.get_memory(write_data_ptr, write_data_len));
          this.allocator.free(write_data_ptr, write_data_len);
          const [nwritten, error] = this.fd_pwrite(fd, data, offset);
          if (nwritten !== void 0) {
            Atomics.store(func_sig_view_u32, 0, nwritten);
          }
          set_error(error);
          break;
        }
        case 21: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const iovs_ptr = Atomics.load(func_sig_view_u32, 2);
          const iovs_ptr_len = Atomics.load(func_sig_view_u32, 3);
          const iovs = new Uint32Array(this.allocator.get_memory(iovs_ptr, iovs_ptr_len));
          this.allocator.free(iovs_ptr, iovs_ptr_len);
          const iovecs = [];
          for (let i = 0; i < iovs_ptr_len; i += 8) {
            const iovec = new Iovec();
            iovec.buf = iovs[i * 2];
            iovec.buf_len = iovs[i * 2 + 1];
            iovecs.push(iovec);
          }
          const [nread_and_buffer, error] = this.fd_read(fd, iovecs);
          const [nread, buffer8] = nread_and_buffer ?? [void 0, void 0];
          if (nread !== void 0) {
            Atomics.store(func_sig_view_u32, 0, nread);
          }
          if (buffer8) {
            await this.allocator.async_write(buffer8, this.fd_func_sig, fd * fd_func_sig_u32_size + 1);
          }
          set_error(error);
          break;
        }
        case 22: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const buf_len = Atomics.load(func_sig_view_u32, 2);
          const cookie = Atomics.load(func_sig_view_u64, 2);
          const [array_and_buf_used, error] = this.fd_readdir(fd, buf_len, cookie);
          const [array, buf_used] = array_and_buf_used ?? [void 0, void 0];
          if (array) {
            await this.allocator.async_write(array, this.fd_func_sig, fd * fd_func_sig_u32_size);
          }
          if (buf_used !== void 0) {
            Atomics.store(func_sig_view_u32, 2, buf_used);
          }
          set_error(error);
          break;
        }
        case 24: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const offset = Atomics.load(func_sig_view_u64, 1);
          const whence = Atomics.load(func_sig_view_u8, 16);
          const [new_offset, error] = this.fd_seek(fd, offset, whence);
          if (new_offset !== void 0) {
            Atomics.store(func_sig_view_u64, 0, new_offset);
          }
          set_error(error);
          break;
        }
        case 25: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const error = this.fd_sync(fd);
          set_error(error);
          break;
        }
        case 26: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const [offset, error] = this.fd_tell(fd);
          if (offset !== void 0) {
            Atomics.store(func_sig_view_u64, 0, offset);
          }
          set_error(error);
          break;
        }
        case 27: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const write_data_ptr = Atomics.load(func_sig_view_u32, 2);
          const write_data_len = Atomics.load(func_sig_view_u32, 3);
          const data = new Uint8Array(this.allocator.get_memory(write_data_ptr, write_data_len));
          this.allocator.free(write_data_ptr, write_data_len);
          const [nwritten, error] = await this.fd_write(fd, data);
          if (nwritten !== void 0) {
            Atomics.store(func_sig_view_u32, 0, nwritten);
          }
          set_error(error);
          break;
        }
        case 28: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const path_ptr = Atomics.load(func_sig_view_u32, 2);
          const path_len = Atomics.load(func_sig_view_u32, 3);
          const path3 = new Uint8Array(this.allocator.get_memory(path_ptr, path_len));
          const path_str = new TextDecoder().decode(path3);
          this.allocator.free(path_ptr, path_len);
          const error = this.path_create_directory(fd, path_str);
          set_error(error);
          break;
        }
        case 29: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const flags = Atomics.load(func_sig_view_u32, 2);
          const path_ptr = Atomics.load(func_sig_view_u32, 3);
          const path_len = Atomics.load(func_sig_view_u32, 4);
          const path3 = new Uint8Array(this.allocator.get_memory(path_ptr, path_len));
          const path_str = new TextDecoder().decode(path3);
          this.allocator.free(path_ptr, path_len);
          const [filestat, ret] = this.path_filestat_get(fd, flags, path_str);
          if (filestat) {
            Atomics.store(func_sig_view_u64, 0, filestat.dev);
            Atomics.store(func_sig_view_u64, 1, filestat.ino);
            Atomics.store(func_sig_view_u8, 16, filestat.filetype);
            Atomics.store(func_sig_view_u64, 3, filestat.nlink);
            Atomics.store(func_sig_view_u64, 4, filestat.size);
            Atomics.store(func_sig_view_u64, 5, filestat.atim);
            Atomics.store(func_sig_view_u64, 6, filestat.mtim);
            Atomics.store(func_sig_view_u64, 7, filestat.ctim);
          }
          set_error(ret);
          break;
        }
        case 30: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const flags = Atomics.load(func_sig_view_u32, 2);
          const path_ptr = Atomics.load(func_sig_view_u32, 3);
          const path_len = Atomics.load(func_sig_view_u32, 4);
          const atim = Atomics.load(func_sig_view_u64, 3);
          const mtim = Atomics.load(func_sig_view_u64, 4);
          const fst_flags = Atomics.load(func_sig_view_u16, 12);
          const path3 = new Uint8Array(this.allocator.get_memory(path_ptr, path_len));
          const path_str = new TextDecoder().decode(path3);
          this.allocator.free(path_ptr, path_len);
          const error = this.path_filestat_set_times(fd, flags, path_str, atim, mtim, fst_flags);
          set_error(error);
          break;
        }
        case 31: {
          const old_fd = Atomics.load(func_sig_view_u32, 1);
          const old_flags = Atomics.load(func_sig_view_u32, 2);
          const old_path_ptr = Atomics.load(func_sig_view_u32, 3);
          const old_path_len = Atomics.load(func_sig_view_u32, 4);
          const new_fd = Atomics.load(func_sig_view_u32, 5);
          const new_path_ptr = Atomics.load(func_sig_view_u32, 6);
          const new_path_len = Atomics.load(func_sig_view_u32, 7);
          const old_path = new Uint8Array(this.allocator.get_memory(old_path_ptr, old_path_len));
          const old_path_str = new TextDecoder().decode(old_path);
          this.allocator.free(old_path_ptr, old_path_len);
          const new_path = new Uint8Array(this.allocator.get_memory(new_path_ptr, new_path_len));
          const new_path_str = new TextDecoder().decode(new_path);
          this.allocator.free(new_path_ptr, new_path_len);
          const error = this.path_link(old_fd, old_flags, old_path_str, new_fd, new_path_str);
          set_error(error);
          break;
        }
        case 32: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const dirflags = Atomics.load(func_sig_view_u32, 2);
          const path_ptr = Atomics.load(func_sig_view_u32, 3);
          const path_len = Atomics.load(func_sig_view_u32, 4);
          const oflags = Atomics.load(func_sig_view_u32, 5);
          const fs_rights_base = Atomics.load(func_sig_view_u64, 3);
          const fs_rights_inheriting = Atomics.load(func_sig_view_u64, 4);
          const fd_flags = Atomics.load(func_sig_view_u16, 20);
          const path3 = new Uint8Array(this.allocator.get_memory(path_ptr, path_len));
          const path_str = new TextDecoder().decode(path3);
          this.allocator.free(path_ptr, path_len);
          const [opened_fd, error] = await this.path_open(fd, dirflags, path_str, oflags, fs_rights_base, fs_rights_inheriting, fd_flags);
          if (opened_fd !== void 0) {
            Atomics.store(func_sig_view_u32, 0, opened_fd);
          }
          set_error(error);
          break;
        }
        case 33: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const path_ptr = Atomics.load(func_sig_view_u32, 2);
          const path_len = Atomics.load(func_sig_view_u32, 3);
          const buf_len = Atomics.load(func_sig_view_u32, 4);
          const path3 = new Uint8Array(this.allocator.get_memory(path_ptr, path_len));
          const path_str = new TextDecoder().decode(path3);
          this.allocator.free(path_ptr, path_len);
          const [buf, error] = this.path_readlink(fd, path_str, buf_len);
          if (buf) {
            await this.allocator.async_write(buf, this.fd_func_sig, fd * fd_func_sig_u32_size + 1);
            Atomics.store(func_sig_view_u32, 0, buf.byteLength);
          }
          set_error(error);
          break;
        }
        case 34: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const path_ptr = Atomics.load(func_sig_view_u32, 2);
          const path_len = Atomics.load(func_sig_view_u32, 3);
          const path3 = new Uint8Array(this.allocator.get_memory(path_ptr, path_len));
          const path_str = new TextDecoder().decode(path3);
          this.allocator.free(path_ptr, path_len);
          const error = this.path_remove_directory(fd, path_str);
          set_error(error);
          break;
        }
        case 35: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const old_path_ptr = Atomics.load(func_sig_view_u32, 2);
          const old_path_len = Atomics.load(func_sig_view_u32, 3);
          const new_fd = Atomics.load(func_sig_view_u32, 4);
          const new_path_ptr = Atomics.load(func_sig_view_u32, 5);
          const new_path_len = Atomics.load(func_sig_view_u32, 6);
          const old_path = new Uint8Array(this.allocator.get_memory(old_path_ptr, old_path_len));
          const old_path_str = new TextDecoder().decode(old_path);
          this.allocator.free(old_path_ptr, old_path_len);
          const new_path = new Uint8Array(this.allocator.get_memory(new_path_ptr, new_path_len));
          const new_path_str = new TextDecoder().decode(new_path);
          this.allocator.free(new_path_ptr, new_path_len);
          const error = this.path_rename(fd, old_path_str, new_fd, new_path_str);
          set_error(error);
          break;
        }
        case 36: {
          const old_path_ptr = Atomics.load(func_sig_view_u32, 1);
          const old_path_len = Atomics.load(func_sig_view_u32, 2);
          const fd = Atomics.load(func_sig_view_u32, 3);
          const new_path_ptr = Atomics.load(func_sig_view_u32, 4);
          const new_path_len = Atomics.load(func_sig_view_u32, 5);
          const old_path = new Uint8Array(this.allocator.get_memory(old_path_ptr, old_path_len));
          const old_path_str = new TextDecoder().decode(old_path);
          this.allocator.free(old_path_ptr, old_path_len);
          const new_path = new Uint8Array(this.allocator.get_memory(new_path_ptr, new_path_len));
          const new_path_str = new TextDecoder().decode(new_path);
          this.allocator.free(new_path_ptr, new_path_len);
          set_error(this.path_symlink(old_path_str, fd, new_path_str));
          break;
        }
        case 37: {
          const fd = Atomics.load(func_sig_view_u32, 1);
          const path_ptr = Atomics.load(func_sig_view_u32, 2);
          const path_len = Atomics.load(func_sig_view_u32, 3);
          const path3 = new Uint8Array(this.allocator.get_memory(path_ptr, path_len));
          const path_str = new TextDecoder().decode(path3);
          this.allocator.free(path_ptr, path_len);
          set_error(this.path_unlink_file(fd, path_str));
          break;
        }
        default: {
          throw new Error(`Unknown function number: ${func_number}`);
        }
      }
      Atomics.store(lock_view, 1, 1);
      Atomics.store(lock_view, 2, 0);
      const n = Atomics.notify(lock_view, 2);
      if (n !== 1) {
        if (n === 0) {
          console.warn("notify number is 0. ref is late?");
        } else {
          console.warn(`notify number is not 1: ${n}`);
        }
      }
      if (this.fds[fd_n] === void 0) {
        break;
      }
    }
  }
};
function gen_wasi_filestat(dev, ino, filetype, nlink, size, atim, mtim, ctim) {
  const file_stat = new Filestat(ino, filetype, size);
  file_stat.dev = dev;
  file_stat.ino = ino;
  file_stat.filetype = filetype;
  file_stat.nlink = nlink;
  file_stat.size = size;
  file_stat.atim = atim;
  file_stat.mtim = mtim;
  file_stat.ctim = ctim;
  return file_stat;
}
var WASIFarmRef = class {
  stdin;
  stdout;
  stderr;
  id;
  fd_close_receiver;
  default_fds = [];
  async send(targets, fd) {
    await this.fd_close_receiver.send(targets, fd);
  }
  get(id) {
    return this.fd_close_receiver.get(id);
  }
  constructor(stdin, stdout, stderr, fd_close_receiver, default_fds) {
    this.stdin = stdin;
    this.stdout = stdout;
    this.stderr = stderr;
    this.fd_close_receiver = fd_close_receiver;
    if (default_fds !== void 0) {
      this.default_fds = default_fds;
    }
  }
  get_stdin() {
    return this.stdin;
  }
  get_stdout() {
    return this.stdout;
  }
  get_stderr() {
    return this.stderr;
  }
};
var WASIFarmRefUseArrayBuffer = class _WASIFarmRefUseArrayBuffer extends WASIFarmRef {
  allocator;
  lock_fds;
  fds_len_and_num;
  fd_func_sig;
  base_func_util;
  constructor(allocator, lock_fds, fds_len_and_num, fd_func_sig, base_func_util, fd_close_receiver, stdin, stdout, stderr, default_fds) {
    super(stdin, stdout, stderr, FdCloseSenderUseArrayBuffer.init_self(fd_close_receiver), default_fds);
    this.allocator = AllocatorUseArrayBuffer.init_self(allocator);
    this.lock_fds = lock_fds;
    this.fd_func_sig = fd_func_sig;
    this.base_func_util = base_func_util;
    this.fds_len_and_num = fds_len_and_num;
  }
  get_fds_len() {
    const view = new Int32Array(this.fds_len_and_num);
    return Atomics.load(view, 0);
  }
  static init_self(sl) {
    return new _WASIFarmRefUseArrayBuffer(sl.allocator, sl.lock_fds, sl.fds_len_and_num, sl.fd_func_sig, sl.base_func_util, sl.fd_close_receiver, sl.stdin, sl.stdout, sl.stderr, sl.default_fds);
  }
  set_id() {
    const view = new Int32Array(this.fds_len_and_num);
    const id = Atomics.add(view, 1, 1);
    this.id = id;
    return id;
  }
  base_func_locker() {
    return new Int32Array(this.base_func_util);
  }
  base_func_park_locker() {
    return new Int32Array(this.base_func_util, 12);
  }
  lock_base_func() {
    const view = this.base_func_locker();
    while (true) {
      const lock = Atomics.wait(view, 0, 1);
      if (lock === "timed-out") {
        throw new Error("timed-out lock");
      }
      const old = Atomics.compareExchange(view, 0, 0, 1);
      if (old === 0) {
        break;
      }
    }
  }
  call_base_func() {
    const view = this.base_func_locker();
    Atomics.store(view, 2, 1);
    Atomics.store(view, 1, 0);
    Atomics.notify(view, 1, 1);
  }
  wait_base_func() {
    const view = this.base_func_locker();
    const lock = Atomics.wait(view, 2, 1);
    if (lock === "timed-out") {
      throw new Error("timed-out lock");
    }
  }
  release_base_func() {
    const view = this.base_func_locker();
    Atomics.store(view, 0, 0);
    Atomics.notify(view, 0, 1);
  }
  set_park_fds_map(fds) {
    this.lock_base_func();
    const view = this.base_func_park_locker();
    Atomics.store(view, 0, 0);
    const fds_array = new Uint32Array(fds);
    this.allocator.block_write(fds_array, this.base_func_util, 1 + 3);
    Atomics.store(view, 3, this.id);
    this.call_base_func();
    this.wait_base_func();
    this.release_base_func();
  }
  destroy_park() {
    this.lock_base_func();
    const view = this.base_func_park_locker();
    Atomics.store(view, 0, 1);
    this.call_base_func();
    this.wait_base_func();
    this.release_base_func();
  }
  call_unknown_fn(arg) {
    this.lock_base_func();
    const view = this.base_func_park_locker();
    Atomics.store(view, 0, 2);
    const arg_str = JSON.stringify(arg);
    const arg_bytes = new TextEncoder().encode(arg_str);
    this.allocator.block_write(arg_bytes, this.base_func_util, 3 + 1);
    this.call_base_func();
    this.wait_base_func();
    const ret_ptr = Atomics.load(view, 3);
    const ret_len = Atomics.load(view, 4);
    let ret;
    if (ret_len > 0) {
      const ret_bytes = new Uint8Array(this.allocator.get_memory(ret_ptr, ret_len));
      this.allocator.free(ret_ptr, ret_len);
      const ret_str = new TextDecoder().decode(ret_bytes);
      ret = JSON.parse(ret_str);
    }
    this.release_base_func();
    return ret;
  }
  key = Math.round(Math.random() * 100);
  lock_fd(fd) {
    const view = new Int32Array(this.lock_fds, fd * 12);
    while (true) {
      const now_value = Atomics.load(view, 0);
      if (now_value !== 0) {
        const value = Atomics.wait(view, 0, now_value);
        if (value === "timed-out") {
          console.error("lock_fd timed-out");
          continue;
        }
      }
      const old = Atomics.compareExchange(view, 0, 0, 1);
      if (old === 0) {
        return;
      }
    }
  }
  release_fd(fd) {
    const view = new Int32Array(this.lock_fds, fd * 12);
    const before = Atomics.exchange(view, 0, 0);
    if (before !== 1) {
      console.error("what happened? before", before);
    }
    Atomics.notify(view, 0, 1);
  }
  lock_double_fd(fd1, fd2) {
    if (fd1 === fd2) {
      this.lock_fd(fd1);
      return;
    }
    const view = new Int32Array(this.lock_fds);
    while (true) {
      const now_value1 = Atomics.load(view, fd1 * 3);
      const value = Atomics.wait(view, fd1 * 3, now_value1);
      if (value === "timed-out") {
        console.error("lock_double_fd timed-out");
        continue;
      }
      const old1 = Atomics.exchange(view, fd1 * 3, 2);
      if (old1 === 0) {
        const now_value2 = Atomics.load(view, fd2 * 3);
        if (now_value2 === 2) {
          if (fd1 < fd2) {
            Atomics.store(view, fd1 * 3, 0);
            Atomics.notify(view, fd1 * 3, 1);
            continue;
          }
        }
        const value2 = Atomics.wait(view, fd2 * 3, now_value2);
        if (value2 === "timed-out") {
          console.error("lock_double_fd timed-out");
          continue;
        }
        const old2 = Atomics.exchange(view, fd2 * 3, 2);
        if (old2 === 0) {
          return;
        }
        Atomics.store(view, fd1 * 3, 0);
        Atomics.notify(view, fd1 * 3, 1);
      }
    }
  }
  release_double_fd(fd1, fd2) {
    if (fd1 === fd2) {
      this.release_fd(fd1);
      return;
    }
    const view = new Int32Array(this.lock_fds);
    Atomics.store(view, fd1 * 3, 0);
    Atomics.notify(view, fd1 * 3, 1);
    Atomics.store(view, fd2 * 3, 0);
    Atomics.notify(view, fd2 * 3, 1);
  }
  invoke_fd_func(fd) {
    if (fd === void 0) {
      return false;
    }
    const view = new Int32Array(this.lock_fds, fd * 12);
    Atomics.store(view, 2, 1);
    Atomics.store(view, 1, 0);
    const n = Atomics.notify(view, 1);
    if (n === 1) {
      return true;
    }
    if (n === 0) {
      const len = this.get_fds_len();
      if (len <= fd) {
        console.error("invoke_fd_func notify len failed:", n);
        Atomics.store(view, 2, 0);
        Atomics.store(view, 1, 1);
        return false;
      }
      console.warn("invoke_func_loop is late");
      return true;
    }
    console.error("invoke_fd_func notify too:", n);
    return false;
  }
  wait_fd_func(fd) {
    const view = new Int32Array(this.lock_fds, fd * 12);
    const value = Atomics.wait(view, 2, 1);
    if (value === "timed-out") {
      console.error("wait call park_fd_func timed-out");
    }
  }
  call_fd_func(fd) {
    if (!this.invoke_fd_func(fd)) {
      return false;
    }
    this.wait_fd_func(fd);
    return true;
  }
  get_error(fd) {
    const func_sig_view_i32 = new Int32Array(this.fd_func_sig, fd * fd_func_sig_bytes);
    const errno_offset = fd_func_sig_u32_size - 1;
    return Atomics.load(func_sig_view_i32, errno_offset);
  }
  fd_advise(fd) {
    this.lock_fd(fd);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, fd * fd_func_sig_bytes);
    Atomics.store(func_sig_view_u32, 0, 7);
    Atomics.store(func_sig_view_u32, 1, fd);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_allocate(fd, offset, len) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 8);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u64, 1, offset);
    Atomics.store(func_sig_view_u64, 2, len);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_close(fd) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 9);
    Atomics.store(func_sig_view_u32, 1, fd);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_datasync(fd) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 10);
    Atomics.store(func_sig_view_u32, 1, fd);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_fdstat_get(fd) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u8 = new Uint8Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u16 = new Uint16Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 11);
    Atomics.store(func_sig_view_u32, 1, fd);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error !== ERRNO_SUCCESS) {
      this.release_fd(fd);
      return [void 0, error];
    }
    const fs_filetype = Atomics.load(func_sig_view_u8, 0);
    const fs_flags = Atomics.load(func_sig_view_u16, 2);
    const fs_rights_base = Atomics.load(func_sig_view_u64, 1);
    const fs_rights_inheriting = Atomics.load(func_sig_view_u64, 2);
    this.release_fd(fd);
    const fd_stat = new Fdstat(fs_filetype, fs_flags);
    fd_stat.fs_rights_base = fs_rights_base;
    fd_stat.fs_rights_inherited = fs_rights_inheriting;
    return [fd_stat, error];
  }
  fd_fdstat_set_flags(fd, flags) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u16 = new Uint16Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 12);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u16, 4, flags);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_fdstat_set_rights(fd, fs_rights_base, fs_rights_inheriting) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 13);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u64, 1, fs_rights_base);
    Atomics.store(func_sig_view_u64, 2, fs_rights_inheriting);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_filestat_get(fd) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u8 = new Uint8Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 14);
    Atomics.store(func_sig_view_u32, 1, fd);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error !== ERRNO_SUCCESS) {
      this.release_fd(fd);
      return [void 0, error];
    }
    const fs_dev = Atomics.load(func_sig_view_u64, 0);
    const fs_ino = Atomics.load(func_sig_view_u64, 1);
    const fs_filetype = Atomics.load(func_sig_view_u8, 16);
    const fs_nlink = Atomics.load(func_sig_view_u64, 3);
    const fs_size = Atomics.load(func_sig_view_u64, 4);
    const fs_atim = Atomics.load(func_sig_view_u64, 5);
    const fs_mtim = Atomics.load(func_sig_view_u64, 6);
    const fs_ctim = Atomics.load(func_sig_view_u64, 7);
    this.release_fd(fd);
    const file_stat = gen_wasi_filestat(fs_dev, fs_ino, fs_filetype, fs_nlink, fs_size, fs_atim, fs_mtim, fs_ctim);
    return [file_stat, error];
  }
  fd_filestat_set_size(fd, size) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 15);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u64, 1, size);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_filestat_set_times(fd, st_atim, st_mtim, fst_flags) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u16 = new Uint16Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 16);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u64, 1, st_atim);
    Atomics.store(func_sig_view_u64, 2, st_mtim);
    Atomics.store(func_sig_view_u16, 12, fst_flags);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_pread(fd, iovs, offset) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 17);
    Atomics.store(func_sig_view_u32, 1, fd);
    const [ptr, len] = this.allocator.block_write(iovs, this.fd_func_sig, fd * fd_func_sig_u32_size + 2);
    Atomics.store(func_sig_view_u64, 2, offset);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    const nread = Atomics.load(func_sig_view_u32, 0);
    const buf_ptr = Atomics.load(func_sig_view_u32, 1);
    const buf_len = Atomics.load(func_sig_view_u32, 2);
    this.release_fd(fd);
    if (error === ERRNO_BADF) {
      this.allocator.free(buf_ptr, buf_len);
      return [void 0, error];
    }
    const buf = new Uint8Array(this.allocator.get_memory(buf_ptr, buf_len));
    if (nread !== buf_len) {
      console.error("pread nread !== buf_len");
    }
    this.allocator.free(buf_ptr, buf_len);
    return [[nread, buf], error];
  }
  fd_prestat_get(fd) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 18);
    Atomics.store(func_sig_view_u32, 1, fd);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error !== ERRNO_SUCCESS) {
      this.release_fd(fd);
      return [void 0, error];
    }
    const pr_tag = Atomics.load(func_sig_view_u32, 0);
    const pr_name_len = Atomics.load(func_sig_view_u32, 1);
    this.release_fd(fd);
    return [[pr_tag, pr_name_len], error];
  }
  fd_prestat_dir_name(fd, path_len) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 19);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u32, 2, path_len);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    const ret_path_ptr = Atomics.load(func_sig_view_u32, 0);
    const ret_path_len = Atomics.load(func_sig_view_u32, 1);
    this.release_fd(fd);
    if (error !== ERRNO_SUCCESS && error !== ERRNO_NAMETOOLONG) {
      this.allocator.free(ret_path_ptr, ret_path_len);
      return [void 0, error];
    }
    const ret_path = new Uint8Array(this.allocator.get_memory(ret_path_ptr, ret_path_len));
    this.allocator.free(ret_path_ptr, ret_path_len);
    return [ret_path, error];
  }
  fd_pwrite(fd, write_data, offset) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 20);
    Atomics.store(func_sig_view_u32, 1, fd);
    const [ptr, len] = this.allocator.block_write(write_data, this.fd_func_sig, fd * fd_func_sig_u32_size + 2);
    Atomics.store(func_sig_view_u64, 2, offset);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error === ERRNO_BADF) {
      this.release_fd(fd);
      return [void 0, error];
    }
    const nwritten = Atomics.load(func_sig_view_u32, 0);
    this.release_fd(fd);
    return [nwritten, error];
  }
  fd_read(fd, iovs) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 21);
    Atomics.store(func_sig_view_u32, 1, fd);
    const [ptr, len] = this.allocator.block_write(iovs, this.fd_func_sig, fd * fd_func_sig_u32_size + 2);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    const nread = Atomics.load(func_sig_view_u32, 0);
    const buf_ptr = Atomics.load(func_sig_view_u32, 1);
    const buf_len = Atomics.load(func_sig_view_u32, 2);
    this.release_fd(fd);
    if (error === ERRNO_BADF) {
      this.allocator.free(buf_ptr, buf_len);
      return [void 0, error];
    }
    const buf = new Uint8Array(this.allocator.get_memory(buf_ptr, buf_len));
    if (nread !== buf_len) {
      console.error("read nread !== buf_len");
    }
    this.allocator.free(buf_ptr, buf_len);
    return [[nread, buf], error];
  }
  fd_readdir(fd, limit_buf_len, cookie) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 22);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u32, 2, limit_buf_len);
    Atomics.store(func_sig_view_u64, 2, cookie);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    const buf_ptr = Atomics.load(func_sig_view_u32, 0);
    const buf_len = Atomics.load(func_sig_view_u32, 1);
    const buf_used = Atomics.load(func_sig_view_u32, 2);
    this.release_fd(fd);
    if (error === ERRNO_BADF) {
      this.allocator.free(buf_ptr, buf_len);
      return [void 0, error];
    }
    const buf = new Uint8Array(this.allocator.get_memory(buf_ptr, buf_len));
    this.allocator.free(buf_ptr, buf_len);
    return [[buf, buf_used], error];
  }
  fd_seek(fd, offset, whence) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u8 = new Uint8Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 24);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u64, 1, offset);
    Atomics.store(func_sig_view_u8, 16, whence);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error === ERRNO_BADF) {
      this.release_fd(fd);
      return [void 0, error];
    }
    const new_offset = Atomics.load(func_sig_view_u64, 0);
    this.release_fd(fd);
    return [new_offset, error];
  }
  fd_sync(fd) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 25);
    Atomics.store(func_sig_view_u32, 1, fd);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  fd_tell(fd) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 26);
    Atomics.store(func_sig_view_u32, 1, fd);
    if (!this.call_fd_func(fd)) {
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error === ERRNO_BADF) {
      this.release_fd(fd);
      return [void 0, error];
    }
    const offset = Atomics.load(func_sig_view_u64, 0);
    this.release_fd(fd);
    return [offset, error];
  }
  fd_write(fd, write_data) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 27);
    Atomics.store(func_sig_view_u32, 1, fd);
    const [ptr, len] = this.allocator.block_write(write_data, this.fd_func_sig, fd * fd_func_sig_u32_size + 2);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error === ERRNO_BADF) {
      this.release_fd(fd);
      return [void 0, error];
    }
    const nwritten = Atomics.load(func_sig_view_u32, 0);
    this.release_fd(fd);
    return [nwritten, error];
  }
  path_create_directory(fd, path3) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 28);
    Atomics.store(func_sig_view_u32, 1, fd);
    const [ptr, len] = this.allocator.block_write(path3, this.fd_func_sig, fd * fd_func_sig_u32_size + 2);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  path_filestat_get(fd, flags, path3) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u8 = new Uint8Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 29);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u32, 2, flags);
    const [ptr, len] = this.allocator.block_write(path3, this.fd_func_sig, fd * fd_func_sig_u32_size + 3);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error !== ERRNO_SUCCESS) {
      this.release_fd(fd);
      return [void 0, error];
    }
    const fs_dev = Atomics.load(func_sig_view_u64, 0);
    const fs_ino = Atomics.load(func_sig_view_u64, 1);
    const fs_filetype = Atomics.load(func_sig_view_u8, 16);
    const fs_nlink = Atomics.load(func_sig_view_u64, 3);
    const fs_size = Atomics.load(func_sig_view_u64, 4);
    const fs_atim = Atomics.load(func_sig_view_u64, 5);
    const fs_mtim = Atomics.load(func_sig_view_u64, 6);
    const fs_ctim = Atomics.load(func_sig_view_u64, 7);
    this.release_fd(fd);
    const file_stat = gen_wasi_filestat(fs_dev, fs_ino, fs_filetype, fs_nlink, fs_size, fs_atim, fs_mtim, fs_ctim);
    return [file_stat, error];
  }
  path_filestat_set_times(fd, flags, path3, st_atim, st_mtim, fst_flags) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u16 = new Uint16Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 30);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u32, 2, flags);
    const [ptr, len] = this.allocator.block_write(path3, this.fd_func_sig, fd * fd_func_sig_u32_size + 3);
    Atomics.store(func_sig_view_u64, 3, st_atim);
    Atomics.store(func_sig_view_u64, 4, st_mtim);
    Atomics.store(func_sig_view_u16, 12, fst_flags);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  path_link(old_fd, old_flags, old_path, new_fd, new_path) {
    this.lock_double_fd(old_fd, new_fd);
    const bytes_offset = old_fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 31);
    Atomics.store(func_sig_view_u32, 1, old_fd);
    Atomics.store(func_sig_view_u32, 2, old_flags);
    const [ptr1, len1] = this.allocator.block_write(old_path, this.fd_func_sig, old_fd * fd_func_sig_u32_size + 3);
    Atomics.store(func_sig_view_u32, 5, new_fd);
    const [ptr2, len2] = this.allocator.block_write(new_path, this.fd_func_sig, old_fd * fd_func_sig_u32_size + 6);
    if (!this.call_fd_func(old_fd)) {
      this.allocator.free(ptr1, len1);
      this.allocator.free(ptr2, len2);
      this.release_double_fd(old_fd, new_fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(old_fd);
    this.release_double_fd(old_fd, new_fd);
    return error;
  }
  path_open(fd, dirflags, path3, oflags, fs_rights_base, fs_rights_inheriting, fs_flags) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u16 = new Uint16Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    const func_sig_view_u64 = new BigUint64Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 32);
    Atomics.store(func_sig_view_u32, 1, fd);
    Atomics.store(func_sig_view_u32, 2, dirflags);
    const [ptr, len] = this.allocator.block_write(path3, this.fd_func_sig, fd * fd_func_sig_u32_size + 3);
    Atomics.store(func_sig_view_u32, 5, oflags);
    Atomics.store(func_sig_view_u64, 3, fs_rights_base);
    Atomics.store(func_sig_view_u64, 4, fs_rights_inheriting);
    Atomics.store(func_sig_view_u16, 20, fs_flags);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    if (error === ERRNO_SUCCESS) {
      const new_fd = Atomics.load(func_sig_view_u32, 0);
      this.release_fd(fd);
      return [new_fd, error];
    }
    this.release_fd(fd);
    return [void 0, error];
  }
  path_readlink(fd, path3, buf_len) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 33);
    Atomics.store(func_sig_view_u32, 1, fd);
    const [ptr, len] = this.allocator.block_write(path3, this.fd_func_sig, fd * fd_func_sig_u32_size + 2);
    Atomics.store(func_sig_view_u32, 4, buf_len);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return [void 0, ERRNO_BADF];
    }
    const error = this.get_error(fd);
    const nread = Atomics.load(func_sig_view_u32, 0);
    const ret_path_ptr = Atomics.load(func_sig_view_u32, 1);
    const ret_path_len = Atomics.load(func_sig_view_u32, 2);
    this.release_fd(fd);
    if (error !== ERRNO_SUCCESS && error !== ERRNO_NAMETOOLONG) {
      this.allocator.free(ret_path_ptr, ret_path_len);
      return [void 0, error];
    }
    const ret_path = new Uint8Array(this.allocator.get_memory(ret_path_ptr, ret_path_len));
    const ret_path_slice = ret_path.slice(0, nread);
    return [ret_path_slice, error];
  }
  path_remove_directory(fd, path3) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 34);
    Atomics.store(func_sig_view_u32, 1, fd);
    const [ptr, len] = this.allocator.block_write(path3, this.fd_func_sig, fd * fd_func_sig_u32_size + 2);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  path_rename(old_fd, old_path, new_fd, new_path) {
    this.lock_double_fd(old_fd, new_fd);
    const bytes_offset = old_fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 35);
    Atomics.store(func_sig_view_u32, 1, old_fd);
    const [ptr1, len1] = this.allocator.block_write(old_path, this.fd_func_sig, old_fd * fd_func_sig_u32_size + 2);
    Atomics.store(func_sig_view_u32, 4, new_fd);
    const [ptr2, len2] = this.allocator.block_write(new_path, this.fd_func_sig, old_fd * fd_func_sig_u32_size + 5);
    if (!this.call_fd_func(old_fd)) {
      this.allocator.free(ptr1, len1);
      this.allocator.free(ptr2, len2);
      this.release_double_fd(old_fd, new_fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(old_fd);
    this.release_double_fd(old_fd, new_fd);
    return error;
  }
  path_symlink(old_path, fd, new_path) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 36);
    const [ptr1, len1] = this.allocator.block_write(old_path, this.fd_func_sig, fd * fd_func_sig_u32_size + 1);
    Atomics.store(func_sig_view_u32, 3, fd);
    const [ptr2, len2] = this.allocator.block_write(new_path, this.fd_func_sig, fd * fd_func_sig_u32_size + 4);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr1, len1);
      this.allocator.free(ptr2, len2);
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
  path_unlink_file(fd, path3) {
    this.lock_fd(fd);
    const bytes_offset = fd * fd_func_sig_bytes;
    const func_sig_view_u32 = new Uint32Array(this.fd_func_sig, bytes_offset);
    Atomics.store(func_sig_view_u32, 0, 37);
    Atomics.store(func_sig_view_u32, 1, fd);
    const [ptr, len] = this.allocator.block_write(path3, this.fd_func_sig, fd * fd_func_sig_u32_size + 2);
    if (!this.call_fd_func(fd)) {
      this.allocator.free(ptr, len);
      this.release_fd(fd);
      return ERRNO_BADF;
    }
    const error = this.get_error(fd);
    this.release_fd(fd);
    return error;
  }
};
var deserialize = (serializedError) => {
  const error = new Error(serializedError.message);
  error.name = serializedError.name;
  error.stack = serializedError.stack?.replace(/.wasm:/g, ".wasm\n");
  error.cause = serializedError.cause;
  return error;
};
var WorkerBackgroundRef = class _WorkerBackgroundRef {
  allocator;
  lock;
  signature_input;
  constructor(allocator, lock, signature_input) {
    this.allocator = allocator;
    this.lock = lock;
    this.signature_input = signature_input;
  }
  block_lock_base_func() {
    const view = new Int32Array(this.lock);
    while (true) {
      const lock = Atomics.wait(view, 0, 1);
      if (lock === "timed-out") {
        throw new Error("timed-out lock");
      }
      const old = Atomics.compareExchange(view, 0, 0, 1);
      if (old === 0) {
        return;
      }
    }
  }
  async async_lock_base_func() {
    const view = new Int32Array(this.lock);
    while (true) {
      const { value } = Atomics.waitAsync(view, 0, 1);
      if (await value === "timed-out") {
        throw new Error("timed-out lock");
      }
      const old = Atomics.compareExchange(view, 0, 0, 1);
      if (old === 0) {
        return;
      }
    }
  }
  call_base_func() {
    const view = new Int32Array(this.lock);
    Atomics.store(view, 2, 1);
    Atomics.store(view, 1, 0);
    Atomics.notify(view, 1, 1);
  }
  block_wait_base_func() {
    const view = new Int32Array(this.lock);
    const lock = Atomics.wait(view, 2, 1);
    if (lock === "timed-out") {
      throw new Error("timed-out lock");
    }
  }
  async async_wait_base_func() {
    const view = new Int32Array(this.lock);
    const { value } = Atomics.waitAsync(view, 2, 1);
    if (await value === "timed-out") {
      throw new Error("timed-out lock");
    }
  }
  release_base_func() {
    const view = new Int32Array(this.lock);
    Atomics.store(view, 0, 0);
    Atomics.notify(view, 0, 1);
  }
  new_worker(url2, options, post_obj) {
    console.log("new_worker", url2, options, post_obj);
    this.block_lock_base_func();
    const view = new Int32Array(this.signature_input);
    Atomics.store(view, 0, 1);
    const url_buffer = new TextEncoder().encode(url2);
    this.allocator.block_write(url_buffer, this.signature_input, 1);
    Atomics.store(view, 3, options?.type === "module" ? 1 : 0);
    const obj_json = JSON.stringify(post_obj);
    const obj_buffer = new TextEncoder().encode(obj_json);
    this.allocator.block_write(obj_buffer, this.signature_input, 4);
    this.call_base_func();
    this.block_wait_base_func();
    const id = Atomics.load(view, 0);
    this.release_base_func();
    return new WorkerRef(id);
  }
  async async_start_on_thread(url2, options, post_obj) {
    await this.async_lock_base_func();
    const view = new Int32Array(this.signature_input);
    Atomics.store(view, 0, 2);
    const url_buffer = new TextEncoder().encode(url2);
    await this.allocator.async_write(url_buffer, this.signature_input, 1);
    Atomics.store(view, 3, options?.type === "module" ? 1 : 0);
    const obj_json = JSON.stringify(post_obj);
    const obj_buffer = new TextEncoder().encode(obj_json);
    await this.allocator.async_write(obj_buffer, this.signature_input, 4);
    this.call_base_func();
    await this.async_wait_base_func();
    this.release_base_func();
  }
  block_start_on_thread(url2, options, post_obj) {
    this.block_lock_base_func();
    const view = new Int32Array(this.signature_input);
    Atomics.store(view, 0, 2);
    const url_buffer = new TextEncoder().encode(url2);
    this.allocator.block_write(url_buffer, this.signature_input, 1);
    Atomics.store(view, 3, options?.type === "module" ? 1 : 0);
    const obj_json = JSON.stringify(post_obj);
    const obj_buffer = new TextEncoder().encode(obj_json);
    this.allocator.block_write(obj_buffer, this.signature_input, 4);
    this.call_base_func();
    this.block_wait_base_func();
    this.release_base_func();
  }
  static init_self(sl) {
    return new _WorkerBackgroundRef(AllocatorUseArrayBuffer.init_self(sl.allocator), sl.lock, sl.signature_input);
  }
  done_notify(code) {
    const notify_view = new Int32Array(this.lock, 12);
    const old = Atomics.compareExchange(notify_view, 0, 0, 2);
    if (old !== 0) {
      console.error("what happened?");
      return;
    }
    Atomics.store(notify_view, 1, code);
    const num = Atomics.notify(notify_view, 0);
    if (num === 0) {
      Atomics.store(notify_view, 0, 0);
    }
  }
  async async_wait_done_or_error() {
    const notify_view = new Int32Array(this.lock, 12);
    Atomics.store(notify_view, 0, 0);
    let value;
    const { value: _value } = Atomics.waitAsync(notify_view, 0, 0);
    if (_value instanceof Promise) {
      value = await _value;
    } else {
      value = _value;
    }
    if (value === "timed-out") {
      throw new Error("timed-out");
    }
    const code = Atomics.load(notify_view, 0);
    if (code === 3) {
      const old2 = Atomics.compareExchange(notify_view, 0, 3, 0);
      if (old2 !== 3) {
        console.error("what happened?");
      }
      return 0;
    }
    if (code === 2) {
      const old2 = Atomics.compareExchange(notify_view, 0, 2, 0);
      const code2 = Atomics.load(notify_view, 1);
      if (old2 !== 2) {
        console.error("what happened?");
      }
      return code2;
    }
    if (code !== 1) {
      throw new Error("unknown code");
    }
    const ptr = Atomics.load(notify_view, 1);
    const size = Atomics.load(notify_view, 2);
    const error_buffer = this.allocator.get_memory(ptr, size);
    const error_txt = new TextDecoder().decode(error_buffer);
    const error_serialized = JSON.parse(error_txt);
    const error = deserialize(error_serialized);
    const old = Atomics.compareExchange(notify_view, 0, 1, 0);
    if (old !== 1) {
      console.error("what happened?");
    }
    throw error;
  }
  block_wait_done_or_error() {
    const notify_view = new Int32Array(this.lock, 12);
    Atomics.store(notify_view, 0, 0);
    const value = Atomics.wait(notify_view, 0, 0);
    if (value === "timed-out") {
      throw new Error("timed-out");
    }
    const code = Atomics.load(notify_view, 0);
    if (code === 3) {
      const old2 = Atomics.compareExchange(notify_view, 0, 3, 0);
      if (old2 !== 3) {
        console.error("what happened?");
      }
      return 0;
    }
    if (code === 2) {
      const old2 = Atomics.compareExchange(notify_view, 0, 2, 0);
      const code2 = Atomics.load(notify_view, 1);
      if (old2 !== 2) {
        console.error("what happened?");
      }
      return code2;
    }
    if (code !== 1) {
      throw new Error("unknown code");
    }
    const ptr = Atomics.load(notify_view, 1);
    const size = Atomics.load(notify_view, 2);
    const error_buffer = this.allocator.get_memory(ptr, size);
    const error_txt = new TextDecoder().decode(error_buffer);
    const error_serialized = JSON.parse(error_txt);
    const error = deserialize(error_serialized);
    const old = Atomics.compareExchange(notify_view, 0, 1, 0);
    if (old !== 1) {
      console.error("what happened?");
    }
    throw error;
  }
  terminate_all_workers() {
    this.block_lock_base_func();
    const view = new Int32Array(this.signature_input);
    Atomics.store(view, 0, 3);
    this.call_base_func();
    this.block_wait_base_func();
    this.release_base_func();
  }
  destroy() {
    this.block_lock_base_func();
    const view = new Int32Array(this.signature_input);
    Atomics.store(view, 0, 5);
    this.call_base_func();
    this.block_wait_base_func();
    this.release_base_func();
  }
  kill_animal(id) {
    this.block_lock_base_func();
    const view = new Int32Array(this.signature_input);
    Atomics.store(view, 0, 4);
    Atomics.store(view, 1, id);
    this.call_base_func();
    this.block_wait_base_func();
    this.release_base_func();
  }
};
var WorkerRef = class {
  id;
  constructor(id) {
    this.id = id;
  }
  get_id() {
    return this.id;
  }
};
var url = () => {
  const code = 'let worker_background;class AllocatorUseArrayBuffer{share_arrays_memory;constructor(e=new SharedArrayBuffer(0xa00000)){this.share_arrays_memory=e;const r=new Int32Array(this.share_arrays_memory);Atomics.store(r,0,0),Atomics.store(r,1,0),Atomics.store(r,2,12)}static init_self(e){return new AllocatorUseArrayBuffer(e.share_arrays_memory)}async async_write(e,r,t){let o=new Int32Array(this.share_arrays_memory);for(;;){let{value:s}=Atomics.waitAsync(o,0,1);if("timed-out"===(s instanceof Promise?await s:s))throw Error("timed-out lock");if(0!==Atomics.compareExchange(o,0,0,1))continue;let i=this.write_inner(e,r,t);return Atomics.store(o,0,0),Atomics.notify(o,0,1),i}}block_write(e,r,t){for(;;){let o=new Int32Array(this.share_arrays_memory);if("timed-out"===Atomics.wait(o,0,1))throw Error("timed-out lock");if(0!==Atomics.compareExchange(o,0,0,1))continue;let s=this.write_inner(e,r,t);return Atomics.store(o,0,0),Atomics.notify(o,0,1),s}}write_inner(e,r,t){let o,s,i=new Int32Array(this.share_arrays_memory),a=new Uint8Array(this.share_arrays_memory);o=0===Atomics.add(i,1,1)?Atomics.store(i,2,12):Atomics.load(i,2);let n=this.share_arrays_memory.byteLength,c=e.byteLength,l=o+c;if(n<l)throw Error("size is bigger than memory. \\nTODO! fix memory limit. support big size another way.");if(e instanceof Uint8Array)s=e;else if(e instanceof Uint32Array){let r=new ArrayBuffer(e.byteLength);new Uint32Array(r).set(e),s=new Uint8Array(r)}a.set(new Uint8Array(s),o),Atomics.store(i,2,l);let w=new Int32Array(r);return Atomics.store(w,t,o),Atomics.store(w,t+1,c),[o,c]}free(e,r){Atomics.sub(new Int32Array(this.share_arrays_memory),1,1)}get_memory(e,r){let t=new ArrayBuffer(r);return new Uint8Array(t).set(new Uint8Array(this.share_arrays_memory).slice(e,e+r)),t}use_defined_memory(e,r,t){new Uint8Array(this.share_arrays_memory).set(new Uint8Array(t).slice(0,r),e)}get_object(){return{share_arrays_memory:this.share_arrays_memory}}}const serialize=e=>({message:e.message,name:e.name,stack:e.stack,cause:e.cause});let WorkerBackground=class e{override_object;allocator;lock;signature_input;workers=[void 0];listen_holder;start_worker;animal_workers=new Map;constructor(e,r,t,o){this.override_object=e,this.lock=r??new SharedArrayBuffer(24),this.allocator=t??new AllocatorUseArrayBuffer(new SharedArrayBuffer(10240)),this.signature_input=o??new SharedArrayBuffer(24),this.listen_holder=this.listen()}static init_self(r,t){return new e(r,t.lock,AllocatorUseArrayBuffer.init_self(t.allocator),t.signature_input)}assign_worker_id(){for(let e=1;e<this.workers.length;e++)if(void 0===this.workers[e])return e;return this.workers.push(void 0),this.workers.length-1}ref(){return{allocator:this.allocator.get_object(),lock:this.lock,signature_input:this.signature_input}}destroy(){let e=0;for(let r of this.workers)void 0!==r&&(r.terminate(),console.debug("terminate worker "+e)),e++;void 0!==this.start_worker&&(this.start_worker.terminate(),console.debug("terminate start worker")),this.start_worker=void 0,this.animal_workers.clear()}async listen(){let e=new Int32Array(this.lock);Atomics.store(e,0,0),Atomics.store(e,1,1);let r=new Int32Array(this.signature_input);for(;;){let{value:t}=Atomics.waitAsync(e,1,1);if(await t==="timed-out")throw Error("timed-out");let o=()=>{let e=Atomics.load(r,1),t=Atomics.load(r,2),o=this.allocator.get_memory(e,t);return this.allocator.free(e,t),new Worker(new TextDecoder().decode(o),{type:1===Atomics.load(r,3)?"module":"classic"})},s=()=>{let e=Atomics.load(r,4),t=Atomics.load(r,5),o=this.allocator.get_memory(e,t);return this.allocator.free(e,t),JSON.parse(new TextDecoder().decode(o))};switch(Atomics.load(r,0)){case 1:{let e=o(),t=s(),i=this.assign_worker_id();console.debug("new worker "+i),this.workers[i]=e;let{promise:a,resolve:n}=Promise.withResolvers();e.onmessage=async r=>{let{msg:t,animal_id:o}=r.data;if("ready"===t&&(void 0!==o&&this.animal_workers.set(o,e),n()),"done"===t&&(this.workers[i].terminate(),this.workers[i]=void 0,void 0!==o&&this.animal_workers.delete(o),console.debug(`worker ${i} done so terminate`)),"error"===t||"exit"===t){this.workers[i]=void 0,void 0!==o&&this.animal_workers.delete(o);let e=0;for(let r of this.workers)void 0!==r&&(r.terminate(),"error"===t?console.warn("wasi throw error but child process exists, terminate "+e):console.debug("wasi exit but child process exists, terminate "+e)),e++;void 0!==this.start_worker&&(this.start_worker.terminate(),"error"===t?console.warn("wasi throw error but wasi exists, terminate wasi"):console.debug("wasi exit but wasi exists, terminate wasi")),this.workers=[void 0],this.start_worker=void 0,this.animal_workers.clear();let s=new Int32Array(this.lock,12);if("error"===t){let e=r.data.error,t=serialize(e),[o,i]=await this.allocator.async_write(new TextEncoder().encode(JSON.stringify(t)),this.lock,4);if(0!==Atomics.compareExchange(s,0,0,1)){console.error("what happened?"),this.allocator.free(o,i);return}1!==Atomics.notify(s,0)&&(console.error(e),this.allocator.free(o,i),Atomics.store(s,0,0))}else{let e=r.data.code;if(0!==Atomics.compareExchange(s,0,0,2))return void console.error("what happened?");Atomics.store(s,1,e),0===Atomics.notify(s,0)&&Atomics.store(s,0,0)}}},e.postMessage({...this.override_object,...t,worker_id:i,worker_background_ref:this.ref()}),await a,Atomics.store(r,0,i);break}case 2:{console.debug("start worker create"),this.start_worker=o();let e=s();this.start_worker.onmessage=async e=>{let{msg:r,animal_id:t}=e.data;if("ready"===r&&void 0!==t&&this.animal_workers.set(t,this.start_worker),"done"===r){let e=0;for(let r of this.workers)void 0!==r&&(r.terminate(),console.warn("wasi done but worker exists, terminate "+e)),e++;this.start_worker.terminate(),this.start_worker=void 0,void 0!==t&&this.animal_workers.delete(t);let r=new Int32Array(this.lock,12);Atomics.store(r,0,3),0===Atomics.notify(r,0)&&Atomics.store(r,0,0),console.debug("start worker done so terminate")}if("error"===r||"exit"===r){let t=0;for(let e of this.workers)void 0!==e&&(e.terminate(),"error"===r?console.warn("wasi throw error but worker exists, terminate "+t):console.debug("wasi exit but worker exists, terminate "+t)),t++;void 0!==this.start_worker&&(this.start_worker.terminate(),"error"===r?console.warn("wasi throw error but wasi exists, terminate start worker"):console.debug("wasi exit but wasi exists, terminate start worker")),this.workers=[void 0],this.start_worker=void 0,this.animal_workers.clear();let o=new Int32Array(this.lock,12);if("error"===r){let r=e.data.error,t=serialize(r),[s,i]=await this.allocator.async_write(new TextEncoder().encode(JSON.stringify(t)),this.lock,4);if(0!==Atomics.compareExchange(o,0,0,1)){console.error("what happened?"),this.allocator.free(s,i);return}if(0===Atomics.notify(o,0))throw this.allocator.free(s,i),Atomics.store(o,0,0),r}else{let r=e.data.code;if(0!==Atomics.compareExchange(o,0,0,2))return void console.error("what happened?");Atomics.store(o,1,r),0===Atomics.notify(o,0)&&Atomics.store(o,0,0)}}},this.start_worker.postMessage({...this.override_object,...e,worker_background_ref:this.ref()});break}case 3:{console.debug("terminate all workers");let e=0;for(let r of this.workers)void 0!==r&&(r.terminate(),console.debug("terminate worker "+e)),e++;void 0!==this.start_worker&&(this.start_worker.terminate(),console.debug("terminate start worker")),this.workers=[void 0],this.start_worker=void 0;break}case 4:{let e=Atomics.load(r,1);console.debug("kill animal "+e);let t=this.animal_workers.get(e);void 0!==t?(t.postMessage({msg:"kill_animal",animal_id:e}),this.animal_workers.delete(e)):console.warn(`animal ${e} not found`);break}case 5:console.debug("destroy worker background"),this.destroy()}Atomics.store(e,1,1),Atomics.store(e,2,0),0===Atomics.notify(e,2,1)&&console.warn("notify failed, waiter is late")}}};globalThis.onmessage=e=>{let{override_object:r,worker_background_ref_object:t}=e.data;worker_background=WorkerBackground.init_self(r,t),postMessage("ready")};';
  const blob = new Blob([code], { type: "application/javascript" });
  const url2 = URL.createObjectURL(blob);
  return url2;
};
var WorkerBackgroundRefObjectConstructor = () => {
  return { allocator: { share_arrays_memory: new SharedArrayBuffer(10 * 1024) }, lock: new SharedArrayBuffer(24), signature_input: new SharedArrayBuffer(24) };
};
var ThreadSpawner = class _ThreadSpawner {
  share_memory;
  wasi_farm_refs_object;
  worker_url;
  worker_background_ref;
  worker_background_ref_object;
  destroy_status;
  animal_id_counter;
  worker_background_worker;
  worker_background_worker_promise;
  constructor(worker_url, wasi_farm_refs_object, share_memory, MIN_STACK = 16777216, worker_background_ref_object, thread_spawn_wasm, worker_background_worker_url2, destroy_status, animal_id_counter) {
    this.worker_url = worker_url;
    this.wasi_farm_refs_object = wasi_farm_refs_object;
    this.destroy_status = destroy_status ?? new SharedArrayBuffer(8);
    this.animal_id_counter = animal_id_counter ?? new SharedArrayBuffer(4);
    if (share_memory === void 0) {
      const min_initial_size = 1048576 / 65536;
      const initial_size = MIN_STACK / 65536;
      if (initial_size < min_initial_size) {
        throw new Error(`The stack size must be at least ${min_initial_size} bytes.`);
      }
      const max_memory = 1073741824 / 65536;
      this.share_memory = { memory: new WebAssembly.Memory({ initial: initial_size, maximum: max_memory, shared: true }) };
    } else {
      this.share_memory = share_memory;
    }
    if (worker_background_ref_object === void 0) {
      let worker_background_worker_url__;
      if (worker_background_worker_url2) {
        worker_background_worker_url__ = worker_background_worker_url2;
      } else {
        worker_background_worker_url__ = url();
      }
      this.worker_background_worker = new Worker(worker_background_worker_url__, { type: "module" });
      if (!worker_background_worker_url2) {
        URL.revokeObjectURL(worker_background_worker_url__);
      }
      const { promise, resolve: resolve2 } = Promise.withResolvers();
      this.worker_background_worker_promise = promise;
      this.worker_background_worker.onmessage = () => {
        this.worker_background_worker_promise = void 0;
        resolve2();
      };
      this.worker_background_ref_object = WorkerBackgroundRefObjectConstructor();
      this.worker_background_ref = WorkerBackgroundRef.init_self(this.worker_background_ref_object);
      this.worker_background_worker.postMessage({ override_object: { sl_object: this.get_object(), thread_spawn_wasm }, worker_background_ref_object: structuredClone(this.worker_background_ref_object) });
    } else {
      this.worker_background_ref_object = worker_background_ref_object;
      this.worker_background_ref = WorkerBackgroundRef.init_self(this.worker_background_ref_object);
    }
  }
  async wait_worker_background_worker() {
    if (this.worker_background_worker_promise) {
      await this.worker_background_worker_promise;
      return;
    }
    return;
  }
  check_worker_background_worker() {
    if (this.worker_background_worker_promise) {
      throw new Error("worker_background_worker is not ready.");
    }
  }
  thread_spawn(start_arg, args, env, fd_map) {
    const worker = this.worker_background_ref.new_worker(this.worker_url, { type: "module" }, { this_is_thread_spawn: true, start_arg, args, env, fd_map });
    const thread_id = worker.get_id();
    return thread_id;
  }
  create_destroyer() {
    return new DestroyerHandle(this.worker_background_ref, this.destroy_status);
  }
  generate_animal_id() {
    const buffer = new Int32Array(this.animal_id_counter);
    return Atomics.add(buffer, 0, 1);
  }
  async async_start_on_thread(args, env, fd_map) {
    if (!self.Worker.toString().includes("[native code]")) {
      if (self.Worker.toString().includes("function")) {
        console.warn("SubWorker(new Worker on Worker) is polyfilled maybe.");
      } else {
        throw new Error("SubWorker(new Worker on Worker) is not supported.");
      }
    }
    await this.worker_background_ref.async_start_on_thread(this.worker_url, { type: "module" }, { this_is_thread_spawn: true, this_is_start: true, args, env, fd_map });
  }
  block_start_on_thread(args, env, fd_map) {
    if (!self.Worker.toString().includes("[native code]")) {
      if (self.Worker.toString().includes("function")) {
        console.warn("SubWorker(new Worker on Worker) is polyfilled maybe.");
      } else {
        throw new Error("SubWorker(new Worker on Worker) is not supported.");
      }
    }
    this.worker_background_ref.block_start_on_thread(this.worker_url, { type: "module" }, { this_is_thread_spawn: true, this_is_start: true, args, env, fd_map });
  }
  static init_self(sl) {
    const thread_spawner = new _ThreadSpawner(sl.worker_url, sl.wasi_farm_refs_object, sl.share_memory, void 0, sl.worker_background_ref_object, void 0, void 0, sl.destroy_status, sl.animal_id_counter);
    return thread_spawner;
  }
  static init_self_with_worker_background_ref(sl, worker_background_ref_object) {
    const thread_spawner = new _ThreadSpawner(sl.worker_url, sl.wasi_farm_refs_object, sl.share_memory, void 0, worker_background_ref_object, void 0, void 0, sl.destroy_status, sl.animal_id_counter);
    return thread_spawner;
  }
  get_share_memory() {
    return this.share_memory;
  }
  get_object() {
    return { share_memory: this.share_memory, wasi_farm_refs_object: this.wasi_farm_refs_object, worker_url: this.worker_url, worker_background_ref_object: this.worker_background_ref_object, destroy_status: this.destroy_status, animal_id_counter: this.animal_id_counter };
  }
  done_notify(code) {
    this.worker_background_ref.done_notify(code);
  }
  async async_wait_done_or_error() {
    if (this.worker_background_worker === void 0) {
      throw new Error("worker_background_worker is undefined.");
    }
    return await this.worker_background_ref.async_wait_done_or_error();
  }
  block_wait_done_or_error() {
    if (this.worker_background_worker === void 0) {
      throw new Error("worker_background_worker is undefined.");
    }
    return this.worker_background_ref.block_wait_done_or_error();
  }
  destroy() {
    const view = new Int32Array(this.destroy_status);
    Atomics.store(view, 0, 1);
    Atomics.store(view, 1, 1);
    this.worker_background_ref.destroy();
    Atomics.store(view, 0, 0);
    Atomics.notify(view, 0);
    if (this.worker_background_worker) {
      this.worker_background_worker = void 0;
    }
  }
  kill_animal(id) {
    this.worker_background_ref.kill_animal(id);
  }
};
var thread_spawn_on_worker = async (msg, instantiate = WebAssembly.instantiate.bind(WebAssembly), callback = () => {
}) => {
  if (msg.this_is_thread_spawn) {
    const { sl_object, fd_map, worker_background_ref, thread_spawn_wasm, args, env } = msg;
    const override_fd_map = new Array(sl_object.wasi_farm_refs_object.length);
    for (const fd_and_wasi_ref_n of fd_map) {
      if (fd_and_wasi_ref_n == void 0) {
        continue;
      }
      const [fd, wasi_ref_n] = fd_and_wasi_ref_n;
      if (override_fd_map[wasi_ref_n] === void 0) {
        override_fd_map[wasi_ref_n] = [];
      }
      override_fd_map[wasi_ref_n].push(fd);
    }
    const thread_spawner = ThreadSpawner.init_self_with_worker_background_ref(sl_object, worker_background_ref);
    if (msg.this_is_start) {
      const wasi2 = new WASIFarmAnimal(sl_object.wasi_farm_refs_object, args, env, { can_thread_spawn: true, thread_spawn_worker_url: sl_object.worker_url, hand_override_fd_map: fd_map }, override_fd_map, thread_spawner);
      callback(wasi2);
      const inst2 = await instantiate(thread_spawn_wasm, { env: { ...wasi2.get_share_memory() }, wasi: wasi2.wasiThreadImport, wasi_snapshot_preview1: wasi2.wasiImport });
      try {
        wasi2.start_only(inst2);
      } catch (e) {
        check_error(e, "main");
        return wasi2;
      }
      globalThis.postMessage({ msg: "done" });
      return wasi2;
    }
    const { worker_id: thread_id, start_arg } = msg;
    console.debug(`thread_spawn worker ${thread_id} start`);
    const wasi = new WASIFarmAnimal(sl_object.wasi_farm_refs_object, args, env, { can_thread_spawn: true, thread_spawn_worker_url: sl_object.worker_url, hand_override_fd_map: fd_map }, override_fd_map, thread_spawner);
    callback(wasi);
    const inst = await instantiate(thread_spawn_wasm, { env: { ...wasi.get_share_memory() }, wasi: wasi.wasiThreadImport, wasi_snapshot_preview1: wasi.wasiImport });
    globalThis.postMessage({ msg: "ready" });
    try {
      wasi.wasi_thread_start(inst, thread_id, start_arg);
    } catch (e) {
      check_error(e, thread_id);
      return wasi;
    }
    globalThis.postMessage({ msg: "done" });
    return wasi;
  }
};
function check_error(e, thread_id) {
  let e_alt;
  if (e instanceof WASIProcExit) {
    globalThis.postMessage({ msg: "exit", code: e.code });
    return;
  }
  try {
    structuredClone(e);
  } catch (error) {
    if (error.name === "DataCloneError") {
      e_alt = new Error(`An error occurred on the thread ${thread_id}, but it cannot be cloned.
                Since error propagation does not work properly with this,
                stopping cannot be performed.
                Therefore, I will insert this error instead.
                The error currently confirmed occurs in Firefox,
                after executing with invoke on webworker and reaching an unreachable statement.
                `);
      e_alt.name = "EncounteredUncloneableError";
      e_alt.stack = e.stack;
    }
  }
  if (e_alt === void 0) {
    e_alt = e;
  }
  globalThis.postMessage({ msg: "error", error: e_alt });
}
var WASIFarmAnimal = class {
  args;
  env;
  wasi_farm_refs;
  id_in_wasi_farm_ref;
  inst;
  wasiImport;
  wasiThreadImport;
  animal_id;
  can_array_buffer;
  sleepBuffer = new Int32Array(new SharedArrayBuffer(4));
  can_thread_spawn;
  thread_spawner;
  async wait_worker_background_worker() {
    await this.thread_spawner?.wait_worker_background_worker();
  }
  check_worker_background_worker() {
    this.thread_spawner?.check_worker_background_worker();
  }
  fd_map = [];
  get_fd_and_wasi_ref(fd) {
    const mapped_fd_and_wasi_ref_n = this.fd_map[fd];
    if (!mapped_fd_and_wasi_ref_n) {
      return [void 0, void 0];
    }
    const [mapped_fd, wasi_ref_n] = mapped_fd_and_wasi_ref_n;
    return [mapped_fd, this.wasi_farm_refs[wasi_ref_n]];
  }
  get_fd_and_wasi_ref_n(fd) {
    const mapped_fd_and_wasi_ref_n = this.fd_map[fd];
    if (!mapped_fd_and_wasi_ref_n) {
      return [void 0, void 0];
    }
    const [mapped_fd, wasi_ref_n] = mapped_fd_and_wasi_ref_n;
    return [mapped_fd, wasi_ref_n];
  }
  start(instance) {
    this.inst = instance;
    try {
      instance.exports._start();
      if (this.can_thread_spawn) {
        if (!this.thread_spawner) {
          throw new Error("You should enable thread_spawn to use create_destroyer");
        }
        this.thread_spawner.done_notify(0);
      }
      return 0;
    } catch (e) {
      if (e instanceof WASIProcExit) {
        if (this.can_thread_spawn) {
          this.thread_spawner.done_notify(e.code);
        }
        return e.code;
      }
      throw e;
    }
  }
  start_only(instance) {
    this.inst = instance;
    instance.exports._start();
  }
  initialize_only(instance) {
    this.inst = instance;
  }
  async async_start_on_thread() {
    if (!this.can_thread_spawn || !this.thread_spawner) {
      throw new Error("thread_spawn is not supported");
    }
    await this.wait_worker_background_worker();
    if (this.inst) {
      throw new Error("what happened?");
    }
    const memories = this.thread_spawner.get_share_memory();
    for (const share_memory in memories) {
      const view = new Uint8Array(memories[share_memory].buffer);
      view.fill(0);
    }
    const code_promise = this.thread_spawner.async_wait_done_or_error();
    await this.thread_spawner.async_start_on_thread(this.args, this.env, this.fd_map);
    const code = await code_promise;
    return code;
  }
  block_start_on_thread() {
    if (!this.can_thread_spawn || !this.thread_spawner) {
      throw new Error("thread_spawn is not supported");
    }
    console.log("block_start_on_thread");
    this.check_worker_background_worker();
    console.log("block_start_on_thread");
    if (this.inst) {
      throw new Error("what happened?");
    }
    const memories = this.thread_spawner.get_share_memory();
    for (const share_memory in memories) {
      const view = new Uint8Array(memories[share_memory].buffer);
      view.fill(0);
    }
    console.log("block_start_on_thread: start");
    this.thread_spawner.block_start_on_thread(this.args, this.env, this.fd_map);
    console.log("block_start_on_thread: wait");
    const code = this.thread_spawner.block_wait_done_or_error();
    console.log("block_start_on_thread: done");
    return code;
  }
  wasi_thread_start(instance, thread_id, start_arg) {
    this.inst = instance;
    instance.exports.wasi_thread_start(thread_id, start_arg);
  }
  initialize(instance) {
    this.inst = instance;
    if (instance.exports._initialize) {
      instance.exports._initialize();
    }
  }
  mapping_fds(wasi_farm_refs, override_fd_maps) {
    this.fd_map = [void 0, void 0, void 0];
    for (let i = 0; i < wasi_farm_refs.length; i++) {
      const wasi_farm_ref = wasi_farm_refs[i];
      const override_fd_map = override_fd_maps ? override_fd_maps[i] : wasi_farm_ref.default_fds;
      const stdin = wasi_farm_ref.get_stdin();
      const stdout = wasi_farm_ref.get_stdout();
      const stderr = wasi_farm_ref.get_stderr();
      if (stdin !== void 0) {
        if (this.fd_map[0] === void 0) {
          if (override_fd_map.includes(stdin)) {
            this.fd_map[0] = [stdin, i];
          }
        }
      }
      if (stdout !== void 0) {
        if (this.fd_map[1] === void 0) {
          if (override_fd_map.includes(stdout)) {
            this.fd_map[1] = [stdout, i];
          }
        }
      }
      if (stderr !== void 0) {
        if (this.fd_map[2] === void 0) {
          if (override_fd_map.includes(stderr)) {
            this.fd_map[2] = [stderr, i];
          }
        }
      }
      for (const j of override_fd_map) {
        if (j === stdin || j === stdout || j === stderr) {
          continue;
        }
        this.map_new_fd(j, i);
      }
      wasi_farm_ref.set_park_fds_map(override_fd_map);
    }
    if (this.fd_map[0] === void 0) {
      throw new Error("stdin is not found");
    }
    if (this.fd_map[1] === void 0) {
      throw new Error("stdout is not found");
    }
    if (this.fd_map[2] === void 0) {
      throw new Error("stderr is not found");
    }
  }
  map_new_fd(fd, wasi_ref_n) {
    let n = -1;
    for (let i = 3; i < this.fd_map.length; i++) {
      if (this.fd_map[i] === void 0) {
        n = i;
        break;
      }
    }
    if (n === -1) {
      n = this.fd_map.push(void 0) - 1;
    }
    this.fd_map[n] = [fd, wasi_ref_n];
    return n;
  }
  map_new_fd_and_notify(fd, wasi_ref_n) {
    const n = this.map_new_fd(fd, wasi_ref_n);
    this.wasi_farm_refs[wasi_ref_n].set_park_fds_map([fd]);
    return n;
  }
  check_fds() {
    const rm_fds = [];
    for (let i = 0; i < this.id_in_wasi_farm_ref.length; i++) {
      const id = this.id_in_wasi_farm_ref[i];
      const removed_fds = this.wasi_farm_refs[i].get(id);
      if (removed_fds) {
        for (const fd of removed_fds) {
          rm_fds.push([fd, i]);
        }
      }
    }
    if (rm_fds.length > 0) {
      for (let i = 0; i < this.fd_map.length; i++) {
        const fd_and_wasi_ref_n = this.fd_map[i];
        if (!fd_and_wasi_ref_n) {
          continue;
        }
        const [fd, wasi_ref_n] = fd_and_wasi_ref_n;
        for (const [rm_fd_fd, rm_fd_wasi_ref_n] of rm_fds) {
          if (fd === rm_fd_fd && wasi_ref_n === rm_fd_wasi_ref_n) {
            this.fd_map[i] = void 0;
            break;
          }
        }
      }
    }
  }
  get_share_memory() {
    if (!this.thread_spawner) {
      throw new Error("thread_spawner is not defined");
    }
    return this.thread_spawner.get_share_memory();
  }
  create_destroyer() {
    if (!this.thread_spawner) {
      throw new Error("You should enable thread_spawn to use create_destroyer");
    }
    return this.thread_spawner?.create_destroyer();
  }
  destroy() {
    if (this.thread_spawner) {
      this.thread_spawner.destroy();
    }
    this.inst = void 0;
    this.wasi_farm_refs = [];
    this.id_in_wasi_farm_ref = [];
    this.fd_map = [];
    this.thread_spawner = void 0;
  }
  destroy_park(n) {
    if (n < 0 || n >= this.wasi_farm_refs.length) {
      throw new Error(`wasi_farm_refs index ${n} is out of bounds.`);
    }
    const ref = this.wasi_farm_refs[n];
    if (typeof ref.destroy_park === "function") {
      ref.destroy_park();
    }
  }
  destroy_park_all() {
    for (let i = 0; i < this.wasi_farm_refs.length; i++) {
      this.destroy_park(i);
    }
  }
  destroy_with_park() {
    this.destroy_park_all();
    this.destroy();
  }
  call_unknown_fn(idx, unknown) {
    if (idx < 0 || idx >= this.wasi_farm_refs.length) {
      throw new Error(`wasi_farm_refs index ${idx} is out of bounds.`);
    }
    return this.wasi_farm_refs[idx].call_unknown_fn(unknown);
  }
  kill_animal(id) {
    this.thread_spawner?.kill_animal(id);
  }
  constructor(wasi_farm_refs, args, env, options = {}, override_fd_maps, thread_spawner) {
    let wasi_farm_refs_tmp;
    if (Array.isArray(wasi_farm_refs)) {
      wasi_farm_refs_tmp = wasi_farm_refs;
    } else {
      wasi_farm_refs_tmp = [wasi_farm_refs];
    }
    try {
      new SharedArrayBuffer(4);
      this.can_array_buffer = true;
    } catch (_) {
      this.can_array_buffer = false;
    }
    this.id_in_wasi_farm_ref = [];
    this.wasi_farm_refs = [];
    for (let i = 0; i < wasi_farm_refs_tmp.length; i++) {
      if (this.can_array_buffer) {
        this.wasi_farm_refs.push(WASIFarmRefUseArrayBuffer.init_self(wasi_farm_refs_tmp[i]));
      } else {
        throw new Error("Non SharedArrayBuffer is not supported yet");
      }
      this.id_in_wasi_farm_ref.push(this.wasi_farm_refs[i].set_id());
    }
    if (options.can_thread_spawn) {
      this.can_thread_spawn = options.can_thread_spawn;
      if (thread_spawner) {
        if (!(thread_spawner instanceof ThreadSpawner)) {
          throw new Error("thread_spawner is not ThreadSpawner");
        }
        this.thread_spawner = thread_spawner;
      } else {
        if (options.thread_spawn_worker_url === void 0) {
          throw new Error("thread_spawn_worker_url is not defined");
        }
        if (options.thread_spawn_wasm === void 0) {
          throw new Error("thread_spawn_wasm is not defined");
        }
        this.thread_spawner = new ThreadSpawner(options.thread_spawn_worker_url, wasi_farm_refs_tmp, options.share_memory, void 0, void 0, options.thread_spawn_wasm, options.worker_background_worker_url);
      }
      this.animal_id = this.thread_spawner.generate_animal_id();
    }
    this.mapping_fds(this.wasi_farm_refs, override_fd_maps);
    if (options.hand_override_fd_map) {
      this.fd_map = options.hand_override_fd_map;
    }
    this.args = args;
    this.env = env;
    const self2 = this;
    this.wasiImport = { args_sizes_get(argc, argv_buf_size) {
      self2.check_fds();
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      buffer.setUint32(argc, self2.args.length, true);
      let buf_size = 0;
      for (const arg of self2.args) {
        buf_size += arg.length + 1;
      }
      buffer.setUint32(argv_buf_size, buf_size, true);
      return 0;
    }, args_get(argv, argv_buf) {
      self2.check_fds();
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      for (let i = 0; i < self2.args.length; i++) {
        buffer.setUint32(argv, argv_buf, true);
        argv += 4;
        const arg = new TextEncoder().encode(self2.args[i]);
        buffer8.set(arg, argv_buf);
        buffer.setUint8(argv_buf + arg.length, 0);
        argv_buf += arg.length + 1;
      }
      return 0;
    }, environ_sizes_get(environ_count, environ_size) {
      self2.check_fds();
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      buffer.setUint32(environ_count, self2.env.length, true);
      let buf_size = 0;
      for (const environ of self2.env) {
        buf_size += environ.length + 1;
      }
      buffer.setUint32(environ_size, buf_size, true);
      return 0;
    }, environ_get(environ, environ_buf) {
      self2.check_fds();
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      for (let i = 0; i < self2.env.length; i++) {
        buffer.setUint32(environ, environ_buf, true);
        environ += 4;
        const e = new TextEncoder().encode(self2.env[i]);
        buffer8.set(e, environ_buf);
        buffer.setUint8(environ_buf + e.length, 0);
        environ_buf += e.length + 1;
      }
      return 0;
    }, clock_res_get(id, res_ptr) {
      self2.check_fds();
      let resolutionValue;
      switch (id) {
        case CLOCKID_MONOTONIC: {
          resolutionValue = 5000n;
          break;
        }
        case CLOCKID_REALTIME: {
          resolutionValue = 1000000n;
          break;
        }
        default:
          return ERRNO_NOSYS;
      }
      const view = new DataView(self2.inst.exports.memory.buffer);
      view.setBigUint64(res_ptr, resolutionValue, true);
      return ERRNO_SUCCESS;
    }, clock_time_get(id, _precision, time) {
      self2.check_fds();
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      if (id === CLOCKID_REALTIME) {
        buffer.setBigUint64(time, BigInt(Date.now()) * 1000000n, true);
      } else if (id === CLOCKID_MONOTONIC) {
        let monotonic_time;
        try {
          monotonic_time = BigInt(Math.round(performance.now() * 1e6));
        } catch (_e) {
          monotonic_time = 0n;
        }
        buffer.setBigUint64(time, monotonic_time, true);
      } else {
        buffer.setBigUint64(time, 0n, true);
      }
      return 0;
    }, fd_advise(fd, _offset, _len, _advice) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      return wasi_farm_ref.fd_advise(mapped_fd);
    }, fd_allocate(fd, offset, len) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      return wasi_farm_ref.fd_allocate(mapped_fd, offset, len);
    }, fd_close(fd) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const ret = wasi_farm_ref.fd_close(mapped_fd);
      self2.check_fds();
      return ret;
    }, fd_datasync(fd) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      return wasi_farm_ref.fd_datasync(mapped_fd);
    }, fd_fdstat_get(fd, fdstat_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const [fdstat, ret] = wasi_farm_ref.fd_fdstat_get(mapped_fd);
      if (fdstat) {
        fdstat.write_bytes(new DataView(self2.inst.exports.memory.buffer), fdstat_ptr);
      }
      return ret;
    }, fd_fdstat_set_flags(fd, flags) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      return wasi_farm_ref.fd_fdstat_set_flags(mapped_fd, flags);
    }, fd_fdstat_set_rights(fd, fs_rights_base, fs_rights_inheriting) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      return wasi_farm_ref.fd_fdstat_set_rights(mapped_fd, fs_rights_base, fs_rights_inheriting);
    }, fd_filestat_get(fd, filestat_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const [filestat, ret] = wasi_farm_ref.fd_filestat_get(mapped_fd);
      if (filestat) {
        filestat.write_bytes(new DataView(self2.inst.exports.memory.buffer), filestat_ptr);
      }
      return ret;
    }, fd_filestat_set_size(fd, size) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      return wasi_farm_ref.fd_filestat_set_size(mapped_fd, size);
    }, fd_filestat_set_times(fd, atim, mtim, fst_flags) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      return wasi_farm_ref.fd_filestat_set_times(mapped_fd, atim, mtim, fst_flags);
    }, fd_pread(fd, iovs_ptr, iovs_len, offset, nread_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const iovs_view = new Uint32Array(buffer.buffer, iovs_ptr, iovs_len * 2);
      const [nerad_and_read_data, ret] = wasi_farm_ref.fd_pread(mapped_fd, iovs_view, offset);
      if (nerad_and_read_data) {
        const iovecs = Iovec.read_bytes_array(buffer, iovs_ptr, iovs_len);
        const [nread, read_data] = nerad_and_read_data;
        buffer.setUint32(nread_ptr, nread, true);
        let nreaded = 0;
        for (const iovec of iovecs) {
          if (nreaded + iovec.buf_len >= read_data.length) {
            buffer8.set(read_data, iovec.buf);
            break;
          }
          buffer8.set(read_data.slice(nreaded, nreaded + iovec.buf_len), iovec.buf);
          nreaded += iovec.buf_len;
        }
      }
      return ret;
    }, fd_prestat_get(fd, prestat_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const [prestat, ret] = wasi_farm_ref.fd_prestat_get(mapped_fd);
      if (prestat) {
        const [tag, name_len] = prestat;
        const buffer = new DataView(self2.inst.exports.memory.buffer);
        buffer.setUint32(prestat_ptr, tag, true);
        buffer.setUint32(prestat_ptr + 4, name_len, true);
      }
      return ret;
    }, fd_prestat_dir_name(fd, path_ptr, path_len) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return [void 0, ERRNO_BADF];
      }
      const [path3, ret] = wasi_farm_ref.fd_prestat_dir_name(mapped_fd, path_len);
      if (path3) {
        const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
        buffer8.set(path3, path_ptr);
      }
      return ret;
    }, fd_pwrite(fd, iovs_ptr, iovs_len, offset, nwritten_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const iovecs = Ciovec.read_bytes_array(buffer, iovs_ptr, iovs_len);
      const data = new Uint8Array(iovecs.reduce((acc, iovec) => acc + iovec.buf_len, 0));
      let nwritten = 0;
      for (const iovec of iovecs) {
        data.set(buffer8.slice(iovec.buf, iovec.buf + iovec.buf_len), nwritten);
        nwritten += iovec.buf_len;
      }
      const [written, ret] = wasi_farm_ref.fd_pwrite(mapped_fd, data, offset);
      if (written) {
        buffer.setUint32(nwritten_ptr, written, true);
      }
      return ret;
    }, fd_read(fd, iovs_ptr, iovs_len, nread_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const iovs_view = new Uint32Array(buffer.buffer, iovs_ptr, iovs_len * 2);
      const [nerad_and_read_data, ret] = wasi_farm_ref.fd_read(mapped_fd, iovs_view);
      if (nerad_and_read_data) {
        const iovecs = Iovec.read_bytes_array(buffer, iovs_ptr, iovs_len);
        const [nread, read_data] = nerad_and_read_data;
        buffer.setUint32(nread_ptr, nread, true);
        let nreaded = 0;
        for (const iovec of iovecs) {
          if (nreaded + iovec.buf_len >= read_data.length) {
            buffer8.set(read_data, iovec.buf);
            break;
          }
          buffer8.set(read_data.slice(nreaded, nreaded + iovec.buf_len), iovec.buf);
          nreaded += iovec.buf_len;
        }
      }
      return ret;
    }, fd_readdir(fd, buf_ptr, buf_len, cookie, buf_used_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return [void 0, ERRNO_BADF];
      }
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const [nerad_and_read_data, ret] = wasi_farm_ref.fd_readdir(mapped_fd, buf_len, cookie);
      if (nerad_and_read_data) {
        const [read_data, buf_used] = nerad_and_read_data;
        buffer.setUint32(buf_used_ptr, buf_used, true);
        buffer8.set(read_data, buf_ptr);
      }
      return ret;
    }, fd_renumber(fd, to) {
      self2.check_fds();
      const [mapped_to, wasi_farm_ref_to] = self2.get_fd_and_wasi_ref(to);
      if (mapped_to !== void 0 && wasi_farm_ref_to !== void 0) {
        const ret = wasi_farm_ref_to.fd_close(mapped_to);
        self2.check_fds();
        if (ret !== ERRNO_SUCCESS) {
          return ret;
        }
      }
      if (self2.fd_map[to]) {
        throw new Error("fd is already mapped");
      }
      self2.fd_map[to] = self2.fd_map[fd];
      self2.fd_map[fd] = void 0;
      return ERRNO_SUCCESS;
    }, fd_seek(fd, offset, whence, newoffset_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return [void 0, ERRNO_BADF];
      }
      const [newoffset, ret] = wasi_farm_ref.fd_seek(mapped_fd, offset, whence);
      if (newoffset) {
        const buffer = new DataView(self2.inst.exports.memory.buffer);
        buffer.setBigUint64(newoffset_ptr, newoffset, true);
      }
      return ret;
    }, fd_sync(fd) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      return wasi_farm_ref.fd_sync(mapped_fd);
    }, fd_tell(fd, newoffset_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return [void 0, ERRNO_BADF];
      }
      const [newoffset, ret] = wasi_farm_ref.fd_tell(mapped_fd);
      if (newoffset) {
        const buffer = new DataView(self2.inst.exports.memory.buffer);
        buffer.setBigUint64(newoffset_ptr, newoffset, true);
      }
      return ret;
    }, fd_write(fd, iovs_ptr, iovs_len, nwritten_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const iovecs = Ciovec.read_bytes_array(buffer, iovs_ptr, iovs_len);
      const data = new Uint8Array(iovecs.reduce((acc, iovec) => acc + iovec.buf_len, 0));
      let nwritten = 0;
      for (const iovec of iovecs) {
        data.set(buffer8.slice(iovec.buf, iovec.buf + iovec.buf_len), nwritten);
        nwritten += iovec.buf_len;
      }
      const [written, ret] = wasi_farm_ref.fd_write(mapped_fd, data);
      if (written) {
        buffer.setUint32(nwritten_ptr, written, true);
      }
      return ret;
    }, path_create_directory(fd, path_ptr, path_len) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const path3 = buffer8.slice(path_ptr, path_ptr + path_len);
      return wasi_farm_ref.path_create_directory(mapped_fd, path3);
    }, path_filestat_get(fd, flags, path_ptr, path_len, filestat_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return [void 0, ERRNO_BADF];
      }
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const path3 = buffer8.slice(path_ptr, path_ptr + path_len);
      const [filestat, ret] = wasi_farm_ref.path_filestat_get(mapped_fd, flags, path3);
      if (filestat) {
        filestat.write_bytes(buffer, filestat_ptr);
      }
      return ret;
    }, path_filestat_set_times(fd, flags, path_ptr, path_len, atim, mtim, fst_flags) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return [void 0, ERRNO_BADF];
      }
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const path3 = buffer8.slice(path_ptr, path_ptr + path_len);
      return wasi_farm_ref.path_filestat_set_times(mapped_fd, flags, path3, atim, mtim, fst_flags);
    }, path_link(old_fd, old_flags, old_path_ptr, old_path_len, new_fd, new_path_ptr, new_path_len) {
      self2.check_fds();
      const [mapped_old_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(old_fd);
      const [mapped_new_fd, wasi_farm_ref_new] = self2.get_fd_and_wasi_ref(new_fd);
      if (mapped_old_fd === void 0 || wasi_farm_ref === void 0 || mapped_new_fd === void 0 || wasi_farm_ref_new === void 0) {
        return ERRNO_BADF;
      }
      if (wasi_farm_ref !== wasi_farm_ref_new) {
        return ERRNO_BADF;
      }
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const old_path = buffer8.slice(old_path_ptr, old_path_ptr + old_path_len);
      const new_path = buffer8.slice(new_path_ptr, new_path_ptr + new_path_len);
      return wasi_farm_ref.path_link(mapped_old_fd, old_flags, old_path, mapped_new_fd, new_path);
    }, path_open(fd, dirflags, path_ptr, path_len, oflags, fs_rights_base, fs_rights_inheriting, fs_flags, opened_fd_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref_n] = self2.get_fd_and_wasi_ref_n(fd);
      if (mapped_fd === void 0 || wasi_farm_ref_n === void 0) {
        return ERRNO_BADF;
      }
      const wasi_farm_ref = self2.wasi_farm_refs[wasi_farm_ref_n];
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const path3 = buffer8.slice(path_ptr, path_ptr + path_len);
      const [opened_fd, ret] = wasi_farm_ref.path_open(mapped_fd, dirflags, path3, oflags, fs_rights_base, fs_rights_inheriting, fs_flags);
      if (opened_fd) {
        if (self2.fd_map.includes([opened_fd, wasi_farm_ref_n])) {
          throw new Error("opened_fd already exists");
        }
        const mapped_opened_fd = self2.map_new_fd_and_notify(opened_fd, wasi_farm_ref_n);
        const buffer = new DataView(self2.inst.exports.memory.buffer);
        buffer.setUint32(opened_fd_ptr, mapped_opened_fd, true);
      }
      return ret;
    }, path_readlink(fd, path_ptr, path_len, buf_ptr, buf_len, buf_used_ptr) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return [void 0, ERRNO_BADF];
      }
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const path3 = buffer8.slice(path_ptr, path_ptr + path_len);
      const [buf, ret] = wasi_farm_ref.path_readlink(mapped_fd, path3, buf_len);
      if (buf) {
        const buffer = new DataView(self2.inst.exports.memory.buffer);
        buffer.setUint32(buf_used_ptr, buf.length, true);
        buffer8.set(buf, buf_ptr);
      }
      return ret;
    }, path_remove_directory(fd, path_ptr, path_len) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const path3 = buffer8.slice(path_ptr, path_ptr + path_len);
      return wasi_farm_ref.path_remove_directory(mapped_fd, path3);
    }, path_rename(old_fd, old_path_ptr, old_path_len, new_fd, new_path_ptr, new_path_len) {
      if (old_fd === new_fd) {
        return ERRNO_SUCCESS;
      }
      self2.check_fds();
      const [mapped_old_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(old_fd);
      const [mapped_new_fd, wasi_farm_ref_new] = self2.get_fd_and_wasi_ref(new_fd);
      if (mapped_old_fd === void 0 || wasi_farm_ref === void 0 || mapped_new_fd === void 0 || wasi_farm_ref_new === void 0) {
        return ERRNO_BADF;
      }
      if (wasi_farm_ref !== wasi_farm_ref_new) {
        return ERRNO_BADF;
      }
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const old_path = buffer8.slice(old_path_ptr, old_path_ptr + old_path_len);
      const new_path = buffer8.slice(new_path_ptr, new_path_ptr + new_path_len);
      return wasi_farm_ref.path_rename(mapped_old_fd, old_path, mapped_new_fd, new_path);
    }, path_symlink(old_path_ptr, old_path_len, fd, new_path_ptr, new_path_len) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const old_path = buffer8.slice(old_path_ptr, old_path_ptr + old_path_len);
      const new_path = buffer8.slice(new_path_ptr, new_path_ptr + new_path_len);
      return wasi_farm_ref.path_symlink(old_path, mapped_fd, new_path);
    }, path_unlink_file(fd, path_ptr, path_len) {
      self2.check_fds();
      const [mapped_fd, wasi_farm_ref] = self2.get_fd_and_wasi_ref(fd);
      if (mapped_fd === void 0 || wasi_farm_ref === void 0) {
        return ERRNO_BADF;
      }
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer);
      const path3 = buffer8.slice(path_ptr, path_ptr + path_len);
      return wasi_farm_ref.path_unlink_file(mapped_fd, path3);
    }, poll_oneoff(in_ptr, out_ptr, nsubscriptions, stored_events_count_ptr) {
      if (nsubscriptions === 0) {
        return ERRNO_INVAL;
      }
      if (nsubscriptions > 1) {
        console.error("poll_oneoff: only a single subscription is supported");
        return ERRNO_NOTSUP;
      }
      const buffer = new DataView(self2.inst.exports.memory.buffer);
      const s = Subscription.read_bytes(buffer, in_ptr);
      const eventtype = s.eventtype;
      const clockid = s.clockid;
      const timeout = s.timeout;
      if (eventtype !== EVENTTYPE_CLOCK) {
        console.error("poll_oneoff: only clock subscriptions are supported");
        return ERRNO_NOTSUP;
      }
      let getNow;
      if (clockid === CLOCKID_MONOTONIC) {
        getNow = () => BigInt(Math.round(performance.now() * 1e6));
      } else if (clockid === CLOCKID_REALTIME) {
        getNow = () => BigInt(Date.now()) * 1000000n;
      } else {
        return ERRNO_INVAL;
      }
      const endTime = ((s.flags & SUBCLOCKFLAGS_SUBSCRIPTION_CLOCK_ABSTIME) !== 0 ? timeout : getNow() + timeout) - s.precision;
      const remainingNs = endTime - getNow();
      if (remainingNs > 0n) {
        const remainingMs = Number(remainingNs / 1000000n);
        if (remainingMs > 0) {
          Atomics.wait(self2.sleepBuffer, 0, 0, remainingMs);
        }
      }
      const event = new Event(s.userdata, ERRNO_SUCCESS, eventtype);
      event.write_bytes(buffer, out_ptr);
      buffer.setUint32(stored_events_count_ptr, 1, true);
      return ERRNO_SUCCESS;
    }, proc_exit(exit_code) {
      self2.check_fds();
      throw new WASIProcExit(exit_code);
    }, proc_raise(sig) {
      self2.check_fds();
      throw `raised signal ${sig}`;
    }, sched_yield() {
      self2.check_fds();
    }, random_get(buf, buf_len) {
      self2.check_fds();
      const buffer8 = new Uint8Array(self2.inst.exports.memory.buffer).subarray(buf, buf + buf_len);
      if ("crypto" in globalThis && !(self2.inst.exports.memory.buffer instanceof SharedArrayBuffer)) {
        for (let i = 0; i < buf_len; i += 65536) {
          crypto.getRandomValues(buffer8.subarray(i, i + 65536));
        }
      } else {
        for (let i = 0; i < buf_len; i++) {
          buffer8[i] = Math.random() * 256 | 0;
        }
      }
    }, sock_recv(_fd, _ri_data, _ri_flags) {
      self2.check_fds();
      throw "sockets not supported";
    }, sock_send(_fd, _si_data, _si_flags) {
      self2.check_fds();
      throw "sockets not supported";
    }, sock_shutdown(_fd, _how) {
      self2.check_fds();
      throw "sockets not supported";
    }, sock_accept(_fd, _flags) {
      self2.check_fds();
      throw "sockets not supported";
    } };
    this.wasiThreadImport = { "thread-spawn": (start_arg) => {
      self2.check_fds();
      if (!self2.can_thread_spawn || !self2.thread_spawner) {
        throw new Error("thread_spawn is not allowed");
      }
      const thread_id = self2.thread_spawner.thread_spawn(start_arg, self2.args, self2.env, self2.fd_map);
      return thread_id;
    } };
  }
};
var WASIFarm = class {
  fds;
  park;
  can_array_buffer;
  constructor(stdin, stdout, stderr, fds = [], options = {}) {
    const new_fds = [];
    let stdin_;
    let stdout_;
    let stderr_;
    if (stdin) {
      new_fds.push(stdin);
      stdin_ = new_fds.length - 1;
    }
    if (stdout) {
      new_fds.push(stdout);
      stdout_ = new_fds.length - 1;
    }
    if (stderr) {
      new_fds.push(stderr);
      stderr_ = new_fds.length - 1;
    }
    new_fds.push(...fds);
    const default_allow_fds = [];
    for (let i = 0; i < new_fds.length; i++) {
      default_allow_fds.push(i);
    }
    this.fds = new_fds;
    try {
      new SharedArrayBuffer(4);
      this.can_array_buffer = true;
    } catch (e) {
      this.can_array_buffer = false;
      console.warn("SharedArrayBuffer is not supported:", e);
      if (!globalThis.crossOriginIsolated) {
        console.warn("SharedArrayBuffer is not supported because crossOriginIsolated is not enabled.");
      }
    }
    if (this.can_array_buffer) {
      this.park = new WASIFarmParkUseArrayBuffer(this.fds_ref(), stdin_, stdout_, stderr_, default_allow_fds, options?.allocator_size, options?.max_fds_limit, options?.unknown_fn);
    } else {
      throw new Error("Non SharedArrayBuffer is not supported yet");
    }
    this.park.listen();
  }
  fds_ref() {
    const fds = new Proxy([], { get: (_, prop) => {
      if (prop === "push") {
        return (fd) => {
          const len = this.fds.push(fd);
          return len;
        };
      }
      return this.fds[prop];
    }, set: (_, prop, value) => {
      this.fds[prop] = value;
      return true;
    } });
    return fds;
  }
  get_ref() {
    if (this.park === null) {
      throw new Error("WASIFarm is already destroyed");
    }
    return this.park.get_ref();
  }
};
var DestroyerHandle = class _DestroyerHandle {
  sender;
  destroy_status;
  listen_holder;
  constructor(sender, destroy_status) {
    this.sender = sender;
    this.destroy_status = destroy_status;
    this.listen_holder = this.listen();
  }
  static init_self(obj) {
    return new _DestroyerHandle(obj.sender, obj.destroy_status);
  }
  get_object() {
    return { destroy_status: this.destroy_status, sender: this.sender };
  }
  async listen() {
    const view = new Int32Array(this.destroy_status);
    const { value } = Atomics.waitAsync(view, 0, 1);
    if (await value === "timed-out") {
      throw new Error("destroy listen timed out");
    }
    this.cleanup();
  }
  cleanup() {
    this.destroy_status = null;
    this.sender = null;
  }
  destroy() {
    const view = new Int32Array(this.destroy_status);
    Atomics.store(view, 0, 1);
    Atomics.store(view, 1, 1);
    this.sender.destroy();
    Atomics.store(view, 0, 0);
    Atomics.notify(view, 0);
  }
};
var worker_background_worker_url = new URL("./worker_background_worker.min.js", import.meta.url).href;

// node_modules/@bjorn3/browser_wasi_shim/dist/wasi_defs.js
var ERRNO_SUCCESS2 = 0;
var ERRNO_BADF2 = 8;
var ERRNO_EXIST = 20;
var ERRNO_INVAL2 = 28;
var ERRNO_ISDIR = 31;
var ERRNO_NOENT = 44;
var ERRNO_NOTDIR = 54;
var ERRNO_NOTEMPTY = 55;
var ERRNO_NOTSUP2 = 58;
var ERRNO_PERM = 63;
var ERRNO_NOTCAPABLE = 76;
var RIGHTS_FD_DATASYNC = 1 << 0;
var RIGHTS_FD_READ = 1 << 1;
var RIGHTS_FD_SEEK = 1 << 2;
var RIGHTS_FD_FDSTAT_SET_FLAGS = 1 << 3;
var RIGHTS_FD_SYNC = 1 << 4;
var RIGHTS_FD_TELL = 1 << 5;
var RIGHTS_FD_WRITE = 1 << 6;
var RIGHTS_FD_ADVISE = 1 << 7;
var RIGHTS_FD_ALLOCATE = 1 << 8;
var RIGHTS_PATH_CREATE_DIRECTORY = 1 << 9;
var RIGHTS_PATH_CREATE_FILE = 1 << 10;
var RIGHTS_PATH_LINK_SOURCE = 1 << 11;
var RIGHTS_PATH_LINK_TARGET = 1 << 12;
var RIGHTS_PATH_OPEN = 1 << 13;
var RIGHTS_FD_READDIR = 1 << 14;
var RIGHTS_PATH_READLINK = 1 << 15;
var RIGHTS_PATH_RENAME_SOURCE = 1 << 16;
var RIGHTS_PATH_RENAME_TARGET = 1 << 17;
var RIGHTS_PATH_FILESTAT_GET = 1 << 18;
var RIGHTS_PATH_FILESTAT_SET_SIZE = 1 << 19;
var RIGHTS_PATH_FILESTAT_SET_TIMES = 1 << 20;
var RIGHTS_FD_FILESTAT_GET = 1 << 21;
var RIGHTS_FD_FILESTAT_SET_SIZE = 1 << 22;
var RIGHTS_FD_FILESTAT_SET_TIMES = 1 << 23;
var RIGHTS_PATH_SYMLINK = 1 << 24;
var RIGHTS_PATH_REMOVE_DIRECTORY = 1 << 25;
var RIGHTS_PATH_UNLINK_FILE = 1 << 26;
var RIGHTS_POLL_FD_READWRITE = 1 << 27;
var RIGHTS_SOCK_SHUTDOWN = 1 << 28;
var WHENCE_SET = 0;
var WHENCE_CUR = 1;
var WHENCE_END = 2;
var FILETYPE_DIRECTORY = 3;
var FILETYPE_REGULAR_FILE = 4;
var Dirent = class {
  head_length() {
    return 24;
  }
  name_length() {
    return this.dir_name.byteLength;
  }
  write_head_bytes(view, ptr) {
    view.setBigUint64(ptr, this.d_next, true);
    view.setBigUint64(ptr + 8, this.d_ino, true);
    view.setUint32(ptr + 16, this.dir_name.length, true);
    view.setUint8(ptr + 20, this.d_type);
  }
  write_name_bytes(view8, ptr, buf_len) {
    view8.set(this.dir_name.slice(0, Math.min(this.dir_name.byteLength, buf_len)), ptr);
  }
  constructor(next_cookie, d_ino, name, type) {
    const encoded_name = new TextEncoder().encode(name);
    this.d_next = next_cookie;
    this.d_ino = d_ino;
    this.d_namlen = encoded_name.byteLength;
    this.d_type = type;
    this.dir_name = encoded_name;
  }
};
var FDFLAGS_APPEND = 1 << 0;
var FDFLAGS_DSYNC = 1 << 1;
var FDFLAGS_NONBLOCK = 1 << 2;
var FDFLAGS_RSYNC = 1 << 3;
var FDFLAGS_SYNC = 1 << 4;
var Fdstat2 = class {
  write_bytes(view, ptr) {
    view.setUint8(ptr, this.fs_filetype);
    view.setUint16(ptr + 2, this.fs_flags, true);
    view.setBigUint64(ptr + 8, this.fs_rights_base, true);
    view.setBigUint64(ptr + 16, this.fs_rights_inherited, true);
  }
  constructor(filetype, flags) {
    this.fs_rights_base = 0n;
    this.fs_rights_inherited = 0n;
    this.fs_filetype = filetype;
    this.fs_flags = flags;
  }
};
var FSTFLAGS_ATIM = 1 << 0;
var FSTFLAGS_ATIM_NOW = 1 << 1;
var FSTFLAGS_MTIM = 1 << 2;
var FSTFLAGS_MTIM_NOW = 1 << 3;
var OFLAGS_CREAT = 1 << 0;
var OFLAGS_DIRECTORY = 1 << 1;
var OFLAGS_EXCL = 1 << 2;
var OFLAGS_TRUNC = 1 << 3;
var Filestat2 = class {
  write_bytes(view, ptr) {
    view.setBigUint64(ptr, this.dev, true);
    view.setBigUint64(ptr + 8, this.ino, true);
    view.setUint8(ptr + 16, this.filetype);
    view.setBigUint64(ptr + 24, this.nlink, true);
    view.setBigUint64(ptr + 32, this.size, true);
    view.setBigUint64(ptr + 38, this.atim, true);
    view.setBigUint64(ptr + 46, this.mtim, true);
    view.setBigUint64(ptr + 52, this.ctim, true);
  }
  constructor(ino, filetype, size) {
    this.dev = 0n;
    this.nlink = 0n;
    this.atim = 0n;
    this.mtim = 0n;
    this.ctim = 0n;
    this.ino = ino;
    this.filetype = filetype;
    this.size = size;
  }
};
var EVENTRWFLAGS_FD_READWRITE_HANGUP = 1 << 0;
var SUBCLOCKFLAGS_SUBSCRIPTION_CLOCK_ABSTIME2 = 1 << 0;
var RIFLAGS_RECV_PEEK = 1 << 0;
var RIFLAGS_RECV_WAITALL = 1 << 1;
var ROFLAGS_RECV_DATA_TRUNCATED = 1 << 0;
var SDFLAGS_RD = 1 << 0;
var SDFLAGS_WR = 1 << 1;
var PREOPENTYPE_DIR = 0;
var PrestatDir = class {
  write_bytes(view, ptr) {
    view.setUint32(ptr, this.pr_name.byteLength, true);
  }
  constructor(name) {
    this.pr_name = new TextEncoder().encode(name);
  }
};
var Prestat = class _Prestat {
  static dir(name) {
    const prestat = new _Prestat();
    prestat.tag = PREOPENTYPE_DIR;
    prestat.inner = new PrestatDir(name);
    return prestat;
  }
  write_bytes(view, ptr) {
    view.setUint32(ptr, this.tag, true);
    this.inner.write_bytes(view, ptr + 4);
  }
};

// node_modules/@bjorn3/browser_wasi_shim/dist/debug.js
var Debug3 = class Debug4 {
  enable(enabled) {
    this.log = createLogger2(enabled === void 0 ? true : enabled, this.prefix);
  }
  get enabled() {
    return this.isEnabled;
  }
  constructor(isEnabled) {
    this.isEnabled = isEnabled;
    this.prefix = "wasi:";
    this.enable(isEnabled);
  }
};
function createLogger2(enabled, prefix) {
  if (enabled) {
    const a = console.log.bind(console, "%c%s", "color: #265BA0", prefix);
    return a;
  } else {
    return () => {
    };
  }
}
var debug = new Debug3(false);

// node_modules/@bjorn3/browser_wasi_shim/dist/fd.js
var Fd = class {
  fd_allocate(offset, len) {
    return ERRNO_NOTSUP2;
  }
  fd_close() {
    return 0;
  }
  fd_fdstat_get() {
    return { ret: ERRNO_NOTSUP2, fdstat: null };
  }
  fd_fdstat_set_flags(flags) {
    return ERRNO_NOTSUP2;
  }
  fd_fdstat_set_rights(fs_rights_base, fs_rights_inheriting) {
    return ERRNO_NOTSUP2;
  }
  fd_filestat_get() {
    return { ret: ERRNO_NOTSUP2, filestat: null };
  }
  fd_filestat_set_size(size) {
    return ERRNO_NOTSUP2;
  }
  fd_filestat_set_times(atim, mtim, fst_flags) {
    return ERRNO_NOTSUP2;
  }
  fd_pread(size, offset) {
    return { ret: ERRNO_NOTSUP2, data: new Uint8Array() };
  }
  fd_prestat_get() {
    return { ret: ERRNO_NOTSUP2, prestat: null };
  }
  fd_pwrite(data, offset) {
    return { ret: ERRNO_NOTSUP2, nwritten: 0 };
  }
  fd_read(size) {
    return { ret: ERRNO_NOTSUP2, data: new Uint8Array() };
  }
  fd_readdir_single(cookie) {
    return { ret: ERRNO_NOTSUP2, dirent: null };
  }
  fd_seek(offset, whence) {
    return { ret: ERRNO_NOTSUP2, offset: 0n };
  }
  fd_sync() {
    return 0;
  }
  fd_tell() {
    return { ret: ERRNO_NOTSUP2, offset: 0n };
  }
  fd_write(data) {
    return { ret: ERRNO_NOTSUP2, nwritten: 0 };
  }
  path_create_directory(path3) {
    return ERRNO_NOTSUP2;
  }
  path_filestat_get(flags, path3) {
    return { ret: ERRNO_NOTSUP2, filestat: null };
  }
  path_filestat_set_times(flags, path3, atim, mtim, fst_flags) {
    return ERRNO_NOTSUP2;
  }
  path_link(path3, inode, allow_dir) {
    return ERRNO_NOTSUP2;
  }
  path_unlink(path3) {
    return { ret: ERRNO_NOTSUP2, inode_obj: null };
  }
  path_lookup(path3, dirflags) {
    return { ret: ERRNO_NOTSUP2, inode_obj: null };
  }
  path_open(dirflags, path3, oflags, fs_rights_base, fs_rights_inheriting, fd_flags) {
    return { ret: ERRNO_NOTDIR, fd_obj: null };
  }
  path_readlink(path3) {
    return { ret: ERRNO_NOTSUP2, data: null };
  }
  path_remove_directory(path3) {
    return ERRNO_NOTSUP2;
  }
  path_rename(old_path, new_fd, new_path) {
    return ERRNO_NOTSUP2;
  }
  path_unlink_file(path3) {
    return ERRNO_NOTSUP2;
  }
};
var Inode = class _Inode {
  static issue_ino() {
    return _Inode.next_ino++;
  }
  static root_ino() {
    return 0n;
  }
  constructor() {
    this.ino = _Inode.issue_ino();
  }
};
Inode.next_ino = 1n;

// node_modules/@bjorn3/browser_wasi_shim/dist/fs_mem.js
var OpenFile = class extends Fd {
  fd_allocate(offset, len) {
    if (this.file.size > offset + len) {
    } else {
      const new_data = new Uint8Array(Number(offset + len));
      new_data.set(this.file.data, 0);
      this.file.data = new_data;
    }
    return ERRNO_SUCCESS2;
  }
  fd_fdstat_get() {
    return { ret: 0, fdstat: new Fdstat2(FILETYPE_REGULAR_FILE, 0) };
  }
  fd_filestat_set_size(size) {
    if (this.file.size > size) {
      this.file.data = new Uint8Array(this.file.data.buffer.slice(0, Number(size)));
    } else {
      const new_data = new Uint8Array(Number(size));
      new_data.set(this.file.data, 0);
      this.file.data = new_data;
    }
    return ERRNO_SUCCESS2;
  }
  fd_read(size) {
    const slice = this.file.data.slice(Number(this.file_pos), Number(this.file_pos + BigInt(size)));
    this.file_pos += BigInt(slice.length);
    return { ret: 0, data: slice };
  }
  fd_pread(size, offset) {
    const slice = this.file.data.slice(Number(offset), Number(offset + BigInt(size)));
    return { ret: 0, data: slice };
  }
  fd_seek(offset, whence) {
    let calculated_offset;
    switch (whence) {
      case WHENCE_SET:
        calculated_offset = offset;
        break;
      case WHENCE_CUR:
        calculated_offset = this.file_pos + offset;
        break;
      case WHENCE_END:
        calculated_offset = BigInt(this.file.data.byteLength) + offset;
        break;
      default:
        return { ret: ERRNO_INVAL2, offset: 0n };
    }
    if (calculated_offset < 0) {
      return { ret: ERRNO_INVAL2, offset: 0n };
    }
    this.file_pos = calculated_offset;
    return { ret: 0, offset: this.file_pos };
  }
  fd_tell() {
    return { ret: 0, offset: this.file_pos };
  }
  fd_write(data) {
    if (this.file.readonly) return { ret: ERRNO_BADF2, nwritten: 0 };
    if (this.file_pos + BigInt(data.byteLength) > this.file.size) {
      const old = this.file.data;
      this.file.data = new Uint8Array(Number(this.file_pos + BigInt(data.byteLength)));
      this.file.data.set(old);
    }
    this.file.data.set(data, Number(this.file_pos));
    this.file_pos += BigInt(data.byteLength);
    return { ret: 0, nwritten: data.byteLength };
  }
  fd_pwrite(data, offset) {
    if (this.file.readonly) return { ret: ERRNO_BADF2, nwritten: 0 };
    if (offset + BigInt(data.byteLength) > this.file.size) {
      const old = this.file.data;
      this.file.data = new Uint8Array(Number(offset + BigInt(data.byteLength)));
      this.file.data.set(old);
    }
    this.file.data.set(data, Number(offset));
    return { ret: 0, nwritten: data.byteLength };
  }
  fd_filestat_get() {
    return { ret: 0, filestat: this.file.stat() };
  }
  constructor(file) {
    super();
    this.file_pos = 0n;
    this.file = file;
  }
};
var OpenDirectory = class extends Fd {
  fd_seek(offset, whence) {
    return { ret: ERRNO_BADF2, offset: 0n };
  }
  fd_tell() {
    return { ret: ERRNO_BADF2, offset: 0n };
  }
  fd_allocate(offset, len) {
    return ERRNO_BADF2;
  }
  fd_fdstat_get() {
    return { ret: 0, fdstat: new Fdstat2(FILETYPE_DIRECTORY, 0) };
  }
  fd_readdir_single(cookie) {
    if (debug.enabled) {
      debug.log("readdir_single", cookie);
      debug.log(cookie, this.dir.contents.keys());
    }
    if (cookie == 0n) {
      return { ret: ERRNO_SUCCESS2, dirent: new Dirent(1n, this.dir.ino, ".", FILETYPE_DIRECTORY) };
    } else if (cookie == 1n) {
      return { ret: ERRNO_SUCCESS2, dirent: new Dirent(2n, this.dir.parent_ino(), "..", FILETYPE_DIRECTORY) };
    }
    if (cookie >= BigInt(this.dir.contents.size) + 2n) {
      return { ret: 0, dirent: null };
    }
    const [name, entry] = Array.from(this.dir.contents.entries())[Number(cookie - 2n)];
    return { ret: 0, dirent: new Dirent(cookie + 1n, entry.ino, name, entry.stat().filetype) };
  }
  path_filestat_get(flags, path_str) {
    const { ret: path_err, path: path3 } = Path.from(path_str);
    if (path3 == null) {
      return { ret: path_err, filestat: null };
    }
    const { ret, entry } = this.dir.get_entry_for_path(path3);
    if (entry == null) {
      return { ret, filestat: null };
    }
    return { ret: 0, filestat: entry.stat() };
  }
  path_lookup(path_str, dirflags) {
    const { ret: path_ret, path: path3 } = Path.from(path_str);
    if (path3 == null) {
      return { ret: path_ret, inode_obj: null };
    }
    const { ret, entry } = this.dir.get_entry_for_path(path3);
    if (entry == null) {
      return { ret, inode_obj: null };
    }
    return { ret: ERRNO_SUCCESS2, inode_obj: entry };
  }
  path_open(dirflags, path_str, oflags, fs_rights_base, fs_rights_inheriting, fd_flags) {
    const { ret: path_ret, path: path3 } = Path.from(path_str);
    if (path3 == null) {
      return { ret: path_ret, fd_obj: null };
    }
    let { ret, entry } = this.dir.get_entry_for_path(path3);
    if (entry == null) {
      if (ret != ERRNO_NOENT) {
        return { ret, fd_obj: null };
      }
      if ((oflags & OFLAGS_CREAT) == OFLAGS_CREAT) {
        const { ret: ret2, entry: new_entry } = this.dir.create_entry_for_path(path_str, (oflags & OFLAGS_DIRECTORY) == OFLAGS_DIRECTORY);
        if (new_entry == null) {
          return { ret: ret2, fd_obj: null };
        }
        entry = new_entry;
      } else {
        return { ret: ERRNO_NOENT, fd_obj: null };
      }
    } else if ((oflags & OFLAGS_EXCL) == OFLAGS_EXCL) {
      return { ret: ERRNO_EXIST, fd_obj: null };
    }
    if ((oflags & OFLAGS_DIRECTORY) == OFLAGS_DIRECTORY && entry.stat().filetype !== FILETYPE_DIRECTORY) {
      return { ret: ERRNO_NOTDIR, fd_obj: null };
    }
    return entry.path_open(oflags, fs_rights_base, fd_flags);
  }
  path_create_directory(path3) {
    return this.path_open(0, path3, OFLAGS_CREAT | OFLAGS_DIRECTORY, 0n, 0n, 0).ret;
  }
  path_link(path_str, inode, allow_dir) {
    const { ret: path_ret, path: path3 } = Path.from(path_str);
    if (path3 == null) {
      return path_ret;
    }
    if (path3.is_dir) {
      return ERRNO_NOENT;
    }
    const { ret: parent_ret, parent_entry, filename, entry } = this.dir.get_parent_dir_and_entry_for_path(path3, true);
    if (parent_entry == null || filename == null) {
      return parent_ret;
    }
    if (entry != null) {
      const source_is_dir = inode.stat().filetype == FILETYPE_DIRECTORY;
      const target_is_dir = entry.stat().filetype == FILETYPE_DIRECTORY;
      if (source_is_dir && target_is_dir) {
        if (allow_dir && entry instanceof Directory) {
          if (entry.contents.size == 0) {
          } else {
            return ERRNO_NOTEMPTY;
          }
        } else {
          return ERRNO_EXIST;
        }
      } else if (source_is_dir && !target_is_dir) {
        return ERRNO_NOTDIR;
      } else if (!source_is_dir && target_is_dir) {
        return ERRNO_ISDIR;
      } else if (inode.stat().filetype == FILETYPE_REGULAR_FILE && entry.stat().filetype == FILETYPE_REGULAR_FILE) {
      } else {
        return ERRNO_EXIST;
      }
    }
    if (!allow_dir && inode.stat().filetype == FILETYPE_DIRECTORY) {
      return ERRNO_PERM;
    }
    parent_entry.contents.set(filename, inode);
    return ERRNO_SUCCESS2;
  }
  path_unlink(path_str) {
    const { ret: path_ret, path: path3 } = Path.from(path_str);
    if (path3 == null) {
      return { ret: path_ret, inode_obj: null };
    }
    const { ret: parent_ret, parent_entry, filename, entry } = this.dir.get_parent_dir_and_entry_for_path(path3, true);
    if (parent_entry == null || filename == null) {
      return { ret: parent_ret, inode_obj: null };
    }
    if (entry == null) {
      return { ret: ERRNO_NOENT, inode_obj: null };
    }
    parent_entry.contents.delete(filename);
    return { ret: ERRNO_SUCCESS2, inode_obj: entry };
  }
  path_unlink_file(path_str) {
    const { ret: path_ret, path: path3 } = Path.from(path_str);
    if (path3 == null) {
      return path_ret;
    }
    const { ret: parent_ret, parent_entry, filename, entry } = this.dir.get_parent_dir_and_entry_for_path(path3, false);
    if (parent_entry == null || filename == null || entry == null) {
      return parent_ret;
    }
    if (entry.stat().filetype === FILETYPE_DIRECTORY) {
      return ERRNO_ISDIR;
    }
    parent_entry.contents.delete(filename);
    return ERRNO_SUCCESS2;
  }
  path_remove_directory(path_str) {
    const { ret: path_ret, path: path3 } = Path.from(path_str);
    if (path3 == null) {
      return path_ret;
    }
    const { ret: parent_ret, parent_entry, filename, entry } = this.dir.get_parent_dir_and_entry_for_path(path3, false);
    if (parent_entry == null || filename == null || entry == null) {
      return parent_ret;
    }
    if (!(entry instanceof Directory) || entry.stat().filetype !== FILETYPE_DIRECTORY) {
      return ERRNO_NOTDIR;
    }
    if (entry.contents.size !== 0) {
      return ERRNO_NOTEMPTY;
    }
    if (!parent_entry.contents.delete(filename)) {
      return ERRNO_NOENT;
    }
    return ERRNO_SUCCESS2;
  }
  fd_filestat_get() {
    return { ret: 0, filestat: this.dir.stat() };
  }
  fd_filestat_set_size(size) {
    return ERRNO_BADF2;
  }
  fd_read(size) {
    return { ret: ERRNO_BADF2, data: new Uint8Array() };
  }
  fd_pread(size, offset) {
    return { ret: ERRNO_BADF2, data: new Uint8Array() };
  }
  fd_write(data) {
    return { ret: ERRNO_BADF2, nwritten: 0 };
  }
  fd_pwrite(data, offset) {
    return { ret: ERRNO_BADF2, nwritten: 0 };
  }
  constructor(dir) {
    super();
    this.dir = dir;
  }
};
var PreopenDirectory = class extends OpenDirectory {
  fd_prestat_get() {
    return { ret: 0, prestat: Prestat.dir(this.prestat_name) };
  }
  constructor(name, contents) {
    super(new Directory(contents));
    this.prestat_name = name;
  }
};
var File = class extends Inode {
  path_open(oflags, fs_rights_base, fd_flags) {
    if (this.readonly && (fs_rights_base & BigInt(RIGHTS_FD_WRITE)) == BigInt(RIGHTS_FD_WRITE)) {
      return { ret: ERRNO_PERM, fd_obj: null };
    }
    if ((oflags & OFLAGS_TRUNC) == OFLAGS_TRUNC) {
      if (this.readonly) return { ret: ERRNO_PERM, fd_obj: null };
      this.data = new Uint8Array([]);
    }
    const file = new OpenFile(this);
    if (fd_flags & FDFLAGS_APPEND) file.fd_seek(0n, WHENCE_END);
    return { ret: ERRNO_SUCCESS2, fd_obj: file };
  }
  get size() {
    return BigInt(this.data.byteLength);
  }
  stat() {
    return new Filestat2(this.ino, FILETYPE_REGULAR_FILE, this.size);
  }
  constructor(data, options) {
    super();
    this.data = new Uint8Array(data);
    this.readonly = !!options?.readonly;
  }
};
var Path = class Path2 {
  static from(path3) {
    const self2 = new Path2();
    self2.is_dir = path3.endsWith("/");
    if (path3.startsWith("/")) {
      return { ret: ERRNO_NOTCAPABLE, path: null };
    }
    if (path3.includes("\0")) {
      return { ret: ERRNO_INVAL2, path: null };
    }
    for (const component of path3.split("/")) {
      if (component === "" || component === ".") {
        continue;
      }
      if (component === "..") {
        if (self2.parts.pop() == void 0) {
          return { ret: ERRNO_NOTCAPABLE, path: null };
        }
        continue;
      }
      self2.parts.push(component);
    }
    return { ret: ERRNO_SUCCESS2, path: self2 };
  }
  to_path_string() {
    let s = this.parts.join("/");
    if (this.is_dir) {
      s += "/";
    }
    return s;
  }
  constructor() {
    this.parts = [];
    this.is_dir = false;
  }
};
var Directory = class _Directory extends Inode {
  parent_ino() {
    if (this.parent == null) {
      return Inode.root_ino();
    }
    return this.parent.ino;
  }
  path_open(oflags, fs_rights_base, fd_flags) {
    return { ret: ERRNO_SUCCESS2, fd_obj: new OpenDirectory(this) };
  }
  stat() {
    return new Filestat2(this.ino, FILETYPE_DIRECTORY, 0n);
  }
  get_entry_for_path(path3) {
    let entry = this;
    for (const component of path3.parts) {
      if (!(entry instanceof _Directory)) {
        return { ret: ERRNO_NOTDIR, entry: null };
      }
      const child = entry.contents.get(component);
      if (child !== void 0) {
        entry = child;
      } else {
        debug.log(component);
        return { ret: ERRNO_NOENT, entry: null };
      }
    }
    if (path3.is_dir) {
      if (entry.stat().filetype != FILETYPE_DIRECTORY) {
        return { ret: ERRNO_NOTDIR, entry: null };
      }
    }
    return { ret: ERRNO_SUCCESS2, entry };
  }
  get_parent_dir_and_entry_for_path(path3, allow_undefined) {
    const filename = path3.parts.pop();
    if (filename === void 0) {
      return { ret: ERRNO_INVAL2, parent_entry: null, filename: null, entry: null };
    }
    const { ret: entry_ret, entry: parent_entry } = this.get_entry_for_path(path3);
    if (parent_entry == null) {
      return { ret: entry_ret, parent_entry: null, filename: null, entry: null };
    }
    if (!(parent_entry instanceof _Directory)) {
      return { ret: ERRNO_NOTDIR, parent_entry: null, filename: null, entry: null };
    }
    const entry = parent_entry.contents.get(filename);
    if (entry === void 0) {
      if (!allow_undefined) {
        return { ret: ERRNO_NOENT, parent_entry: null, filename: null, entry: null };
      } else {
        return { ret: ERRNO_SUCCESS2, parent_entry, filename, entry: null };
      }
    }
    if (path3.is_dir) {
      if (entry.stat().filetype != FILETYPE_DIRECTORY) {
        return { ret: ERRNO_NOTDIR, parent_entry: null, filename: null, entry: null };
      }
    }
    return { ret: ERRNO_SUCCESS2, parent_entry, filename, entry };
  }
  create_entry_for_path(path_str, is_dir) {
    const { ret: path_ret, path: path3 } = Path.from(path_str);
    if (path3 == null) {
      return { ret: path_ret, entry: null };
    }
    let { ret: parent_ret, parent_entry, filename, entry } = this.get_parent_dir_and_entry_for_path(path3, true);
    if (parent_entry == null || filename == null) {
      return { ret: parent_ret, entry: null };
    }
    if (entry != null) {
      return { ret: ERRNO_EXIST, entry: null };
    }
    debug.log("create", path3);
    let new_child;
    if (!is_dir) {
      new_child = new File(new ArrayBuffer(0));
    } else {
      new_child = new _Directory(/* @__PURE__ */ new Map());
    }
    parent_entry.contents.set(filename, new_child);
    entry = new_child;
    return { ret: ERRNO_SUCCESS2, entry };
  }
  constructor(contents) {
    super();
    this.parent = null;
    if (contents instanceof Array) {
      this.contents = new Map(contents);
    } else {
      this.contents = contents;
    }
    for (const entry of this.contents.values()) {
      if (entry instanceof _Directory) {
        entry.parent = this;
      }
    }
  }
};

// test_run.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
if (!isMainThread2) {
  if (workerData?.is_main_runner) {
    const run = async () => {
      const { wasi_farm_refs_object, wasmModule, args, env, projectPath } = workerData;
      console.log("[Main Runner] Creating WASIFarmAnimal...");
      const animal = new WASIFarmAnimal(wasi_farm_refs_object, args, env, {
        can_thread_spawn: true,
        thread_spawn_worker_url: "file://" + __filename.replace(".ts", ".mjs"),
        worker_background_worker_url: new URL("file://" + path2.resolve(__dirname, "custom_worker_background.mjs")),
        thread_spawn_wasm: wasmModule
      });
      const patchFdRead = () => {
        const origFdRead = animal.wasiImport.fd_read.bind(animal.wasiImport);
        animal.wasiImport.fd_read = (fd, iovs_ptr, iovs_len, nread_ptr) => {
          const ret = origFdRead(fd, iovs_ptr, iovs_len, nread_ptr);
          if (fd === 0 && ret === 0) {
            const buffer = new DataView(animal.inst.exports.memory.buffer);
            const nread = buffer.getUint32(nread_ptr, true);
            if (nread === 0) {
              console.log(`[WASM Thread] stdin EOF reached. Blocking to keep alive...`);
              const sleepBuf = new Int32Array(new SharedArrayBuffer(4));
              Atomics.wait(sleepBuf, 0, 0);
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
        parentPort2?.postMessage({ type: "exit", code: exitCode });
      } catch (e) {
        console.error("[Main Runner] Caught error:", e.stack || e);
        parentPort2?.postMessage({ type: "error", error: e.message || e.toString() });
      }
    };
    run();
  } else {
    parentPort2?.on("message", (msg) => {
      console.log("[Spawned Worker] Received message!");
      thread_spawn_on_worker(msg, WebAssembly.instantiate.bind(WebAssembly), (animal) => {
        const origGetShareMemory = animal.get_share_memory.bind(animal);
        animal.get_share_memory = () => {
          const mem = origGetShareMemory();
          return {
            ...mem,
            host_run_cargo: (req_ptr, req_len, out_stdout_ptr, out_stdout_len, out_stderr_ptr, out_stderr_len, out_status) => {
              const memoryBuffer = animal.inst.exports.memory.buffer;
              const reqStr = new TextDecoder().decode(new Uint8Array(memoryBuffer, req_ptr, req_len));
              const req = JSON.parse(reqStr);
              const projectPath = path2.resolve(__dirname, "dummy_test_project");
              console.log(`[Worker] Running cargo:`, req.args);
              let localCargoPath = req.args[0] || "cargo";
              if (localCargoPath.endsWith("cargo")) {
                if (process.env.CARGO_HOME) {
                  localCargoPath = path2.join(process.env.CARGO_HOME, "bin", "cargo");
                  if (!fs2.existsSync(localCargoPath)) localCargoPath = "cargo";
                }
                if (localCargoPath === "cargo") {
                  const homeCargo = path2.join(os2.homedir(), ".cargo", "bin", "cargo");
                  if (fs2.existsSync(homeCargo)) {
                    localCargoPath = homeCargo;
                  }
                }
              } else if (localCargoPath.endsWith("rustc")) {
                if (process.env.CARGO_HOME) {
                  localCargoPath = path2.join(process.env.CARGO_HOME, "bin", "rustc");
                  if (!fs2.existsSync(localCargoPath)) localCargoPath = "rustc";
                }
                if (localCargoPath === "rustc") {
                  const homeRustc = path2.join(os2.homedir(), ".cargo", "bin", "rustc");
                  if (fs2.existsSync(homeRustc)) {
                    localCargoPath = homeRustc;
                  }
                }
              }
              const cwd = projectPath;
              const args = req.args.slice(1).map((arg) => {
                if (arg === "/Cargo.toml") {
                  return path2.join(projectPath, "Cargo.toml");
                }
                if (arg.startsWith("/home/oligami")) {
                  return arg;
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
              if (req.args[1] === "metadata") {
                console.log(`[Worker] Cargo metadata stdout length: ${stdoutBuf.length}`);
                console.log(`[Worker] Cargo metadata stderr length: ${stderrBuf.length}`);
                if (stderrBuf.length > 0) {
                  console.log(`[Worker] Cargo metadata stderr:
${stderrBuf.toString()}`);
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
            host_free_memory: (ptr, len) => {
            }
          };
        };
        const origFdRead = animal.wasiImport.fd_read.bind(animal.wasiImport);
        animal.wasiImport.fd_read = (fd, iovs_ptr, iovs_len, nread_ptr) => {
          const ret = origFdRead(fd, iovs_ptr, iovs_len, nread_ptr);
          if (fd === 0 && ret === 0) {
            const buffer = new DataView(animal.inst.exports.memory.buffer);
            const nread = buffer.getUint32(nread_ptr, true);
            if (nread === 0) {
              console.log(`[WASM Thread] stdin EOF reached. Blocking to keep alive...`);
              const sleepBuf = new Int32Array(new SharedArrayBuffer(4));
              Atomics.wait(sleepBuf, 0, 0);
            }
          }
          return ret;
        };
        const origPollOneoff = animal.wasiImport.poll_oneoff.bind(animal.wasiImport);
        animal.wasiImport.poll_oneoff = (in_ptr, out_ptr, nsubscriptions, stored_events_count_ptr) => {
          try {
            return origPollOneoff(in_ptr, out_ptr, nsubscriptions, stored_events_count_ptr);
          } catch (e) {
            if (e instanceof TypeError && e.message.includes("Cannot mix BigInt")) {
              if (nsubscriptions !== 1) return 28;
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
              buffer.setUint16(out_ptr + 8, 0, true);
              buffer.setUint8(out_ptr + 10, eventtype);
              buffer.setUint32(stored_events_count_ptr, 1, true);
              return 0;
            }
            throw e;
          }
        };
      });
    });
  }
} else {
  async function main() {
    const wasmPath = path2.resolve(__dirname, "target/wasm32-wasip1-threads/release/rust-analyzer.wasm");
    const wasmBuffer = fs2.readFileSync(wasmPath);
    const projectPath = path2.resolve(__dirname, "dummy_test_project");
    const cargoTomlContent = fs2.readFileSync(path2.join(projectPath, "Cargo.toml"));
    const mainRsContent = fs2.readFileSync(path2.join(projectPath, "src/main.rs"));
    const dirMap = /* @__PURE__ */ new Map();
    dirMap.set("Cargo.toml", new File(cargoTomlContent));
    const srcMap = /* @__PURE__ */ new Map();
    srcMap.set("main.rs", new File(mainRsContent));
    dirMap.set("src", new PreopenDirectory("src", srcMap));
    const dir = new PreopenDirectory("/", dirMap);
    const tmpDir = new PreopenDirectory("/tmp", /* @__PURE__ */ new Map());
    const sysrootPath = process.env.RUSTUP_HOME || path2.join(os2.homedir(), ".rustup");
    const rustupDir = new PreopenDirectory("/home/oligami/.rustup", /* @__PURE__ */ new Map());
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        processId: null,
        rootUri: `file://${projectPath}`,
        initializationOptions: {
          cargo: {
            sysroot: null
          }
        },
        capabilities: { textDocument: { publishDiagnostics: { relatedInformation: true } } },
        workspaceFolders: [{ uri: `file://${projectPath}`, name: "dummy_test_project" }]
      }
    };
    function createMessage(message) {
      const json = JSON.stringify(message);
      const str = `Content-Length: ${Buffer.byteLength(json, "utf8")}\r
\r
${json}`;
      return new TextEncoder().encode(str);
    }
    const req1 = createMessage(initRequest);
    const initializedNotification = {
      jsonrpc: "2.0",
      method: "initialized",
      params: {}
    };
    const req2 = createMessage(initializedNotification);
    const didOpenRequest = {
      jsonrpc: "2.0",
      method: "textDocument/didOpen",
      params: {
        textDocument: { uri: `file://${path2.join(projectPath, "src/main.rs")}`, languageId: "rust", version: 1, text: mainRsContent.toString() }
      }
    };
    const req3 = createMessage(didOpenRequest);
    const totalStdin = new Uint8Array(req1.length + req2.length + req3.length);
    totalStdin.set(req1, 0);
    totalStdin.set(req2, req1.length);
    totalStdin.set(req3, req1.length + req2.length);
    const stdinFile = new OpenFile(new File(totalStdin));
    const fds = [
      stdinFile,
      // stdin
      new OpenFile(new File(new Uint8Array([]))),
      // stdout
      new OpenFile(new File(new Uint8Array([]))),
      // stderr
      dir,
      tmpDir
    ];
    console.log("Creating WASIFarm...");
    const farm = new WASIFarm(fds[0], fds[1], fds[2], [fds[3], fds[4]], {
      unknown_fn: async (arg) => {
        console.log(`[Main Thread] Running cargo:`, arg.args);
        let localCargoPath = "cargo";
        if (process.env.CARGO_HOME) {
          localCargoPath = path2.join(process.env.CARGO_HOME, "bin", "cargo");
          if (!fs2.existsSync(localCargoPath)) localCargoPath = "cargo";
        }
        const res = spawnSync(localCargoPath, arg.args.slice(1), {
          env: { ...process.env, ...arg.envs },
          cwd: projectPath
        });
        return {
          status: res.status || 0,
          stdout: (res.stdout || Buffer.alloc(0)).toString("base64"),
          stderr: (res.stderr || Buffer.alloc(0)).toString("base64")
        };
      }
    });
    console.log("Compiling WASM...");
    const WebAssemblyAny = globalThis.WebAssembly;
    const wasmModule = await WebAssemblyAny.compile(wasmBuffer);
    console.log("WASM compiled!");
    console.log("Spawning Main Runner Worker...");
    const worker = new Worker3(new URL("file://" + __filename.replace(".ts", ".mjs")), {
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
      const stdoutFile = fds[1].file;
      const stderrFile = fds[2].file;
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
    worker.on("message", (msg) => {
      flushOutput();
      if (msg.type === "exit") {
        console.log("WASM exited with code", msg.code);
        process.exit(msg.code);
      } else if (msg.type === "error") {
        console.error("WASM threw an error:", msg.error);
        process.exit(1);
      }
    });
    worker.on("error", (err) => {
      flushOutput();
      console.error("Worker error:", err);
      process.exit(1);
    });
    let lastStdout = 0;
    let lastStderr = 0;
    const checkOutput = setInterval(flushOutput, 1e3);
    setTimeout(() => {
      clearInterval(checkOutput);
      console.log("Timeout reached, exiting test script.");
      process.exit(0);
    }, 6e4);
  }
  main();
}
