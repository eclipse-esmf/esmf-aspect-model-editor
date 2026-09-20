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

use std::path::PathBuf;
use tauri::menu::{Menu, MenuItem, MenuItemKind, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tauri_plugin_dialog::DialogExt;

// ---------------------------------------------------------------------------
// Menu Construction Helpers
// ---------------------------------------------------------------------------

#[inline]
fn item<R: Runtime>(
    app: &AppHandle<R>,
    id: &'static str,
    text: &str,
    enabled: bool,
    shortcut: Option<&str>,
) -> Result<MenuItem<R>, tauri::Error> {
    MenuItem::with_id(app, id, text, enabled, shortcut)
}

fn build_new_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    let empty_model = item(app, "NEW_EMPTY_MODEL", "Empty Model", false, None)?;
    let load_file = item(app, "LOAD_FILE", "Load File...", true, Some("CmdOrCtrl+O"))?;
    let copy_paste = item(app, "LOAD_FROM_TEXT", "Copy Paste", true, None)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let examples_header = item(app, "EXAMPLES_HEADER", "Examples", false, None)?;
    let example_simple = item(app, "LOAD_DEFAULT_EXAMPLE", "SimpleAspect.ttl", true, None)?;
    let example_movement = item(app, "LOAD_MOVEMENT_EXAMPLE", "Movement.ttl", true, None)?;

    Submenu::with_id_and_items(
        app,
        "MENU_NEW",
        "New...",
        true,
        &[
            &empty_model,
            &load_file,
            &copy_paste,
            &sep,
            &examples_header,
            &example_simple,
            &example_movement,
        ],
    )
}

fn build_file_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    let new_submenu = build_new_submenu(app)?;
    let new_window = item(app, "NEW_WINDOW", "New Window", true, Some("CmdOrCtrl+Shift+N"))?;
    let import_model = item(app, "IMPORT_MODEL", "Import Model", true, None)?;
    let import_package = item(app, "IMPORT_PACKAGE", "Import Package", true, None)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let copy_clipboard = item(app, "COPY_TO_CLIPBOARD", "Copy to Clipboard", false, Some("CmdOrCtrl+Shift+C"))?;
    let save_workspace = item(app, "SAVE_TO_WORKSPACE", "Save to Workspace", false, Some("CmdOrCtrl+S"))?;
    let export_model = item(app, "EXPORT_MODEL", "Export Model", false, None)?;
    let export_package = item(app, "EXPORT_PACKAGE", "Export Package", true, None)?;

    Submenu::with_id_and_items(
        app,
        "MENU_FILE",
        "File",
        true,
        &[
            &new_submenu,
            &new_window,
            &import_model,
            &import_package,
            &sep,
            &copy_clipboard,
            &save_workspace,
            &export_model,
            &export_package,
        ],
    )
}

fn build_view_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    let toggle_toolbar = item(app, "SHOW_HIDE_TOOLBAR", "Toggle Toolbar", true, None)?;
    let toggle_minimap = item(app, "SHOW_HIDE_MINIMAP", "Toggle Minimap", true, None)?;

    let filter_none = item(app, "FILTER_MODEL_BY_NONE", "None", true, None)?;
    let filter_props = item(app, "FILTER_MODEL_BY_PROPERTIES", "Properties", true, None)?;
    let filter_submenu = Submenu::with_id_and_items(
        app,
        "MENU_FILTER_MODEL_BY",
        "Filter Model by",
        false,
        &[&filter_none, &filter_props],
    )?;

    let sep = PredefinedMenuItem::separator(app)?;
    let zoom_in = item(app, "ZOOM_IN", "Zoom in", false, Some("CmdOrCtrl+Plus"))?;
    let zoom_out = item(app, "ZOOM_OUT", "Zoom out", false, Some("CmdOrCtrl+-"))?;
    let zoom_fit = item(app, "ZOOM_TO_FIT", "Zoom to Fit", false, Some("CmdOrCtrl+9"))?;
    let zoom_actual = item(app, "ZOOM_TO_ACTUAL", "Zoom to 100%", false, Some("CmdOrCtrl+0"))?;

    Submenu::with_id_and_items(
        app,
        "MENU_VIEW",
        "View",
        true,
        &[
            &toggle_toolbar,
            &toggle_minimap,
            &filter_submenu,
            &sep,
            &zoom_in,
            &zoom_out,
            &zoom_fit,
            &zoom_actual,
        ],
    )
}

