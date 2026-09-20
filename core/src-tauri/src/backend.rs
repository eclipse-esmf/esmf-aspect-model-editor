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

use std::io::{BufRead, BufReader};
use std::net::TcpListener;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
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
        if let Ok(listener) = TcpListener::bind(format!("127.0.0.1:{}", port)) {
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

pub fn get_backend_executable_path(app: &AppHandle) -> Option<PathBuf> {
    let resource_dir = app.path().resource_dir().unwrap_or_else(|_| PathBuf::from("."));
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));

    let candidates = [
        resource_dir.join("backend"),
        resource_dir.join("../backend"),
        exe_dir.join("backend"),
        exe_dir.join("../Resources/backend"),
        PathBuf::from("./backend"),
        PathBuf::from("../backend"),
    ];

    #[cfg(target_os = "windows")]
    let ext_filter = ".exe";
    #[cfg(not(target_os = "windows"))]
    let ext_filter = "";

    for dir in &candidates {
        if !dir.exists() {
            continue;
        }

        // Check inside signed_dir on Windows if present
        #[cfg(target_os = "windows")]
        let search_dirs = [dir.join("signed_dir"), dir.clone()];
        #[cfg(not(target_os = "windows"))]
        let search_dirs = [dir.clone()];

        for search_dir in &search_dirs {
            if let Ok(entries) = std::fs::read_dir(search_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                        if file_name.starts_with("ame-backend") && (!cfg!(target_os = "windows") || file_name.ends_with(ext_filter)) {
                            return Some(path);
                        }
                    }
                }
            }
        }
    }

    None
}

pub fn start_backend(app: &AppHandle, state: &BackendState) {
    let dev_mode = cfg!(debug_assertions);

    if dev_mode {
        println!("Development mode: assuming backend running on port 9090");
        *state.port.lock().unwrap() = "9090".to_string();
        return;
    }

    let port = find_free_port();
    *state.port.lock().unwrap() = port.to_string();

    if let Some(binary_path) = get_backend_executable_path(app) {
        println!("Starting backend process from: {:?}", binary_path);
        match Command::new(&binary_path)
            .arg(format!("-Dmicronaut.server.port={}", port))
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
        {
            Ok(mut child) => {
                if let Some(stdout) = child.stdout.take() {
                    let app_handle = app.clone();
                    std::thread::spawn(move || {
                        let reader = BufReader::new(stdout);
                        for line in reader.lines().flatten() {
                            println!("[backend] {}", line);
                            if line.contains("Server Running") {
                                println!("AME Server Running on port {}", port);
                                if let Some(splash) = app_handle.get_webview_window("splashscreen") {
                                    let _ = splash.close();
                                }
                                if let Some(main_win) = app_handle.get_webview_window("main") {
                                    let _ = main_win.show();
                                    let _ = main_win.set_focus();
                                }
                            }
                        }
                    });
                }

                if let Some(stderr) = child.stderr.take() {
                    std::thread::spawn(move || {
                        let reader = BufReader::new(stderr);
                        for line in reader.lines().flatten() {
                            eprintln!("[backend err] {}", line);
                        }
                    });
                }

                *state.child_process.lock().unwrap() = Some(child);
            }
            Err(e) => {
                eprintln!("Failed to spawn backend process: {}", e);
            }
        }
    } else {
        eprintln!("Backend executable not found!");
    }
}

pub fn clean_up_backend(state: &BackendState) {
    let mut child_guard = state.child_process.lock().unwrap();
    if let Some(mut child) = child_guard.take() {
        let pid = child.id();
        println!("Cleaning up backend process PID {}", pid);

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
