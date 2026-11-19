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
    net::{SocketAddr, TcpStream},
    path::{Path, PathBuf},
    process::{Child, Command, Stdio},
    sync::{
        atomic::{AtomicU64, Ordering},
        mpsc::{self, Receiver, RecvTimeoutError},
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
/// Time the backend gets to shut down gracefully (and write its class data sharing archive) before it is killed.
const SHUTDOWN_TIMEOUT: Duration = Duration::from_secs(5);
const SHUTDOWN_POLL_INTERVAL: Duration = Duration::from_millis(50);

/// Line the backend prints to stdout once its HTTP server accepts connections.
const READY_PREFIX: &str = "AME_BACKEND_READY port=";
/// Environment variable and request header that carry the per-start secret shared with the backend.
const AUTH_TOKEN_ENV: &str = "AME_AUTH_TOKEN";
const JAVA_TOOL_OPTIONS_ENV: &str = "JAVA_TOOL_OPTIONS";
const CDS_ARCHIVE_FILE: &str = "ame-backend.jsa";

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
    /// Secret the UI sends as `X-AME-Token` header; `None` when the backend was started externally (development).
    pub token: Option<String>,
    /// Monotonic counter so the frontend can discard out-of-order updates.
    pub revision: u64,
}

pub struct BackendState {
    pub port: Mutex<String>,
    pub child_process: Mutex<Option<Child>>,
    status: Mutex<BackendStatus>,
    token: Mutex<Option<String>>,
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
                token: None,
                revision: 0,
            }),
            token: Mutex::new(None),
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
        status.token = self.token.lock().unwrap().clone();
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

/// Extracts the port from the readiness line printed by the backend.
fn parse_ready_line(line: &str) -> Option<u16> {
    line.trim()
        .strip_prefix(READY_PREFIX)?
        .parse()
        .ok()
        .filter(|port| *port != 0)
}

fn generate_token() -> Result<String, String> {
    let mut bytes = [0u8; 32];
    getrandom::fill(&mut bytes)
        .map_err(|error| format!("Failed to create backend token: {error}"))?;
    Ok(bytes.iter().map(|byte| format!("{byte:02x}")).collect())
}

/// JVM options for a dynamic AppCDS archive: created on the first graceful shutdown, reused afterwards
/// and recreated automatically when the backend changes. Options the user set are kept.
fn java_tool_options(archive: &Path, existing: Option<&str>) -> String {
    let cds = format!(
        "-XX:SharedArchiveFile=\"{}\" -XX:+AutoCreateSharedArchive -Xlog:cds*=error",
        archive.display()
    );
    match existing
        .map(str::trim)
        .filter(|options| !options.is_empty())
    {
        Some(options) => format!("{options} {cds}"),
        None => cds,
    }
}

fn cds_archive_path(app: &AppHandle) -> Option<PathBuf> {
    let dir = app.path().app_cache_dir().ok()?.join("backend");
    fs::create_dir_all(&dir)
        .map_err(|error| eprintln!("Class data sharing disabled, cannot create {dir:?}: {error}"))
        .ok()?;
    Some(dir.join(CDS_ARCHIVE_FILE))
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
    sorted_entries(dir)
        .into_iter()
        .filter(|image| image.is_dir())
        .find_map(|image| {
            let executable = image.join("bin").join(image.file_name()?);
            executable.is_file().then_some(executable)
        })
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
    // The port of a spawned backend is chosen by the operating system and known once it reports readiness.
    *state.port.lock().unwrap() = if dev_mode {
        DEV_PORT.to_string()
    } else {
        String::new()
    };
    *state.token.lock().unwrap() = None;

    set_status(app, state, generation, BackendPhase::Starting, None);

    let readiness = if dev_mode {
        println!("Development mode: expecting backend on port {DEV_PORT}");
        Readiness::Probe(DEV_PORT)
    } else {
        match generate_token().and_then(|token| spawn_backend(app, state, token)) {
            Ok(announced) => Readiness::Announced(announced),
            Err(message) => {
                set_status(app, state, generation, BackendPhase::Failed, Some(message));
                return;
            }
        }
    };

    let app_handle = app.clone();
    thread::spawn(move || monitor_backend(app_handle, generation, readiness));
}