fn build_edit_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    let open_selected = item(app, "OPEN_SELECTED_ELEMENT", "Open selected element", false, None)?;
    let remove_selected = item(app, "REMOVE_SELECTED_ELEMENT", "Remove selected element", false, None)?;
    let collapse_expand = item(app, "COLLAPSE_EXPAND_MODEL", "Collapse/Expand Model", false, None)?;
    let format_model = item(app, "FORMAT_MODEL", "Format Model", false, Some("CmdOrCtrl+Shift+L"))?;
    let connect_elements = item(app, "CONNECT_ELEMENTS", "Connect selected elements", false, None)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let undo = PredefinedMenuItem::undo(app, None)?;
    let redo = PredefinedMenuItem::redo(app, None)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let cut = PredefinedMenuItem::cut(app, None)?;
    let copy = PredefinedMenuItem::copy(app, None)?;
    let paste = PredefinedMenuItem::paste(app, None)?;
    let select_all = PredefinedMenuItem::select_all(app, None)?;

    Submenu::with_id_and_items(
        app,
        "MENU_EDIT",
        "Edit",
        true,
        &[
            &open_selected,
            &remove_selected,
            &collapse_expand,
            &format_model,
            &connect_elements,
            &sep1,
            &undo,
            &redo,
            &sep2,
            &cut,
            &copy,
            &paste,
            &select_all,
        ],
    )
}

fn build_validate_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    let validate_model = item(app, "VALIDATE_MODEL", "Current Model", false, Some("CmdOrCtrl+Shift+V"))?;
    Submenu::with_id_and_items(app, "MENU_VALIDATE", "Validate", true, &[&validate_model])
}

fn build_generate_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    let gen_html = item(app, "GENERATE_HTML_DOCUMENTATION", "HTML Documentation", false, None)?;
    let gen_openapi = item(app, "GENERATE_OPEN_API_SPECIFICATION", "OpenAPI Specification", false, None)?;
    let gen_asyncapi = item(app, "GENERATE_ASYNC_API_SPECIFICATION", "AsyncAPI Specification", false, None)?;
    let gen_aasx = item(app, "GENERATE_AASX_XML", "AASX / XML", false, None)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let gen_json_sample = item(app, "GENERATE_JSON_PAYLOAD", "Sample JSON Payload", false, None)?;
    let gen_json_schema = item(app, "GENERATE_JSON_SCHEMA", "JSON Schema", false, None)?;

    Submenu::with_id_and_items(
        app,
        "MENU_GENERATE",
        "Generate",
        true,
        &[
            &gen_html,
            &gen_openapi,
            &gen_asyncapi,
            &gen_aasx,
            &sep,
            &gen_json_sample,
            &gen_json_schema,
        ],
    )
}

fn build_search_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    let search_elements = item(app, "SEARCH_ELEMENTS", "Elements", false, Some("CmdOrCtrl+F"))?;
    let search_files = item(app, "SEARCH_FILES", "Files", true, Some("CmdOrCtrl+Shift+F"))?;
    Submenu::with_id_and_items(app, "MENU_SEARCH", "Search", true, &[&search_elements, &search_files])
}

fn build_window_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    let minimize = PredefinedMenuItem::minimize(app, None)?;
    let close_win = PredefinedMenuItem::close_window(app, None)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let fullscreen = PredefinedMenuItem::fullscreen(app, None)?;

    Submenu::with_id_and_items(
        app,
        "MENU_WINDOW",
        "Window",
        true,
        &[&minimize, &close_win, &sep, &fullscreen],
    )
}

