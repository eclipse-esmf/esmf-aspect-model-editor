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

pub mod backend;
pub mod commands;
pub mod menu;
pub mod session;

use backend::{clean_up_backend, start_backend, BackendState};
use commands::*;
use session::{SessionState, SessionWindow, SESSION_FILE_NAME};
use tauri::{Emitter, Manager, RunEvent, WindowEvent};

const SESSION_FLUSH_INTERVAL: std::time::Duration = std::time::Duration::from_secs(1);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let builder = tauri::Builder::default();

  // Must be registered first: a second launch (e.g. double-clicking the desktop icon again)
  // exits immediately and focuses the running instance instead of starting another backend.
  #[cfg(desktop)]
  let builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
    focus_main_window(app);
  }));

  let app = builder
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_process::init())
    .manage(BackendState::new())
    .manage(AppWindowState::new())
    .manage(ContextMenuState::new())
    .manage(SessionState::new())
    .setup(setup_app)
    .on_menu_event(|app, event| {
      // Native menu actions need the backend; ignore them until it is ready.
      if !app.state::<BackendState>().is_ready() {
        return;
      }
      menu::handle_menu_click(app, event.id().as_ref());
    })
    .on_window_event(|window, event| match event {
      WindowEvent::CloseRequested { api, .. } => {
        api.prevent_close();
        let _ = window.emit("IS_FILE_SAVED", window.label());
      }
      WindowEvent::Moved(_) | WindowEvent::Resized(_) => {
        capture_window_geometry(window, &window.state::<SessionState>());
      }
      _ => {}
    })
    .invoke_handler(tauri::generate_handler![
            get_backend_port,
            get_backend_status,
            retry_backend_start,
            quit_app,
            open_external_link,
            open_in_vscode_or_default,
            copy_to_clipboard,
            write_print_file,
            open_print_window,
            create_window,
            update_window_data,
            get_window_data,
            is_first_window,
            close_window,
            update_session_models,
            set_session_restore_enabled,
            maximize_window,
            show_context_menu,
            set_window_title,
            update_menu_item,
            translate_menu_items,
        ])
    .build(tauri::generate_context!())
    .expect("error while building Tauri application");

  app.run(handle_app_event);
}

fn setup_app(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
  init_logging(app);
  setup_menu(app);
  restore_session(app);

  start_backend(
    app.handle(),
    &app.state::<BackendState>(),
  );

  Ok(())
}

/// Reopens the windows of the last session with their models and geometry.
/// The frontend of each window checks whether the models still exist.
fn restore_session(app: &tauri::App) {
  let Ok(config_dir) = app.path().app_config_dir() else {
    return;
  };

  let session_state = app.state::<SessionState>();
  let windows = session_state.load(config_dir.join(SESSION_FILE_NAME)).restorable_windows();
  let stamp = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .map(|d| d.as_millis())
    .unwrap_or_default();

  let restored: Vec<SessionWindow> = windows
    .into_iter()
    .enumerate()
    .map(|(index, window)| SessionWindow {
      label: if index == 0 { "main".to_string() } else { format!("win-{}-{}", stamp, index) },
      ..window
    })
    .collect();
  session_state.replace_windows(restored.clone());

  let window_state = app.state::<AppWindowState>();
  for window in &restored {
    if let (Some(options), Ok(mut map)) = (window.startup_options(), window_state.windows_options.lock()) {
      map.insert(window.label.clone(), options);
    }

    if window.geometry.is_some() {
      session_state.mark_restored(&window.label);
    }

    if window.label == "main" {
      if let (Some(main), Some(geometry)) = (app.get_webview_window("main"), window.geometry) {
        apply_window_geometry(&main, &geometry);
      }
    } else if let Err(err) = build_editor_window(app.handle(), &window.label, window.geometry) {
      log::warn!("Unable to restore window {}: {}", window.label, err);
      session_state.remove_window(&window.label);
    }
  }

  let handle = app.handle().clone();
  std::thread::spawn(move || loop {
    std::thread::sleep(SESSION_FLUSH_INTERVAL);
    handle.state::<SessionState>().flush();
  });
}

fn init_logging(app: &tauri::App) {
  if cfg!(debug_assertions) {
    let _ = app.handle().plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    );
  }
}

fn setup_menu(app: &mut tauri::App) {
  let app_menu = menu::build_menu(app.handle())
    .expect("failed to build application menu");

  app.set_menu(app_menu)
    .expect("failed to set application menu");
}

fn focus_main_window(app: &tauri::AppHandle) {
  let window = app
    .get_webview_window("main")
    .or_else(|| app.webview_windows().into_values().next());

  if let Some(window) = window {
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
  }
}

fn handle_app_event(app_handle: &tauri::AppHandle, event: RunEvent) {
  #[cfg(target_os = "macos")]
  if let RunEvent::Reopen { .. } = event {
    focus_main_window(app_handle);
    return;
  }

  if matches!(event, RunEvent::ExitRequested { .. } | RunEvent::Exit) {
    app_handle.state::<SessionState>().flush();
    clean_up_backend(&app_handle.state::<BackendState>());
  }
}