/// How the monitor learns that the backend accepts connections.
enum Readiness {
    /// Externally started backend on a fixed port (development).
    Probe(u16),
    /// Spawned backend announcing its port on stdout.
    Announced(Receiver<u16>),
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

/// Port `-1` lets the operating system pick a free port, avoiding a race between choosing and binding it.
/// The backend stops by itself once its stdin is closed ([`clean_up_backend`]) or the process `parent_pid`
/// has ended, so it does not outlive the app after a crash or a hard kill.
fn backend_args(parent_pid: u32) -> [String; 3] {
    [
        "-Dmicronaut.server.port=-1".to_string(),
        format!("-Dame.parent-pid={parent_pid}"),
        "-Dame.exit-on-stdin-eof=true".to_string(),
    ]
}

fn spawn_backend(
    app: &AppHandle,
    state: &BackendState,
    token: String,
) -> Result<Receiver<u16>, String> {
    let binary_path =
        get_backend_path(app).ok_or_else(|| "Backend executable not found.".to_string())?;

    println!("Starting backend from: {:?}", binary_path);

    let mut command = Command::new(&binary_path);
    command
        .args(backend_args(std::process::id()))
        .env(AUTH_TOKEN_ENV, &token)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
    if let Some(archive) = cds_archive_path(app) {
        let existing = std::env::var(JAVA_TOOL_OPTIONS_ENV).ok();
        command.env(
            JAVA_TOOL_OPTIONS_ENV,
            java_tool_options(&archive, existing.as_deref()),
        );
    }

    let mut child = command
        .spawn()
        .map_err(|error| format!("Failed to start backend process: {error}"))?;

    println!("Backend started with PID {}", child.id());

    let (ready_sender, ready_receiver) = mpsc::channel();
    if let Some(stdout) = child.stdout.take() {
        thread::spawn(move || {
            for line in BufReader::new(stdout).lines().map_while(Result::ok) {
                if let Some(port) = parse_ready_line(&line) {
                    let _ = ready_sender.send(port);
                }
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

    *state.token.lock().unwrap() = Some(token);
    *state.child_process.lock().unwrap() = Some(child);
    Ok(ready_receiver)
}

/// Waits until the backend accepts connections, then keeps watching the process
/// so an unexpected crash is reported to the UI.
fn monitor_backend(app: AppHandle, generation: u64, readiness: Readiness) {
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

        let ready_port = match &readiness {
            Readiness::Probe(port) => is_port_reachable(*port).then_some(*port).or_else(|| {
                thread::sleep(STARTUP_POLL_INTERVAL);
                None
            }),
            Readiness::Announced(receiver) => match receiver.recv_timeout(STARTUP_POLL_INTERVAL) {
                Ok(port) => Some(port),
                Err(RecvTimeoutError::Timeout) => None,
                // stdout closed: the process is about to exit, which is reported in the next iteration.
                Err(RecvTimeoutError::Disconnected) => {
                    thread::sleep(STARTUP_POLL_INTERVAL);
                    None
                }
            },
        };

        if let Some(port) = ready_port {
            ready = true;
            if state.is_current(generation) {
                *state.port.lock().unwrap() = port.to_string();
            }
            set_status(&app, &state, generation, BackendPhase::Ready, None);
            if matches!(readiness, Readiness::Probe(_)) {
                return;
            }
        } else if Instant::now() >= deadline {
            let message = format!(
                "The backend did not report readiness within {} seconds.",
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
        }
    }
}

pub fn clean_up_backend(state: &BackendState) {
    let child = state.child_process.lock().unwrap().take();
    if let Some(child) = child {
        println!("Cleaning up backend process PID {}", child.id());
        shut_down(child, SHUTDOWN_TIMEOUT);
    }
}

/// Closes the stdin of the backend so it shuts down gracefully; kills it if it is still running after `timeout`.
/// Returns whether the process stopped by itself.
fn shut_down(mut child: Child, timeout: Duration) -> bool {
    drop(child.stdin.take());

    let deadline = Instant::now() + timeout;
    let graceful = loop {
        match child.try_wait() {
            Ok(Some(_)) | Err(_) => break true,
            Ok(None) if Instant::now() >= deadline => break false,
            Ok(None) => thread::sleep(SHUTDOWN_POLL_INTERVAL),
        }
    };

    if !graceful {
        let pid = child.id();
        eprintln!("Backend process PID {pid} did not stop within {timeout:?}, killing it");

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

    let _ = child.wait();
    graceful
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::TcpListener;

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
    fn backend_args_request_os_port_and_graceful_shutdown() {
        assert_eq!(
            backend_args(4242),
            [
                "-Dmicronaut.server.port=-1".to_string(),
                "-Dame.parent-pid=4242".to_string(),
                "-Dame.exit-on-stdin-eof=true".to_string(),
            ]
        );
    }

    #[test]
    fn parses_ready_line() {
        assert_eq!(
            parse_ready_line("AME_BACKEND_READY port=30001"),
            Some(30001)
        );
        assert_eq!(
            parse_ready_line("AME_BACKEND_READY port=30001\r"),
            Some(30001)
        );
        assert_eq!(parse_ready_line("AME_BACKEND_READY port=0"), None);
        assert_eq!(parse_ready_line("AME_BACKEND_READY port=abc"), None);
        assert_eq!(parse_ready_line("Startup completed in 500ms"), None);
    }

    #[test]
    fn generates_distinct_hex_tokens() {
        let first = generate_token().unwrap();
        let second = generate_token().unwrap();
        assert_eq!(first.len(), 64);
        assert!(first.chars().all(|c| c.is_ascii_hexdigit()));
        assert_ne!(first, second);
    }

    #[test]
    fn java_tool_options_enable_cds_and_keep_user_options() {
        let archive = Path::new("/cache dir/ame-backend.jsa");
        let cds = "-XX:SharedArchiveFile=\"/cache dir/ame-backend.jsa\" -XX:+AutoCreateSharedArchive -Xlog:cds*=error";
        assert_eq!(java_tool_options(archive, None), cds);
        assert_eq!(java_tool_options(archive, Some("  ")), cds);
        assert_eq!(
            java_tool_options(archive, Some("-Xmx2g")),
            format!("-Xmx2g {cds}")
        );
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
        *state.token.lock().unwrap() = Some("secret".to_string());

        let starting = state
            .update_status(generation, BackendPhase::Starting, None)
            .unwrap();
        let ready = state
            .update_status(generation, BackendPhase::Ready, None)
            .unwrap();

        assert_eq!(starting.revision + 1, ready.revision);
        assert_eq!(ready.port, "30001");
        assert_eq!(ready.token.as_deref(), Some("secret"));
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
            token: Some("secret".to_string()),
            revision: 3,
        };
        assert_eq!(
            serde_json::to_value(status).unwrap(),
            serde_json::json!({"state": "failed", "port": "30001", "message": "boom", "token": "secret", "revision": 3})
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

    #[cfg(unix)]
    #[test]
    fn closing_stdin_stops_backend_gracefully() {
        let child = Command::new("cat")
            .stdin(Stdio::piped())
            .stdout(Stdio::null())
            .spawn()
            .unwrap();
        assert!(shut_down(child, Duration::from_secs(5)));
    }

    #[cfg(unix)]
    #[test]
    fn kills_backend_that_ignores_stdin() {
        let child = Command::new("sleep")
            .arg("30")
            .stdin(Stdio::piped())
            .spawn()
            .unwrap();
        let started = Instant::now();
        assert!(!shut_down(child, Duration::from_millis(200)));
        assert!(started.elapsed() < Duration::from_secs(10));
    }
}
