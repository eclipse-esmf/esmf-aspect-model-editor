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
    fs,
    io::{BufRead, BufReader},
    net::TcpListener,
    path::{Path, PathBuf},
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
    let backend_dir = resource_dir.join("backend/macos");
    #[cfg(target_os = "windows")]
    let backend_dir = resource_dir.join("backend/windows");
    #[cfg(target_os = "linux")]
    let backend_dir = resource_dir.join("backend/linux");

    let executable = find_backend_executable(&backend_dir);

    if executable.is_none() {
        eprintln!("Backend executable not found in {:?}", backend_dir);
    }

    executable
}

/// Locates the jpackage app-image launcher inside `dir`, independent of the version in its name.
/// The app-image may sit directly in `dir` or in one wrapping folder (e.g. from an unpacked archive).
fn find_backend_executable(dir: &Path) -> Option<PathBuf> {
    launcher_in(dir).or_else(|| {
        sorted_entries(dir)
            .into_iter()
            .filter(|p| p.is_dir())
            .find_map(|p| launcher_in(&p))
    })
}

#[cfg(target_os = "macos")]
fn launcher_in(dir: &Path) -> Option<PathBuf> {
    // <name>.app/Contents/MacOS/<launcher>
    sorted_entries(dir)
        .into_iter()
        .filter(|bundle| bundle.extension().is_some_and(|ext| ext == "app"))
        .find_map(|bundle| {
            let macos_dir = bundle.join("Contents/MacOS");
            let by_bundle_name = bundle
                .file_stem()
                .map(|stem| macos_dir.join(stem))
                .filter(|file| file.is_file());
            by_bundle_name.or_else(|| {
                sorted_entries(&macos_dir)
                    .into_iter()
                    .find(|file| file.is_file() && file.extension().is_none())
            })
        })
}

#[cfg(target_os = "windows")]
fn launcher_in(dir: &Path) -> Option<PathBuf> {
    // <name>.exe next to the app/ and runtime/ folders
    sorted_entries(dir).into_iter().find(|file| {
        file.is_file()
            && file
                .extension()
                .is_some_and(|ext| ext.eq_ignore_ascii_case("exe"))
            && file
                .file_name()
                .is_some_and(|name| name.to_string_lossy().starts_with("ame-backend"))
    })
}

#[cfg(target_os = "linux")]
fn launcher_in(dir: &Path) -> Option<PathBuf> {
    // <name>/bin/<name>
    let name = dir.file_name()?;
    let executable = dir.join("bin").join(name);
    executable.is_file().then_some(executable)
}

fn sorted_entries(dir: &Path) -> Vec<PathBuf> {
    let mut entries: Vec<PathBuf> = fs::read_dir(dir)
        .map(|entries| entries.flatten().map(|entry| entry.path()).collect())
        .unwrap_or_default();
    entries.sort();
    entries
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

    if let Some(child) = child_guard.take() {
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

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_dir(name: &str) -> PathBuf {
        let dir =
            std::env::temp_dir().join(format!("ame-backend-test-{name}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn touch(path: &Path) {
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(path, b"").unwrap();
    }

    #[cfg(target_os = "macos")]
    fn app_image(root: &Path, name: &str) -> PathBuf {
        let executable = root.join(format!("{name}.app/Contents/MacOS/{name}"));
        touch(&executable);
        touch(&root.join(format!("{name}.app/Contents/Info.plist")));
        touch(&root.join(format!("{name}.app/Contents/MacOS/libapplauncher.dylib")));
        executable
    }

    #[cfg(target_os = "windows")]
    fn app_image(root: &Path, name: &str) -> PathBuf {
        let executable = root.join(format!("{name}/{name}.exe"));
        touch(&executable);
        touch(&root.join(format!("{name}/app/{name}.cfg")));
        executable
    }

    #[cfg(target_os = "linux")]
    fn app_image(root: &Path, name: &str) -> PathBuf {
        let executable = root.join(format!("{name}/bin/{name}"));
        touch(&executable);
        touch(&root.join(format!("{name}/lib/app/{name}.cfg")));
        executable
    }

    #[test]
    fn finds_versioned_app_image() {
        let dir = temp_dir("versioned");
        let executable = app_image(&dir, "ame-backend-6.2.0-os");
        assert_eq!(find_backend_executable(&dir), Some(executable));
    }

    #[test]
    fn finds_app_image_in_wrapping_folder() {
        let dir = temp_dir("wrapped");
        let executable = app_image(&dir.join("extracted"), "ame-backend-DEV-SNAPSHOT-os");
        assert_eq!(find_backend_executable(&dir), Some(executable));
    }

    #[test]
    fn returns_none_without_backend() {
        let dir = temp_dir("empty");
        assert_eq!(find_backend_executable(&dir), None);
        assert_eq!(find_backend_executable(&dir.join("missing")), None);
    }
}
