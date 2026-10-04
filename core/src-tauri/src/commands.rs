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

use crate::backend::{clean_up_backend, restart_backend, BackendState, BackendStatus};
use crate::session::{SessionModel, SessionState, WindowGeometry};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::menu::{ContextMenu, Menu, MenuItem};
use tauri::{
    AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize, Runtime, State, WebviewUrl,
    WebviewWindow, WebviewWindowBuilder,
};
use tauri_plugin_clipboard_manager::ClipboardExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowData {
    pub id: String,
    pub options: Option<serde_json::Value>,
}

pub struct AppWindowState {
    pub windows_options: Mutex<HashMap<String, serde_json::Value>>,
}

impl AppWindowState {
    pub fn new() -> Self {
        Self {
            windows_options: Mutex::new(HashMap::new()),
        }
    }
}

pub struct ContextMenuState {
    pub active_href: Mutex<Option<String>>,
}

impl ContextMenuState {
    pub fn new() -> Self {
        Self {
            active_href: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub fn get_backend_port(backend_state: State<'_, BackendState>) -> Result<String, String> {
    let port = backend_state.port.lock().map_err(|e| e.to_string())?;
    Ok(port.clone())
}

#[tauri::command]
pub fn get_backend_status(backend_state: State<'_, BackendState>) -> BackendStatus {
    backend_state.status()
}

#[tauri::command]
pub fn retry_backend_start(
    app: AppHandle,
    backend_state: State<'_, BackendState>,
) -> BackendStatus {
    restart_backend(&app, &backend_state)
}

#[tauri::command]
pub fn quit_app(app: AppHandle, backend_state: State<'_, BackendState>) {
    clean_up_backend(&backend_state);
    app.exit(0);
}

#[tauri::command]
pub fn open_external_link(link: String) -> Result<(), String> {
    open::that(&link).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_in_vscode_or_default(
    vscode_url: String,
    file_path: Option<String>,
) -> Result<(), String> {
    if open::that(&vscode_url).is_err() {
        if let Some(path) = file_path {
            #[cfg(target_os = "windows")]
            {
                std::process::Command::new("OpenWith.exe")
                    .arg(&path)
                    .spawn()
                    .map_err(|e| e.to_string())?;
                return Ok(());
            }

            #[cfg(not(target_os = "windows"))]
            {
                open::that(&path).map_err(|e| e.to_string())?;
                return Ok(());
            }
        }
    }
    Ok(())
}

#[tauri::command]
pub fn copy_to_clipboard(app: AppHandle, text: String) -> Result<(), String> {
    app.clipboard().write_text(text).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_print_file(content: String) -> Result<String, String> {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    let ame_tmp_dir = home.join(".ametmp");
    if !ame_tmp_dir.exists() {
        fs::create_dir_all(&ame_tmp_dir).map_err(|e| e.to_string())?;
    }
    let print_file_path = ame_tmp_dir.join("print.html");
    fs::write(&print_file_path, content).map_err(|e| e.to_string())?;
    Ok(print_file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn open_print_window(app: AppHandle, file_path: String) -> Result<(), String> {
    let print_label = format!(
        "print-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()
    );
    let url = if file_path.starts_with("http://")
        || file_path.starts_with("https://")
        || file_path.starts_with("file://")
    {
        file_path.parse().unwrap()
    } else {
        format!("file://{}", file_path).parse().unwrap()
    };

    WebviewWindowBuilder::new(&app, &print_label, WebviewUrl::External(url))
        .title("Print Preview")
        .inner_size(1920.0, 1080.0)
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn create_window(
    app: AppHandle,
    window_state: State<'_, AppWindowState>,
    options: Option<serde_json::Value>,
) -> Result<(), String> {
    if let Some(ref opts_val) = options {
        let ns = opts_val.get("namespace").and_then(|v| v.as_str());
        let file = opts_val.get("file").and_then(|v| v.as_str());
        let edit_elem = opts_val.get("editElement").and_then(|v| v.as_str());

        if let (Some(ns_str), Some(file_str)) = (ns, file) {
            let opts_map = window_state
                .windows_options
                .lock()
                .map_err(|e| e.to_string())?;
            for (label, existing_opts_val) in opts_map.iter() {
                let ex_ns = existing_opts_val.get("namespace").and_then(|v| v.as_str());
                let ex_file = existing_opts_val.get("file").and_then(|v| v.as_str());
                let ex_from_ws = existing_opts_val
                    .get("fromWorkspace")
                    .and_then(|v| v.as_bool());

                if ex_ns == Some(ns_str) && ex_file == Some(file_str) && ex_from_ws == Some(true) {
                    if let Some(existing_win) = app.get_webview_window(label) {
                        let _ = existing_win.show();
                        let _ = existing_win.set_focus();
                        if let Some(elem) = edit_elem {
                            let _ = existing_win.emit("EDIT_ELEMENT", elem);
                        } else {
                            let _ = existing_win.emit("SHOW_NOTIFICATION", "Model already loaded");
                        }
                        return Ok(());
                    }
                }
            }
        }
    }

    let win_id = format!(
        "win-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()
    );
    if let Some(opts) = options {
        if let Ok(mut map) = window_state.windows_options.lock() {
            map.insert(win_id.clone(), opts);
        }
    }

    build_editor_window(&app, &win_id, None)?;

    Ok(())
}

/// Creates an editor window. Restored windows get their saved geometry and are shown afterwards to avoid flicker.
pub fn build_editor_window(
    app: &AppHandle,
    label: &str,
    geometry: Option<WindowGeometry>,
) -> Result<WebviewWindow, String> {
    let is_dev = cfg!(debug_assertions);
    let webview_url = if is_dev {
        WebviewUrl::External("http://localhost:4200".parse().unwrap())
    } else {
        WebviewUrl::App("index.html".into())
    };

    let builder = WebviewWindowBuilder::new(app, label, webview_url)
        .title("Aspect Model Editor")
        .inner_size(1280.0, 800.0)
        .min_inner_size(800.0, 600.0)
        .resizable(true)
        .visible(geometry.is_none());

    #[cfg(not(target_os = "macos"))]
    let builder = if let Some(m) = app.menu() {
        builder.menu(m)
    } else {
        builder
    };

    let window = builder.build().map_err(|e| e.to_string())?;
    if let Some(geometry) = geometry {
        apply_window_geometry(&window, &geometry);
        let _ = window.show();
    }
    Ok(window)
}

/// Restores size, position (only when visible on a connected monitor), maximized and fullscreen state.
pub fn apply_window_geometry<R: Runtime>(window: &WebviewWindow<R>, geometry: &WindowGeometry) {
    let monitors: Vec<crate::session::MonitorArea> = window
        .available_monitors()
        .unwrap_or_default()
        .iter()
        .map(|m| crate::session::MonitorArea {
            x: m.position().x,
            y: m.position().y,
            width: m.size().width,
            height: m.size().height,
        })
        .collect();

    let _ = window.set_size(PhysicalSize::new(geometry.width, geometry.height));
    if geometry.is_visible_on(&monitors) {
        let _ = window.set_position(PhysicalPosition::new(geometry.x, geometry.y));
    } else {
        let _ = window.center();
    }
    if geometry.maximized {
        let _ = window.maximize();
    }
    if geometry.fullscreen {
        let _ = window.set_fullscreen(true);
    }
}

/// Reads the current window state; the bounds are only taken from a normal (not maximized/fullscreen) window.
pub fn capture_window_geometry<R: Runtime>(
    window: &tauri::Window<R>,
    session_state: &SessionState,
) {
    let label = window.label();
    let maximized = window.is_maximized().unwrap_or(false);
    let fullscreen = window.is_fullscreen().unwrap_or(false);
    let minimized = window.is_minimized().unwrap_or(false);
    if minimized {
        return;
    }

    if (maximized || fullscreen) && session_state.geometry_of(label).is_some() {
        session_state.set_window_mode(label, maximized, fullscreen);
        return;
    }

    if let (Ok(position), Ok(size)) = (window.outer_position(), window.inner_size()) {
        session_state.set_geometry(
            label,
            WindowGeometry {
                x: position.x,
                y: position.y,
                width: size.width,
                height: size.height,
                maximized,
                fullscreen,
            },
        );
    }
}

/// Number of editor windows (print preview windows are ignored).
fn editor_window_count(app: &AppHandle) -> usize {
    app.webview_windows()
        .keys()
        .filter(|label| !label.starts_with("print-"))
        .count()
}

#[tauri::command]
pub fn update_window_data(
    window_state: State<'_, AppWindowState>,
    window_label: String,
    options: serde_json::Value,
) -> Result<(), String> {
    let mut map = window_state
        .windows_options
        .lock()
        .map_err(|e| e.to_string())?;
    map.insert(window_label, options);
    Ok(())
}

#[tauri::command]
pub fn get_window_data(
    window_state: State<'_, AppWindowState>,
    window_label: String,
) -> Result<WindowData, String> {
    let map = window_state
        .windows_options
        .lock()
        .map_err(|e| e.to_string())?;
    let options = map.get(&window_label).cloned();
    Ok(WindowData {
        id: window_label,
        options,
    })
}

#[tauri::command]
pub fn is_first_window(app: AppHandle) -> bool {
    app.webview_windows().len() <= 1
}

/// Normal close of a window: the window is forgotten, unless it is the last one. Closing the last window quits
/// the application, so its models stay in the session and are reopened on the next start.
#[tauri::command]
pub fn close_window(
    app: AppHandle,
    window_state: State<'_, AppWindowState>,
    session_state: State<'_, SessionState>,
    window_label: String,
) -> Result<(), String> {
    if let Some(win) = app.get_webview_window(&window_label) {
        if editor_window_count(&app) > 1 {
            session_state.remove_window(&window_label);
        } else {
            session_state.flush();
        }
        if let Ok(mut map) = window_state.windows_options.lock() {
            map.remove(&window_label);
        }
        win.destroy().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Stores the saved workspace models which are open in a window (one entry per tab).
#[tauri::command]
pub fn update_session_models(
    app: AppHandle,
    session_state: State<'_, SessionState>,
    window_label: String,
    models: Vec<SessionModel>,
    active_index: usize,
) -> Result<(), String> {
    session_state.set_models(&window_label, models, active_index);
    if let Some(win) = app.get_webview_window(&window_label) {
        capture_window_geometry(&win.as_ref().window(), &session_state);
        session_state.flush();
    }
    Ok(())
}

#[tauri::command]
pub fn set_session_restore_enabled(session_state: State<'_, SessionState>, enabled: bool) {
    session_state.set_restore_on_startup(enabled);
}

#[tauri::command]
pub fn maximize_window(
    app: AppHandle,
    session_state: State<'_, SessionState>,
    window_label: String,
) -> Result<(), String> {
    // Restored windows keep their saved size and position.
    if session_state.is_restored(&window_label) {
        return Ok(());
    }
    if let Some(win) = app.get_webview_window(&window_label) {
        win.maximize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn show_context_menu(app: AppHandle, href: Option<String>) -> Result<(), String> {
    if let Some(link) = href {
        if let Some(state) = app.try_state::<ContextMenuState>() {
            if let Ok(mut lock) = state.active_href.lock() {
                *lock = Some(link.clone());
            }
        }

        let open_item = MenuItem::with_id(
            &app,
            "ctx_open",
            if link.starts_with("mailto:") {
                "Send email"
            } else {
                "Open in browser"
            },
            true,
            None::<&str>,
        )
        .map_err(|e| e.to_string())?;

        let copy_item =
            MenuItem::with_id(&app, "ctx_copy", "Copy link address", true, None::<&str>)
                .map_err(|e| e.to_string())?;

        let menu = Menu::with_items(&app, &[&open_item, &copy_item]).map_err(|e| e.to_string())?;

        if let Some(focused) = app
            .webview_windows()
            .into_values()
            .find(|w| w.is_focused().unwrap_or(false))
        {
            let _ = menu.popup(focused.as_ref().window().clone());
        }
    }
    Ok(())
}

#[tauri::command]
pub fn set_window_title(
    app: AppHandle,
    window_label: Option<String>,
    title: String,
) -> Result<(), String> {
    if let Some(ref label) = window_label {
        if let Some(win) = app.get_webview_window(label) {
            win.set_title(&title).map_err(|e| e.to_string())?;
            return Ok(());
        }
    }
    for win in app.webview_windows().values() {
        if win.is_focused().unwrap_or(false) {
            win.set_title(&title).map_err(|e| e.to_string())?;
            return Ok(());
        }
    }
    if let Some(main) = app.get_webview_window("main") {
        main.set_title(&title).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn update_menu_item(
    app: AppHandle,
    ids: Vec<String>,
    payload: serde_json::Value,
) -> Result<(), String> {
    crate::menu::update_menu_items(&app, &ids, &payload);
    Ok(())
}

#[tauri::command]
pub fn translate_menu_items(app: AppHandle, payload: serde_json::Value) -> Result<(), String> {
    if let Some(translation) = payload.get("translation") {
        crate::menu::translate_menu(&app, translation);
    } else {
        crate::menu::translate_menu(&app, &payload);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_open_in_vscode_or_default_handles_missing_file_path() {
        let res = open_in_vscode_or_default("invalid_proto://bad-path".to_string(), None);
        assert!(res.is_ok());
    }

    #[test]
    fn test_context_menu_state_stores_and_retrieves_href() {
        let state = ContextMenuState::new();
        assert!(state.active_href.lock().unwrap().is_none());

        *state.active_href.lock().unwrap() = Some("https://example.com/test".to_string());
        assert_eq!(
            state.active_href.lock().unwrap().as_deref(),
            Some("https://example.com/test")
        );
    }
}
