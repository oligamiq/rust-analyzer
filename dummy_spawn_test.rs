use std::process::Command;
fn main() {
    println!("Spawn result: {:?}", Command::new("cargo").spawn());
}
