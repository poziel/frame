fn main() {
    tauri_plugin::Builder::new(&["profiles", "spawn", "write", "resize", "close"]).build();
}
