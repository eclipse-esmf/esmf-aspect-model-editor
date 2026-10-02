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
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::menu::{ContextMenu, Menu, MenuItem};
use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder};
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

    let is_dev = cfg!(debug_assertions);
    let webview_url = if is_dev {
        WebviewUrl::External("http://localhost:4200".parse().unwrap())
    } else {
        WebviewUrl::App("index.html".into())
    };

    let builder = WebviewWindowBuilder::new(&app, &win_id, webview_url)
        .title("Aspect Model Editor")
        .inner_size(1280.0, 800.0)
        .min_inner_size(800.0, 600.0)
        .resizable(true);

    #[cfg(not(target_os = "macos"))]
    let builder = if let Some(m) = app.menu() {
        builder.menu(m)
    } else {
        builder
    };

    builder.build().map_err(|e| e.to_string())?;

    Ok(())
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

#[tauri::command]
pub fn close_window(app: AppHandle, window_label: String) -> Result<(), String> {
    if let Some(win) = app.get_webview_window(&window_label) {
        win.destroy().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn maximize_window(app: AppHandle, window_label: String) -> Result<(), String> {
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
