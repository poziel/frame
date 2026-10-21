fn main() {
    // Icon changes must also refresh the executable resources and window icon.
    println!("cargo:rerun-if-changed=icons");
    tauri_build::build()
}
