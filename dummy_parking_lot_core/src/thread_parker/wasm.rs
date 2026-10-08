// Copyright 2016 Amanieu d'Antras
//
// Licensed under the Apache License, Version 2.0, <LICENSE-APACHE or
// http://apache.org/licenses/LICENSE-2.0> or the MIT license <LICENSE-MIT or
// http://opensource.org/licenses/MIT>, at your option. This file may not be
// copied, modified, or distributed except according to those terms.

//! Thread parker for the WASM fallback using the standard library's waiting
//! primitives. Each parker needs its own notification state: `thread::park`
//! tokens can also come from unrelated users of the current thread.

use std::sync::{Arc, Condvar, Mutex};
use std::thread;
use std::time::Instant;

struct State {
    parked: Mutex<bool>,
    wake: Condvar,
}

pub struct ThreadParker(Arc<State>);

impl super::ThreadParkerT for ThreadParker {
    type UnparkHandle = UnparkHandle;

    const IS_CHEAP_TO_CONSTRUCT: bool = false;

    fn new() -> ThreadParker {
        ThreadParker(Arc::new(State {
            parked: Mutex::new(false),
            wake: Condvar::new(),
        }))
    }

    unsafe fn prepare_park(&self) {
        *self.0.parked.lock().unwrap() = true;
    }

    unsafe fn timed_out(&self) -> bool {
        *self.0.parked.lock().unwrap()
    }

    unsafe fn park(&self) {
        let mut parked = self.0.parked.lock().unwrap();
        while *parked {
            parked = self.0.wake.wait(parked).unwrap();
        }
    }

    unsafe fn park_until(&self, timeout: Instant) -> bool {
        let mut parked = self.0.parked.lock().unwrap();
        while *parked {
            let Some(remaining) = timeout.checked_duration_since(Instant::now()) else {
                return false;
            };
            parked = self.0.wake.wait_timeout(parked, remaining).unwrap().0;
        }
        true
    }

    unsafe fn unpark_lock(&self) -> UnparkHandle {
        // Mark the notification while the parking queue is still locked.
        // Retain the state BEFORE publishing false: a timed/spurious wake can
        // observe it and let the target exit, destroying its ThreadParker.
        let state = self.0.clone();
        *state.parked.lock().unwrap() = false;
        UnparkHandle(state)
    }
}

pub struct UnparkHandle(Arc<State>);

impl super::UnparkHandleT for UnparkHandle {
    unsafe fn unpark(self) {
        self.0.wake.notify_one();
    }
}

pub fn thread_yield() {
    thread::yield_now();
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::thread_parker::{ThreadParkerT, UnparkHandleT};
    use std::sync::{mpsc, Arc};
    use std::time::Duration;

    #[test]
    fn wasm_parker_timeout_is_not_a_notification() {
        let parker = ThreadParker::new();
        unsafe {
            parker.prepare_park();
            assert!(!parker.park_until(Instant::now() + Duration::from_millis(10)));
            assert!(parker.timed_out());
            let notification = parker.unpark_lock();
            assert!(!parker.timed_out());
            notification.unpark();
        }
    }

    #[test]
    fn wasm_parker_ignores_an_unrelated_thread_token() {
        thread::spawn(|| {
            let parker = ThreadParker::new();
            thread::current().unpark();
            unsafe {
                parker.prepare_park();
                let deadline = Instant::now() + Duration::from_millis(10);
                assert!(!parker.park_until(deadline));
                assert!(Instant::now() >= deadline);
                assert!(parker.timed_out());
            }
        })
        .join()
        .unwrap();
    }

    #[test]
    fn wasm_parker_notification_before_wait_is_retained() {
        let parker = ThreadParker::new();
        unsafe {
            parker.prepare_park();
            parker.unpark_lock().unpark();
            assert!(!parker.timed_out());
            assert!(parker.park_until(Instant::now() + Duration::from_secs(1)));
            parker.prepare_park();
            assert!(parker.timed_out());
        }
    }

    #[test]
    fn wasm_parker_untimed_wait_requires_its_own_notification() {
        let (ready_tx, ready_rx) = mpsc::channel();
        let (done_tx, done_rx) = mpsc::channel();
        let worker = thread::spawn(move || {
            let parker = Arc::new(ThreadParker::new());
            thread::current().unpark();
            unsafe {
                parker.prepare_park();
            }
            ready_tx.send(parker.clone()).unwrap();
            unsafe {
                parker.park();
            }
            done_tx.send(()).unwrap();
        });
        let parker = ready_rx.recv().unwrap();
        let early = done_rx.recv_timeout(Duration::from_millis(30));
        unsafe {
            parker.unpark_lock().unpark();
        }
        worker.join().unwrap();
        assert!(matches!(early, Err(mpsc::RecvTimeoutError::Timeout)));
    }
}
