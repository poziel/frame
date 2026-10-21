#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn consumer_ping() -> &'static str { "External Rust host connected" }

#[tauri::command]
fn consumer_complete(app: tauri::AppHandle, result: serde_json::Value) {
    if let Some(path) = std::env::var_os("FRAME_CONSUMER_RESULT") {
        std::fs::write(path, serde_json::to_vec_pretty(&result).unwrap()).unwrap();
        app.exit(if result["ok"] == true { 0 } else { 1 });
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![consumer_ping, consumer_complete])
        .run(tauri::generate_context!())
        .expect("external consumer failed to start");
}
