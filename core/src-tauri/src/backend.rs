/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

use std::{
    io::{BufRead, BufReader},
    net::TcpListener,
    path::PathBuf,
    process::{Child, Command, Stdio},
    sync::Mutex,
};

use tauri::{AppHandle, Manager};

pub struct BackendState {
    pub port: Mutex<String>,
    pub child_process: Mutex<Option<Child>>,
}

impl BackendState {
    pub fn new() -> Self {
        Self {
            port: Mutex::new("9090".to_string()),
            child_process: Mutex::new(None),
        }
    }
}

pub fn find_free_port() -> u16 {
    for port in 30000..31000 {
        if let Ok(listener) = TcpListener::bind(("127.0.0.1", port)) {
            drop(listener);
            return port;
        }
    }

    if let Ok(listener) = TcpListener::bind("127.0.0.1:0") {
        if let Ok(addr) = listener.local_addr() {
            return addr.port();
        }
    }

    9090
}

fn get_backend_path(app: &AppHandle) -> Option<PathBuf> {
    let resource_dir = app.path().resource_dir().ok()?;

    println!("Tauri resource directory: {:?}", resource_dir);

    #[cfg(target_os = "macos")]
    {
        let app_bundle = resource_dir.join("backend/macos/ame-backend-DEV-SNAPSHOT-mac.app");

        let executable = app_bundle.join("Contents/MacOS/ame-backend-DEV-SNAPSHOT-mac");

        if executable.exists() {
            return Some(executable);
        }

        eprintln!("macOS backend executable not found at {:?}", executable);
    }

    #[cfg(target_os = "windows")]
    {
        let executable = resource_dir.join("backend/ame-backend/ame-backend.exe");

        if executable.exists() {
            return Some(executable);
        }

        eprintln!("Windows backend executable not found at {:?}", executable);
    }

    #[cfg(target_os = "linux")]
    {
        let executable = resource_dir.join("backend/ame-backend/bin/ame-backend");

        if executable.exists() {
            return Some(executable);
        }

        eprintln!("Linux backend executable not found at {:?}", executable);
    }

    None
}

pub fn start_backend(app: &AppHandle, state: &BackendState) {
    if cfg!(debug_assertions) {
        println!("Development mode: assuming backend running on port 9090");
        *state.port.lock().unwrap() = "9090".to_string();
        return;
    }

    let port = find_free_port();
    *state.port.lock().unwrap() = port.to_string();

    let Some(binary_path) = get_backend_path(app) else {
        eprintln!("Backend executable not found!");
        return;
    };

    println!("Starting backend from: {:?}", binary_path);
    println!("Backend port: {}", port);

    match Command::new(&binary_path)
        .arg(format!("-Dmicronaut.server.port={port}"))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(mut child) => {
            println!("Backend started with PID {}", child.id());

            if let Some(stdout) = child.stdout.take() {
                let app_handle = app.clone();

                std::thread::spawn(move || {
                    let reader = BufReader::new(stdout);

                    for line in reader.lines().flatten() {
                        println!("[backend] {line}");

                        if line.contains("Server Running") {
                            println!("AME Server Running on port {port}");

                            if let Some(splash) = app_handle.get_webview_window("splashscreen") {
                                let _ = splash.close();
                            }

                            if let Some(main_window) = app_handle.get_webview_window("main") {
                                let _ = main_window.show();
                                let _ = main_window.set_focus();
                            }
                        }
                    }
                });
            }

            if let Some(stderr) = child.stderr.take() {
                std::thread::spawn(move || {
                    let reader = BufReader::new(stderr);

                    for line in reader.lines().flatten() {
                        eprintln!("[backend err] {line}");
                    }
                });
            }

            *state.child_process.lock().unwrap() = Some(child);
        }

        Err(error) => {
            eprintln!(
                "Failed to spawn backend process {:?}: {}",
                binary_path, error
            );
        }
    }
}

pub fn clean_up_backend(state: &BackendState) {
    let mut child_guard = state.child_process.lock().unwrap();

    if let Some(mut child) = child_guard.take() {
        let pid = child.id();

        println!("Cleaning up backend process PID {pid}");

        #[cfg(target_os = "windows")]
        {
            let _ = Command::new("taskkill")
                .args(["/F", "/T", "/PID", &pid.to_string()])
                .output();
        }

        #[cfg(not(target_os = "windows"))]
        {
            let _ = child.kill();
        }
    }
}
