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
    net::{SocketAddr, TcpListener, TcpStream},
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    sync::{
        atomic::{AtomicU64, Ordering},
        Mutex,
    },
    thread,
    time::{Duration, Instant},
};

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};

/// Event emitted to all windows whenever the backend status changes.
pub const BACKEND_STATUS_EVENT: &str = "BACKEND_STATUS";

const DEV_PORT: u16 = 9090;
const PROBE_TIMEOUT: Duration = Duration::from_millis(500);
const STARTUP_POLL_INTERVAL: Duration = Duration::from_millis(250);
const RUNNING_POLL_INTERVAL: Duration = Duration::from_secs(1);

#[cfg(debug_assertions)]
const STARTUP_TIMEOUT: Duration = Duration::from_secs(30);
#[cfg(not(debug_assertions))]
const STARTUP_TIMEOUT: Duration = Duration::from_secs(120);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum BackendPhase {
    Starting,
    Ready,
    Failed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackendStatus {
    pub state: BackendPhase,
    pub port: String,
    pub message: Option<String>,
    /// Monotonic counter so the frontend can discard out-of-order updates.
    pub revision: u64,
}

pub struct BackendState {
    pub port: Mutex<String>,
    pub child_process: Mutex<Option<Child>>,
    status: Mutex<BackendStatus>,
    /// Incremented on every (re)start so monitors of a previous attempt stop reporting.
    generation: AtomicU64,
}

impl BackendState {
    pub fn new() -> Self {
        Self {
            port: Mutex::new(DEV_PORT.to_string()),
            child_process: Mutex::new(None),
            status: Mutex::new(BackendStatus {
                state: BackendPhase::Starting,
                port: DEV_PORT.to_string(),
                message: None,
                revision: 0,
            }),
            generation: AtomicU64::new(0),
        }
    }

    pub fn status(&self) -> BackendStatus {
        self.status.lock().unwrap().clone()
    }

    pub fn is_ready(&self) -> bool {
        self.status.lock().unwrap().state == BackendPhase::Ready
    }

    fn next_generation(&self) -> u64 {
        self.generation.fetch_add(1, Ordering::SeqCst) + 1
    }

    fn is_current(&self, generation: u64) -> bool {
        self.generation.load(Ordering::SeqCst) == generation
    }

    /// Updates the status if `generation` is still the active start attempt.
    fn update_status(
        &self,
        generation: u64,
        state: BackendPhase,
        message: Option<String>,
    ) -> Option<BackendStatus> {
        let mut status = self.status.lock().unwrap();
        if !self.is_current(generation) {
            return None;
        }
        status.state = state;
        status.message = message;
        status.port = self.port.lock().unwrap().clone();
        status.revision += 1;
        Some(status.clone())
    }

    /// Returns a description of the exit status if the backend process has terminated.
    fn take_exited_child(&self) -> Option<String> {
        let mut guard = self.child_process.lock().unwrap();
        let exit = guard.as_mut()?.try_wait().ok().flatten()?;
        *guard = None;
        Some(exit.to_string())
    }
}

fn set_status(
    app: &AppHandle,
    state: &BackendState,
    generation: u64,
    phase: BackendPhase,
    message: Option<String>,
) {
    if let Some(status) = state.update_status(generation, phase, message) {
        println!("Backend status: {:?} (port {})", status.state, status.port);
        if let Some(message) = &status.message {
            eprintln!("Backend status message: {message}");
        }
        let _ = app.emit(BACKEND_STATUS_EVENT, status);
    }
}

pub fn is_port_reachable(port: u16) -> bool {
    TcpStream::connect_timeout(&SocketAddr::from(([127, 0, 0, 1], port)), PROBE_TIMEOUT).is_ok()
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

/// Starts the backend (release) or attaches to the externally started one (debug)
/// and reports progress via [`BACKEND_STATUS_EVENT`].
pub fn start_backend(app: &AppHandle, state: &BackendState) {
    let generation = state.next_generation();
    let dev_mode = cfg!(debug_assertions);
    let port = if dev_mode { DEV_PORT } else { find_free_port() };
    *state.port.lock().unwrap() = port.to_string();

    set_status(app, state, generation, BackendPhase::Starting, None);

    if dev_mode {
        println!("Development mode: expecting backend on port {port}");
    } else if let Err(message) = spawn_backend(app, state, port) {
        set_status(app, state, generation, BackendPhase::Failed, Some(message));
        return;
    }

    let app_handle = app.clone();
    thread::spawn(move || monitor_backend(app_handle, generation, port));
}

/// Restarts the backend after a failure. Ignored while a start is in progress or the backend is ready.
pub fn restart_backend(app: &AppHandle, state: &BackendState) -> BackendStatus {
    if state.status().state != BackendPhase::Failed {
        return state.status();
    }
    clean_up_backend(state);
    start_backend(app, state);
    state.status()
}

fn spawn_backend(app: &AppHandle, state: &BackendState, port: u16) -> Result<(), String> {
    let binary_path =
        get_backend_path(app).ok_or_else(|| "Backend executable not found.".to_string())?;

    println!("Starting backend from: {:?}", binary_path);
    println!("Backend port: {}", port);

    let mut child = Command::new(&binary_path)
        .arg(format!("-Dmicronaut.server.port={port}"))
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|error| format!("Failed to start backend process: {error}"))?;

    println!("Backend started with PID {}", child.id());

    if let Some(stdout) = child.stdout.take() {
        thread::spawn(move || {
            for line in BufReader::new(stdout).lines().map_while(Result::ok) {
                println!("[backend] {line}");
            }
        });
    }

    if let Some(stderr) = child.stderr.take() {
        thread::spawn(move || {
            for line in BufReader::new(stderr).lines().map_while(Result::ok) {
                eprintln!("[backend err] {line}");
            }
        });
    }

    *state.child_process.lock().unwrap() = Some(child);
    Ok(())
}

/// Polls the backend port until it accepts connections, then keeps watching the process
/// so an unexpected crash is reported to the UI.
fn monitor_backend(app: AppHandle, generation: u64, port: u16) {
    let state = app.state::<BackendState>();
    let deadline = Instant::now() + STARTUP_TIMEOUT;
    let mut ready = false;

    while state.is_current(generation) {
        if let Some(exit) = state.take_exited_child() {
            let message = if ready {
                format!("The backend stopped unexpectedly ({exit}).")
            } else {
                format!("The backend exited during startup ({exit}).")
            };
            set_status(
                &app,
                &state,
                generation,
                BackendPhase::Failed,
                Some(message),
            );
            return;
        }

        if ready {
            thread::sleep(RUNNING_POLL_INTERVAL);
            continue;
        }

        if is_port_reachable(port) {
            ready = true;
            set_status(&app, &state, generation, BackendPhase::Ready, None);
            if cfg!(debug_assertions) {
                return;
            }
        } else if Instant::now() >= deadline {
            let message = format!(
                "The backend did not respond on port {port} within {} seconds.",
                STARTUP_TIMEOUT.as_secs()
            );
            set_status(
                &app,
                &state,
                generation,
                BackendPhase::Failed,
                Some(message),
            );
            if state.is_current(generation) {
                clean_up_backend(&state);
            }
            return;
        } else {
            thread::sleep(STARTUP_POLL_INTERVAL);
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

        let _ = child.wait();
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

    #[test]
    fn status_updates_increment_revision_and_carry_port() {
        let state = BackendState::new();
        let generation = state.next_generation();
        *state.port.lock().unwrap() = "30001".to_string();

        let starting = state
            .update_status(generation, BackendPhase::Starting, None)
            .unwrap();
        let ready = state
            .update_status(generation, BackendPhase::Ready, None)
            .unwrap();

        assert_eq!(starting.revision + 1, ready.revision);
        assert_eq!(ready.port, "30001");
        assert!(state.is_ready());
    }

    #[test]
    fn stale_generation_cannot_change_status() {
        let state = BackendState::new();
        let old_generation = state.next_generation();
        let new_generation = state.next_generation();

        state
            .update_status(new_generation, BackendPhase::Starting, None)
            .unwrap();
        let stale = state.update_status(
            old_generation,
            BackendPhase::Failed,
            Some("stale".to_string()),
        );

        assert!(stale.is_none());
        assert_eq!(state.status().state, BackendPhase::Starting);
    }

    #[test]
    fn status_serializes_for_frontend() {
        let status = BackendStatus {
            state: BackendPhase::Failed,
            port: "30001".to_string(),
            message: Some("boom".to_string()),
            revision: 3,
        };
        assert_eq!(
            serde_json::to_value(status).unwrap(),
            serde_json::json!({"state": "failed", "port": "30001", "message": "boom", "revision": 3})
        );
    }

    #[test]
    fn detects_reachable_and_closed_ports() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        assert!(is_port_reachable(port));
        drop(listener);

        // Port 1 (tcpmux) is reserved and not served on loopback.
        assert!(!is_port_reachable(1));
    }

    #[cfg(unix)]
    #[test]
    fn reports_exited_child_process() {
        let state = BackendState::new();
        let child = Command::new("true").spawn().unwrap();
        *state.child_process.lock().unwrap() = Some(child);

        let deadline = Instant::now() + Duration::from_secs(5);
        let mut exit = None;
        while exit.is_none() && Instant::now() < deadline {
            exit = state.take_exited_child();
            thread::sleep(Duration::from_millis(20));
        }

        assert!(exit.is_some());
        assert!(state.child_process.lock().unwrap().is_none());
    }
}
