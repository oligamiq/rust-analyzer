// Copyright 2016 Amanieu d'Antras
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.

//! The wasm platform can't park when atomic support is not available.
//! So this ThreadParker just panics on any attempt to park.

use std::thread::{self, Thread};
use std::time::{Instant, Duration};

pub struct ThreadParker(Thread);

impl super::ThreadParkerT for ThreadParker {
    type UnparkHandle = UnparkHandle;

    const IS_CHEAP_TO_CONSTRUCT: bool = false;

    fn new() -> ThreadParker {
        ThreadParker(thread::current())
    }

    unsafe fn prepare_park(&self) {
    }

    unsafe fn timed_out(&self) -> bool {
        false
    }

    unsafe fn park(&self) {
        thread::park();
    }

    unsafe fn park_until(&self, timeout: Instant) -> bool {
        let now = Instant::now();
        if timeout <= now {
            return false;
        }
        thread::park_timeout(timeout - now);
        true
    }

    unsafe fn unpark_lock(&self) -> UnparkHandle {
        UnparkHandle(self.0.clone())
    }
}

pub struct UnparkHandle(Thread);

impl super::UnparkHandleT for UnparkHandle {
    unsafe fn unpark(self) {
        self.0.unpark();
    }
}

pub fn thread_yield() {
    thread::yield_now();
}
