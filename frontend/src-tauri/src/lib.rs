use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use std::sync::Mutex;

// Store the backend process handle so we can kill it on shutdown
struct BackendState {
    child: Option<tauri_plugin_shell::process::CommandChild>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Mutex::new(BackendState { child: None }))
        .setup(|app| {
            // Start the backend sidecar
            let shell = app.shell();
            let sidecar = shell.sidecar("qkd-backend").expect("Failed to create sidecar command");
            
            let (mut rx, child) = sidecar.spawn().expect("Failed to spawn backend sidecar");
            
            // Store the child process handle
            let state = app.state::<Mutex<BackendState>>();
            state.lock().unwrap().child = Some(child);
            
            // Log backend output in a separate thread
            tauri::async_runtime::spawn(async move {
                use tauri_plugin_shell::process::CommandEvent;
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            println!("[Backend] {}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Stderr(line) => {
                            eprintln!("[Backend Error] {}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Terminated(payload) => {
                            println!("[Backend] Process terminated with code: {:?}", payload.code);
                            break;
                        }
                        _ => {}
                    }
                }
            });

            println!("QKD-Lab backend started on http://127.0.0.1:8000");

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                // Kill the backend when the window is destroyed
                let state = window.state::<Mutex<BackendState>>();
                let mut guard = state.lock().unwrap();
                if let Some(child) = guard.child.take() {
                    let _ = child.kill();
                    println!("Backend process terminated");
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