#[cfg(target_os = "macos")]
fn build_macos_app_submenu<R: Runtime>(app: &AppHandle<R>) -> Result<Submenu<R>, tauri::Error> {
    Submenu::with_items(
        app,
        "Aspect Model Editor",
        true,
        &[
            &PredefinedMenuItem::about(app, None, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::services(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::hide(app, None)?,
            &PredefinedMenuItem::hide_others(app, None)?,
            &PredefinedMenuItem::show_all(app, None)?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::quit(app, None)?,
        ],
    )
}

// ---------------------------------------------------------------------------
// Public Menu Builder
// ---------------------------------------------------------------------------

pub fn build_menu<R: Runtime>(app: &AppHandle<R>) -> Result<Menu<R>, tauri::Error> {
    let file = build_file_submenu(app)?;
    let view = build_view_submenu(app)?;
    let edit = build_edit_submenu(app)?;
    let validate = build_validate_submenu(app)?;
    let generate = build_generate_submenu(app)?;
    let search = build_search_submenu(app)?;
    let window = build_window_submenu(app)?;

    #[cfg(target_os = "macos")]
    {
        let macos_app = build_macos_app_submenu(app)?;
        Menu::with_items(
            app,
            &[&macos_app, &file, &view, &edit, &validate, &generate, &search, &window],
        )
    }

    #[cfg(not(target_os = "macos"))]
    {
        Menu::with_items(app, &[&file, &view, &edit, &validate, &generate, &search, &window])
    }
}

// ---------------------------------------------------------------------------
// Event Dispatching & Click Handlers
// ---------------------------------------------------------------------------

pub fn handle_menu_click<R: Runtime>(app: &AppHandle<R>, menu_id: &str) {
    match menu_id {
        "LOAD_FILE" => {
            open_file_dialog_and_emit(app, "Turtle Files", &["ttl"], "LOAD_FILE");
        }
        "IMPORT_MODEL" => {
            open_file_dialog_and_emit(app, "Turtle Files", &["ttl"], "IMPORT_TO_WORKSPACE");
        }
        "IMPORT_PACKAGE" => {
            open_file_dialog_and_emit(app, "ZIP Files", &["zip"], "IMPORT_NAMESPACES");
        }
        "LOAD_DEFAULT_EXAMPLE" => {
            load_example_and_emit(app, "SimpleAspect.ttl");
        }
        "LOAD_MOVEMENT_EXAMPLE" => {
            load_example_and_emit(app, "Movement.ttl");
        }
        "EXPORT_PACKAGE" => {
            emit_to_focused_or_app(app, "EXPORT_NAMESPACES", serde_json::Value::Null);
        }
        "FILTER_MODEL_BY_NONE" => {
            emit_to_focused_or_app(app, "FILTER_MODEL_BY", serde_json::json!("default"));
        }
        "FILTER_MODEL_BY_PROPERTIES" => {
            emit_to_focused_or_app(app, "FILTER_MODEL_BY", serde_json::json!("properties"));
        }
        other_id => {
            emit_to_focused_or_app(app, other_id, serde_json::Value::Null);
        }
    }
}

fn open_file_dialog_and_emit<R: Runtime>(
    app: &AppHandle<R>,
    filter_name: &'static str,
    extensions: &[&'static str],
    event: &'static str,
) {
    let app_handle = app.clone();
    app.dialog()
        .file()
        .add_filter(filter_name, extensions)
        .pick_file(move |file_path| {
            if let Some(path) = file_path {
                let path_buf = path.into_path().unwrap_or_default();
                if let Ok(content) = std::fs::read(&path_buf) {
                    let file_info = serde_json::json!({
                        "path": path_buf.to_string_lossy(),
                        "name": path_buf.file_name().map(|n| n.to_string_lossy()).unwrap_or_default(),
                        "content": content
                    });
                    emit_to_focused_or_app(&app_handle, event, file_info);
                }
            }
        });
}

fn load_example_and_emit<R: Runtime>(app: &AppHandle<R>, name: &str) {
    if let Some(path) = find_example_file(app, name) {
        if let Ok(content) = std::fs::read(&path) {
            let file_info = serde_json::json!({
                "path": path.to_string_lossy(),
                "name": name,
                "content": content
            });
            emit_to_focused_or_app(app, "LOAD_SPECIFIC_FILE", file_info);
        }
    }
}

fn emit_to_focused_or_app<R: Runtime, T: serde::Serialize + Clone>(app: &AppHandle<R>, event: &str, payload: T) {
    if let Some(focused) = app.webview_windows().into_values().find(|w| w.is_focused().unwrap_or(false)) {
        let _ = focused.emit(event, payload);
    } else {
        let _ = app.emit(event, payload);
    }
}

// ---------------------------------------------------------------------------
// Menu Mutation (Enable/Disable & Dynamic Translations)
// ---------------------------------------------------------------------------

fn find_menu_item_recursive<R: Runtime>(items: &[MenuItemKind<R>], target_id: &str) -> Option<MenuItemKind<R>> {
    for item in items {
        if item.id().as_ref() == target_id {
            return Some(item.clone());
        }
        if let MenuItemKind::Submenu(submenu) = item {
            if let Ok(children) = submenu.items() {
                if let Some(found) = find_menu_item_recursive(&children, target_id) {
                    return Some(found);
                }
            }
        }
    }
    None
}

pub fn get_menu_item_recursive<R: Runtime>(menu: &Menu<R>, target_id: &str) -> Option<MenuItemKind<R>> {
    let items = menu.items().ok()?;
    find_menu_item_recursive(&items, target_id)
}

fn get_all_active_menus<R: Runtime>(app: &AppHandle<R>) -> Vec<Menu<R>> {
    let mut menus: Vec<Menu<R>> = Vec::new();
    if let Some(m) = app.menu() {
        menus.push(m);
    }
    for win in app.webview_windows().into_values() {
        if let Some(m) = win.menu() {
            menus.push(m);
        }
    }
    menus
}

pub fn update_menu_items<R: Runtime>(app: &AppHandle<R>, ids: &[String], payload: &serde_json::Value) {
    let enabled_opt = payload.get("enabled").and_then(|v| v.as_bool());
    let menus = get_all_active_menus(app);

    for menu in &menus {
        for id in ids {
            if let Some(item_kind) = get_menu_item_recursive(menu, id) {
                if let Some(enabled) = enabled_opt {
                    match item_kind {
                        MenuItemKind::MenuItem(item) => {
                            let _ = item.set_enabled(enabled);
                        }
                        MenuItemKind::Submenu(sub) => {
                            let _ = sub.set_enabled(enabled);
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    if let Some(translation) = payload.get("translation") {
        translate_menu(app, translation);
    }
}

pub fn translate_menu<R: Runtime>(app: &AppHandle<R>, translation: &serde_json::Value) {
    let Some(menu_json) = translation.get("menu") else { return };

    let mut mappings: Vec<(&str, Option<&str>)> = Vec::new();

    // File
    if let Some(file) = menu_json.get("file") {
        mappings.push(("MENU_FILE", file.get("label").and_then(|v| v.as_str())));
        if let Some(new_sub) = file.get("new") {
            mappings.push(("MENU_NEW", new_sub.get("label").and_then(|v| v.as_str())));
            if let Some(sub) = new_sub.get("submenu") {
                mappings.push(("NEW_EMPTY_MODEL", sub.get("emptyModel").and_then(|v| v.as_str())));
                mappings.push(("LOAD_FILE", sub.get("loadFile").and_then(|v| v.as_str())));
                mappings.push(("LOAD_FROM_TEXT", sub.get("copyPaste").and_then(|v| v.as_str())));
                mappings.push(("EXAMPLES_HEADER", sub.get("examples").and_then(|v| v.as_str())));
            }
        }
        mappings.push(("NEW_WINDOW", file.get("newWindow").and_then(|v| v.as_str())));
        mappings.push(("IMPORT_MODEL", file.get("importModel").and_then(|v| v.as_str())));
        mappings.push(("IMPORT_PACKAGE", file.get("importPackage").and_then(|v| v.as_str())));
        mappings.push(("COPY_TO_CLIPBOARD", file.get("copyToClipboard").and_then(|v| v.as_str())));
        mappings.push(("SAVE_TO_WORKSPACE", file.get("saveToWorkspace").and_then(|v| v.as_str())));
        mappings.push(("EXPORT_MODEL", file.get("exportModel").and_then(|v| v.as_str())));
        mappings.push(("EXPORT_PACKAGE", file.get("exportPackage").and_then(|v| v.as_str())));
    }

    // View
    if let Some(view) = menu_json.get("view") {
        mappings.push(("MENU_VIEW", view.get("label").and_then(|v| v.as_str())));
        mappings.push(("SHOW_HIDE_TOOLBAR", view.get("toggleToolbar").and_then(|v| v.as_str())));
        mappings.push(("SHOW_HIDE_MINIMAP", view.get("toggleMinimap").and_then(|v| v.as_str())));
        if let Some(filter) = view.get("filter") {
            mappings.push(("MENU_FILTER_MODEL_BY", filter.get("label").and_then(|v| v.as_str())));
            if let Some(sub) = filter.get("submenu") {
                mappings.push(("FILTER_MODEL_BY_NONE", sub.get("none").and_then(|v| v.as_str())));
                mappings.push(("FILTER_MODEL_BY_PROPERTIES", sub.get("properties").and_then(|v| v.as_str())));
            }
        }
        mappings.push(("ZOOM_IN", view.get("zoomIn").and_then(|v| v.as_str())));
        mappings.push(("ZOOM_OUT", view.get("zoomOut").and_then(|v| v.as_str())));
        mappings.push(("ZOOM_TO_FIT", view.get("zoomToFit").and_then(|v| v.as_str())));
        mappings.push(("ZOOM_TO_ACTUAL", view.get("zoomTo100").and_then(|v| v.as_str())));
    }

    // Edit
    if let Some(edit) = menu_json.get("edit") {
        mappings.push(("MENU_EDIT", edit.get("label").and_then(|v| v.as_str())));
        mappings.push(("OPEN_SELECTED_ELEMENT", edit.get("openSelectedElement").and_then(|v| v.as_str())));
        mappings.push(("REMOVE_SELECTED_ELEMENT", edit.get("removeSelectedElement").and_then(|v| v.as_str())));
        mappings.push(("COLLAPSE_EXPAND_MODEL", edit.get("collapseExpandModel").and_then(|v| v.as_str())));
        mappings.push(("FORMAT_MODEL", edit.get("formatModel").and_then(|v| v.as_str())));
        mappings.push(("CONNECT_ELEMENTS", edit.get("connectSelectedElements").and_then(|v| v.as_str())));
    }

    // Validate
    if let Some(validate) = menu_json.get("validate") {
        mappings.push(("MENU_VALIDATE", validate.get("label").and_then(|v| v.as_str())));
        mappings.push(("VALIDATE_MODEL", validate.get("currentModel").and_then(|v| v.as_str())));
    }

    // Generate
    if let Some(gen) = menu_json.get("generate") {
        mappings.push(("MENU_GENERATE", gen.get("label").and_then(|v| v.as_str())));
        mappings.push(("GENERATE_HTML_DOCUMENTATION", gen.get("htmlDocumentation").and_then(|v| v.as_str())));
        mappings.push(("GENERATE_OPEN_API_SPECIFICATION", gen.get("openApiSpecification").and_then(|v| v.as_str())));
        mappings.push(("GENERATE_ASYNC_API_SPECIFICATION", gen.get("asyncApiSpecification").and_then(|v| v.as_str())));
        mappings.push(("GENERATE_AASX_XML", gen.get("aasxXml").and_then(|v| v.as_str())));
        mappings.push(("GENERATE_JSON_PAYLOAD", gen.get("sampleJsonPayload").and_then(|v| v.as_str())));
        mappings.push(("GENERATE_JSON_SCHEMA", gen.get("jsonSchema").and_then(|v| v.as_str())));
    }

    // Search
    if let Some(search) = menu_json.get("search") {
        mappings.push(("MENU_SEARCH", search.get("label").and_then(|v| v.as_str())));
        mappings.push(("SEARCH_ELEMENTS", search.get("elements").and_then(|v| v.as_str())));
        mappings.push(("SEARCH_FILES", search.get("files").and_then(|v| v.as_str())));
    }

    let menus = get_all_active_menus(app);
    for menu in &menus {
        for &(id, text_opt) in &mappings {
            if let Some(text) = text_opt {
                if let Some(item_kind) = get_menu_item_recursive(menu, id) {
                    match item_kind {
                        MenuItemKind::MenuItem(item) => {
                            let _ = item.set_text(text);
                        }
                        MenuItemKind::Submenu(sub) => {
                            let _ = sub.set_text(text);
                        }
                        _ => {}
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Resource Resolvers
// ---------------------------------------------------------------------------

fn find_example_file<R: Runtime>(app: &AppHandle<R>, name: &str) -> Option<PathBuf> {
    let resource_dir = app.path().resource_dir().unwrap_or_else(|_| PathBuf::from("."));
    let candidates = [
        PathBuf::from(format!("apps/ame/src/assets/aspect-models/com.examples/1.0.0/{}", name)),
        PathBuf::from(format!("../apps/ame/src/assets/aspect-models/com.examples/1.0.0/{}", name)),
        resource_dir.join(format!("default-models/{}", name)),
        resource_dir.join(format!("assets/aspect-models/com.examples/1.0.0/{}", name)),
    ];

    candidates.into_iter().find(|path| path.exists())
}
