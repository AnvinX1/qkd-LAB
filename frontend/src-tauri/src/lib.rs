use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use std::sync::{Arc, Mutex};
use std::time::Duration;

// Store the backend process handle so we can kill it on shutdown
struct BackendState {
    child: Option<tauri_plugin_shell::process::CommandChild>,
    ready: Arc<Mutex<bool>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(BackendState {
            child: None,
            ready: Arc::new(Mutex::new(false)),
        })
        .setup(|app| {
            let ready_flag = app
                .state::<BackendState>()
                .ready
                .clone();

            // Start the backend sidecar
            let shell = app.shell();
            let sidecar = shell.sidecar("qkd-backend")
                .expect("Failed to create sidecar command");
            
            let (mut rx, child) = sidecar.spawn()
                .expect("Failed to spawn backend sidecar");
            
            // Store the child process handle
            let state = app.state::<BackendState>();
            {
                let mut guard = state as *const BackendState as *mut BackendState;
                unsafe {
                    (*guard).child = Some(child);
                }
            }
            
            // Log backend output and monitor for startup in a separate thread
            tauri::async_runtime::spawn(async move {
                use tauri_plugin_shell::process::CommandEvent;
                let mut started = false;
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            let output = String::from_utf8_lossy(&line);
                            println!("[Backend] {}", output);
                            
                            // Check if backend is ready
                            if output.contains("Uvicorn running on") || 
                               output.contains("Listening on") ||
                               output.contains("API Docs") {
                                started = true;
                                *ready_flag.lock().unwrap() = true;
                                println!("✓ Backend is ready for connections");
                            }
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
                if !started {
                    eprintln!("⚠ Backend process exited without clear startup confirmation");
                }
            });

            // Spawn a separate task to wait for backend health check
            let ready_flag_clone = app.state::<BackendState>().ready.clone();
            tauri::async_runtime::spawn(async move {
                wait_for_backend_health(ready_flag_clone).await;
            });

            println!("🔬 QKD-Lab Backend Startup Initiated");

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
                let state = window.state::<BackendState>();
                let mut guard = state as *const BackendState as *mut BackendState;
                unsafe {
                    if let Some(child) = (*guard).child.take() {
                        let _ = child.kill();
                        println!("Backend process terminated");
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Wait for backend to be ready by performing health checks with exponential backoff
async fn wait_for_backend_health(ready_flag: Arc<Mutex<bool>>) {
    const MAX_ATTEMPTS: u32 = 30;
    const INITIAL_DELAY_MS: u64 = 200;
    const MAX_DELAY_MS: u64 = 2000;
    
    let mut attempt = 0;
    let mut delay = INITIAL_DELAY_MS;
    
    while attempt < MAX_ATTEMPTS {
        attempt += 1;
        
        // Check if already marked ready
        if *ready_flag.lock().unwrap() {
            println!("✓ Backend health check passed (via log monitoring)");
            return;
        }
        
        // Perform HTTP health check
        match perform_health_check().await {
            Ok(true) => {
                *ready_flag.lock().unwrap() = true;
                println!("✓ Backend health check passed (via HTTP)");
                return;
            }
            Ok(false) => {
                println!("⚠ Backend responded but not ready yet (attempt {}/{})", attempt, MAX_ATTEMPTS);
            }
            Err(_) => {
                if attempt == 1 {
                    println!("⏳ Waiting for backend to start (attempt {}/{})", attempt, MAX_ATTEMPTS);
                }
            }
        }
        
        // Exponential backoff with max delay
        tokio::time::sleep(Duration::from_millis(delay)).await;
        delay = std::cmp::min(delay * 2, MAX_DELAY_MS);
    }
    
    eprintln!("⚠ Backend health check timeout after {} attempts", MAX_ATTEMPTS);
    eprintln!("  The app will continue, but backend may not be ready");
    *ready_flag.lock().unwrap() = true; // Mark as ready anyway to unblock
}

/// Perform a simple health check on the backend
async fn perform_health_check() -> Result<bool, Box<dyn std::error::Error>> {
    let urls = [
        "http://localhost:8000/health",
        "http://127.0.0.1:8000/health",
        "http://localhost:8000/docs",
    ];
    
    for url in urls.iter() {
        match reqwest::Client::new()
            .get(*url)
            .timeout(Duration::from_secs(1))
            .send()
            .await
        {
            Ok(resp) => return Ok(resp.status().is_success()),
            Err(_) => continue,
        }
    }
    
    Err("No health endpoints responded".into())
}
