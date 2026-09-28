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

use backend::{clean_up_backend, start_backend, BackendState};
use commands::*;
use tauri::{Emitter, Manager, RunEvent, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let backend_state = BackendState::new();
    let window_state = AppWindowState::new();
    let context_menu_state = ContextMenuState::new();

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .manage(backend_state)
        .manage(window_state)
        .manage(context_menu_state)
        .setup(|app| {
            if cfg!(debug_assertions) {
                let _ = app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                );
            }

            let app_menu = menu::build_menu(app.handle())?;
            app.set_menu(app_menu)?;

            let handle = app.handle().clone();
            let state = app.state::<BackendState>();
            start_backend(&handle, &state);

            Ok(())
        })
        .on_menu_event(|app, event| {
            menu::handle_menu_click(app, event.id().as_ref());
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.emit("IS_FILE_SAVED", window.label());
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_backend_port,
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
            maximize_window,
            show_context_menu,
            set_window_title,
            update_menu_item,
            translate_menu_items,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if let RunEvent::ExitRequested { .. } | RunEvent::Exit = event {
            let state = app_handle.state::<BackendState>();
            clean_up_backend(&state);
        }
    });
}
