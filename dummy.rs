use std::thread;
fn main() {
    let t = thread::spawn(|| {
        thread::park();
        println!("Unparked!");
    });
    t.thread().unpark();
    t.join().unwrap();
}
