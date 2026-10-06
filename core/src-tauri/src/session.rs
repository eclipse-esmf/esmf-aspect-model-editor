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

//! Session persistence: remembers which Aspect Models are open in which window and how the windows look.
//!
//! The session file is written whenever the open models change, so it always reflects the last known state.
//! Closing a window normally removes it from the session. Quitting, a crash or a system shutdown keep the
//! entries, which are restored on the next start.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;

pub const SESSION_FILE_NAME: &str = "session.json";
pub const SESSION_VERSION: u32 = 1;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionModel {
    pub namespace: String,
    pub file: String,
    pub aspect_model_urn: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowGeometry {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    #[serde(default)]
    pub maximized: bool,
    #[serde(default)]
    pub fullscreen: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MonitorArea {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl WindowGeometry {
    /// A window is only restored at its position when its title bar area is visible on one of the monitors,
    /// otherwise it could end up unreachable after a monitor was disconnected.
    pub fn is_visible_on(&self, monitors: &[MonitorArea]) -> bool {
        const MIN_VISIBLE: i64 = 50;
        let (left, top) = (self.x as i64, self.y as i64);
        let right = left + self.width as i64;
        let title_bottom = top + MIN_VISIBLE;

        monitors.iter().any(|m| {
            let (m_left, m_top) = (m.x as i64, m.y as i64);
            let m_right = m_left + m.width as i64;
            let m_bottom = m_top + m.height as i64;
            let overlap_x = right.min(m_right) - left.max(m_left);
            let overlap_y = title_bottom.min(m_bottom) - top.max(m_top);
            overlap_x >= MIN_VISIBLE && overlap_y > 0
        })
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionWindow {
    pub label: String,
    #[serde(default)]
    pub models: Vec<SessionModel>,
    #[serde(default)]
    pub active_index: usize,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub geometry: Option<WindowGeometry>,
}

impl SessionWindow {
    pub fn active_model(&self) -> Option<&SessionModel> {
        self.models
            .get(self.active_index)
            .or_else(|| self.models.first())
    }

    /// Window options handed to the frontend of a restored window.
    pub fn startup_options(&self) -> Option<serde_json::Value> {
        let active = self.active_model()?;
        Some(serde_json::json!({
            "namespace": active.namespace,
            "file": active.file,
            "fromWorkspace": true,
            "aspectModelUrn": active.aspect_model_urn,
            "session": {
                "models": self.models,
                "activeIndex": self.active_index.min(self.models.len() - 1),
            },
        }))
    }
}

/// The workspace models which are open in one window. Sent to all windows, so a window knows what the others show.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenWindowModels {
    pub label: String,
    pub models: Vec<SessionModel>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionData {
    pub version: u32,
    #[serde(default = "default_true")]
    pub restore_on_startup: bool,
    #[serde(default)]
    pub windows: Vec<SessionWindow>,
}

fn default_true() -> bool {
    true
}

impl Default for SessionData {
    fn default() -> Self {
        Self {
            version: SESSION_VERSION,
            restore_on_startup: true,
            windows: Vec::new(),
        }
    }
}

impl SessionData {
    fn window_mut(&mut self, label: &str) -> &mut SessionWindow {
        if let Some(index) = self.windows.iter().position(|w| w.label == label) {
            return &mut self.windows[index];
        }
        self.windows.push(SessionWindow {
            label: label.to_string(),
            models: Vec::new(),
            active_index: 0,
            geometry: None,
        });
        self.windows.last_mut().unwrap()
    }

    /// Replaces the models of a window. Returns true when something changed.
    pub fn set_models(
        &mut self,
        label: &str,
        models: Vec<SessionModel>,
        active_index: usize,
    ) -> bool {
        let active_index = if models.is_empty() {
            0
        } else {
            active_index.min(models.len() - 1)
        };
        let window = self.window_mut(label);
        if window.models == models && window.active_index == active_index {
            return false;
        }
        window.models = models;
        window.active_index = active_index;
        true
    }

    /// Updates the geometry of a window which is part of the session. Returns true when something changed.
    pub fn set_geometry(&mut self, label: &str, geometry: WindowGeometry) -> bool {
        match self.windows.iter_mut().find(|w| w.label == label) {
            Some(window) if window.geometry != Some(geometry) => {
                window.geometry = Some(geometry);
                true
            }
            _ => false,
        }
    }

    /// Updates only the maximized/fullscreen flags, keeping the last normal bounds.
    pub fn set_window_mode(&mut self, label: &str, maximized: bool, fullscreen: bool) -> bool {
        match self.windows.iter_mut().find(|w| w.label == label) {
            Some(SessionWindow {
                geometry: Some(geometry),
                ..
            }) if geometry.maximized != maximized || geometry.fullscreen != fullscreen => {
                geometry.maximized = maximized;
                geometry.fullscreen = fullscreen;
                true
            }
            _ => false,
        }
    }

    pub fn geometry_of(&self, label: &str) -> Option<WindowGeometry> {
        self.windows
            .iter()
            .find(|w| w.label == label)
            .and_then(|w| w.geometry)
    }

    pub fn remove_window(&mut self, label: &str) -> bool {
        let before = self.windows.len();
        self.windows.retain(|w| w.label != label);
        before != self.windows.len()
    }

    /// The workspace models of all windows which show at least one, independent of the restore setting.
    pub fn open_models(&self) -> Vec<OpenWindowModels> {
        self.windows
            .iter()
            .filter(|w| !w.models.is_empty())
            .map(|w| OpenWindowModels {
                label: w.label.clone(),
                models: w.models.clone(),
            })
            .collect()
    }

    /// Windows that should be reopened: only windows with at least one saved model.
    pub fn restorable_windows(&self) -> Vec<SessionWindow> {
        if !self.restore_on_startup {
            return Vec::new();
        }
        self.windows
            .iter()
            .filter(|w| !w.models.is_empty())
            .cloned()
            .collect()
    }
}

/// Reads the session file. A missing or unreadable file results in an empty session.
pub fn read_session(path: &Path) -> SessionData {
    let Ok(content) = fs::read_to_string(path) else {
        return SessionData::default();
    };
    match serde_json::from_str::<SessionData>(&content) {
        Ok(data) if data.version <= SESSION_VERSION => data,
        Ok(_) => SessionData::default(),
        Err(err) => {
            log::warn!(
                "Ignoring unreadable session file {}: {}",
                path.display(),
                err
            );
            SessionData::default()
        }
    }
}

/// Writes the session atomically (temporary file + rename), so a crash while writing never leaves a broken file.
pub fn write_session(path: &Path, data: &SessionData) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    let tmp_path = path.with_extension("json.tmp");
    fs::write(&tmp_path, json).map_err(|e| e.to_string())?;
    fs::rename(&tmp_path, path).map_err(|e| e.to_string())
}

/// Single writer for the session file.
pub struct SessionState {
    path: Mutex<Option<PathBuf>>,
    data: Mutex<SessionData>,
    /// Labels of windows whose geometry was restored; they must not be maximized on load.
    restored_labels: Mutex<Vec<String>>,
    /// Geometry changes are written lazily to avoid a file write for every move/resize event.
    geometry_dirty: AtomicBool,
}

impl SessionState {
    pub fn new() -> Self {
        Self {
            path: Mutex::new(None),
            data: Mutex::new(SessionData::default()),
            restored_labels: Mutex::new(Vec::new()),
            geometry_dirty: AtomicBool::new(false),
        }
    }

    pub fn load(&self, path: PathBuf) -> SessionData {
        let data = read_session(&path);
        *self.data.lock().unwrap() = data.clone();
        *self.path.lock().unwrap() = Some(path);
        data
    }

    fn persist(&self, data: &SessionData) {
        if let Some(path) = self.path.lock().unwrap().as_ref() {
            if let Err(err) = write_session(path, data) {
                log::warn!("Unable to write session file: {}", err);
            }
        }
    }

    fn update(&self, change: impl FnOnce(&mut SessionData) -> bool) {
        let mut data = self.data.lock().unwrap();
        if change(&mut data) {
            self.geometry_dirty.store(false, Ordering::SeqCst);
            self.persist(&data);
        }
    }

    pub fn snapshot(&self) -> SessionData {
        self.data.lock().unwrap().clone()
    }

    pub fn set_models(&self, label: &str, models: Vec<SessionModel>, active_index: usize) {
        self.update(|data| data.set_models(label, models, active_index));
    }

    pub fn remove_window(&self, label: &str) {
        self.update(|data| data.remove_window(label));
    }

    pub fn open_models(&self) -> Vec<OpenWindowModels> {
        self.data.lock().unwrap().open_models()
    }

    pub fn set_restore_on_startup(&self, enabled: bool) {
        self.update(|data| {
            let changed = data.restore_on_startup != enabled;
            data.restore_on_startup = enabled;
            changed
        });
    }

    /// Replaces all windows, e.g. with the restored windows and their new labels.
    pub fn replace_windows(&self, windows: Vec<SessionWindow>) {
        self.update(|data| {
            let changed = data.windows != windows;
            data.windows = windows;
            changed
        });
    }

    pub fn set_geometry(&self, label: &str, geometry: WindowGeometry) {
        let mut data = self.data.lock().unwrap();
        if data.set_geometry(label, geometry) {
            self.geometry_dirty.store(true, Ordering::SeqCst);
        }
    }

    pub fn set_window_mode(&self, label: &str, maximized: bool, fullscreen: bool) {
        let mut data = self.data.lock().unwrap();
        if data.set_window_mode(label, maximized, fullscreen) {
            self.geometry_dirty.store(true, Ordering::SeqCst);
        }
    }

    pub fn geometry_of(&self, label: &str) -> Option<WindowGeometry> {
        self.data.lock().unwrap().geometry_of(label)
    }

    /// Writes pending geometry changes. Called periodically and before the application exits.
    pub fn flush(&self) {
        if self.geometry_dirty.swap(false, Ordering::SeqCst) {
            let data = self.data.lock().unwrap();
            self.persist(&data);
        }
    }

    pub fn mark_restored(&self, label: &str) {
        self.restored_labels.lock().unwrap().push(label.to_string());
    }

    pub fn is_restored(&self, label: &str) -> bool {
        self.restored_labels
            .lock()
            .unwrap()
            .iter()
            .any(|l| l == label)
    }
}

impl Default for SessionState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn model(name: &str) -> SessionModel {
        SessionModel {
            namespace: "org.example:1.0.0".to_string(),
            file: format!("{}.ttl", name),
            aspect_model_urn: format!("urn:samm:org.example:1.0.0#{}", name),
        }
    }

    fn geometry(x: i32, y: i32) -> WindowGeometry {
        WindowGeometry {
            x,
            y,
            width: 800,
            height: 600,
            maximized: false,
            fullscreen: false,
        }
    }

    fn temp_file(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "ame-session-test-{}-{}",
            name,
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        dir.join(SESSION_FILE_NAME)
    }

    #[test]
    fn set_models_creates_and_updates_a_window() {
        let mut data = SessionData::default();
        assert!(data.set_models("main", vec![model("A"), model("B")], 1));
        assert!(!data.set_models("main", vec![model("A"), model("B")], 1));
        assert_eq!(data.windows.len(), 1);
        assert_eq!(data.windows[0].active_model(), Some(&model("B")));

        assert!(data.set_models("main", vec![model("A")], 5));
        assert_eq!(data.windows[0].active_index, 0);
    }

    #[test]
    fn open_models_lists_every_window_with_models_even_without_restore() {
        let mut data = SessionData::default();
        data.restore_on_startup = false;
        data.set_models("main", vec![model("A")], 0);
        data.set_models("win-1", vec![], 0);
        data.set_models("win-2", vec![model("B"), model("C")], 1);

        let open = data.open_models();

        assert_eq!(
            open,
            vec![
                OpenWindowModels {
                    label: "main".to_string(),
                    models: vec![model("A")]
                },
                OpenWindowModels {
                    label: "win-2".to_string(),
                    models: vec![model("B"), model("C")]
                },
            ]
        );
        assert!(data.restorable_windows().is_empty());

        data.remove_window("win-2");
        assert_eq!(data.open_models().len(), 1);
    }

    #[test]
    fn open_models_are_serialized_in_camel_case() {
        let json = serde_json::to_value(OpenWindowModels {
            label: "main".to_string(),
            models: vec![model("A")],
        })
        .unwrap();

        assert_eq!(json["label"], "main");
        assert_eq!(json["models"][0]["namespace"], "org.example:1.0.0");
        assert_eq!(json["models"][0]["file"], "A.ttl");
        assert_eq!(
            json["models"][0]["aspectModelUrn"],
            "urn:samm:org.example:1.0.0#A"
        );
    }

    #[test]
    fn closing_a_window_removes_it_but_others_stay() {
        let mut data = SessionData::default();
        data.set_models("main", vec![model("A")], 0);
        data.set_models("win-1", vec![model("B")], 0);
        data.set_models("win-2", vec![model("C")], 0);

        assert!(data.remove_window("win-2"));
        assert!(!data.remove_window("win-2"));
        let labels: Vec<_> = data.windows.iter().map(|w| w.label.as_str()).collect();
        assert_eq!(labels, vec!["main", "win-1"]);
    }

    #[test]
    fn only_windows_with_models_are_restorable() {
        let mut data = SessionData::default();
        data.set_models("main", vec![model("A")], 0);
        data.set_models("win-1", vec![], 0);
        assert_eq!(data.restorable_windows().len(), 1);

        data.restore_on_startup = false;
        assert!(data.restorable_windows().is_empty());
    }

    #[test]
    fn geometry_is_only_tracked_for_session_windows() {
        let mut data = SessionData::default();
        assert!(!data.set_geometry("main", geometry(10, 10)));

        data.set_models("main", vec![model("A")], 0);
        assert!(data.set_geometry("main", geometry(10, 10)));
        assert!(!data.set_geometry("main", geometry(10, 10)));
        assert!(data.set_window_mode("main", true, false));
        let stored = data.geometry_of("main").unwrap();
        assert_eq!((stored.x, stored.width, stored.maximized), (10, 800, true));
    }

    #[test]
    fn startup_options_point_to_the_active_model() {
        let mut data = SessionData::default();
        data.set_models("main", vec![model("A"), model("B")], 1);
        let options = data.windows[0].startup_options().unwrap();

        assert_eq!(options["file"], "B.ttl");
        assert_eq!(options["aspectModelUrn"], "urn:samm:org.example:1.0.0#B");
        assert_eq!(options["fromWorkspace"], true);
        assert_eq!(options["session"]["activeIndex"], 1);
        assert_eq!(
            options["session"]["models"][0]["aspectModelUrn"],
            "urn:samm:org.example:1.0.0#A"
        );
    }

    #[test]
    fn visibility_check_rejects_windows_outside_of_all_monitors() {
        let monitors = [MonitorArea {
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
        }];
        assert!(geometry(100, 100).is_visible_on(&monitors));
        assert!(geometry(-700, 100).is_visible_on(&monitors));
        assert!(!geometry(2500, 100).is_visible_on(&monitors));
        assert!(!geometry(100, 1200).is_visible_on(&monitors));
        assert!(!geometry(100, 100).is_visible_on(&[]));
    }

    #[test]
    fn session_survives_a_write_read_cycle() {
        let path = temp_file("cycle");
        let mut data = SessionData::default();
        data.set_models("main", vec![model("A"), model("B")], 0);
        data.set_geometry("main", geometry(100, 100));

        write_session(&path, &data).unwrap();
        assert_eq!(read_session(&path), data);
        assert!(!path.with_extension("json.tmp").exists());

        let _ = fs::remove_dir_all(path.parent().unwrap());
    }

    #[test]
    fn missing_or_corrupt_files_result_in_an_empty_session() {
        let path = temp_file("corrupt");
        assert_eq!(read_session(&path), SessionData::default());

        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, "{ not json").unwrap();
        assert_eq!(read_session(&path), SessionData::default());

        fs::write(&path, r#"{"version": 99, "windows": []}"#).unwrap();
        assert_eq!(read_session(&path), SessionData::default());

        let _ = fs::remove_dir_all(path.parent().unwrap());
    }

    #[test]
    fn session_state_writes_model_changes_immediately_and_geometry_on_flush() {
        let path = temp_file("state");
        let state = SessionState::new();
        state.load(path.clone());

        state.set_models("main", vec![model("A")], 0);
        assert_eq!(read_session(&path).windows[0].models, vec![model("A")]);

        state.set_geometry("main", geometry(42, 24));
        assert_eq!(read_session(&path).windows[0].geometry, None);
        state.flush();
        assert_eq!(
            read_session(&path).windows[0].geometry,
            Some(geometry(42, 24))
        );

        state.remove_window("main");
        assert!(read_session(&path).windows.is_empty());

        state.set_restore_on_startup(false);
        assert!(!read_session(&path).restore_on_startup);

        let _ = fs::remove_dir_all(path.parent().unwrap());
    }

    #[test]
    fn a_crash_keeps_the_models_of_all_open_windows() {
        let path = temp_file("crash");
        {
            let state = SessionState::new();
            state.load(path.clone());
            state.set_models("main", vec![model("A")], 0);
            state.set_models("win-2", vec![model("B")], 0);
            state.set_models("win-3", vec![model("C")], 0);
            // C is closed regularly, A and B are still open when the application dies without any exit event.
            state.remove_window("win-3");
        }

        let restorable = read_session(&path).restorable_windows();
        let models: Vec<_> = restorable.iter().flat_map(|w| w.models.clone()).collect();
        assert_eq!(models, vec![model("A"), model("B")]);

        let _ = fs::remove_dir_all(path.parent().unwrap());
    }

    #[test]
    fn closing_the_last_tab_of_a_window_is_not_restored() {
        let mut data = SessionData::default();
        data.set_models("main", vec![model("A")], 0);
        data.set_models("main", vec![], 0);
        assert!(data.restorable_windows().is_empty());
    }

    #[test]
    fn nothing_is_restored_when_restoring_is_disabled() {
        let path = temp_file("disabled");
        let state = SessionState::new();
        state.load(path.clone());
        state.set_models("main", vec![model("A")], 0);
        state.set_restore_on_startup(false);

        let data = read_session(&path);
        assert!(data.restorable_windows().is_empty());
        // The models are still known, so enabling it again restores them.
        state.set_restore_on_startup(true);
        assert_eq!(read_session(&path).restorable_windows().len(), 1);

        let _ = fs::remove_dir_all(path.parent().unwrap());
    }

    #[test]
    fn replace_windows_drops_windows_which_are_not_restored() {
        let path = temp_file("replace");
        let state = SessionState::new();
        state.load(path.clone());
        state.set_models("win-1", vec![model("A")], 0);
        state.set_models("win-2", vec![], 0);

        let mut restored = state.snapshot().restorable_windows();
        restored[0].label = "main".to_string();
        state.replace_windows(restored);

        let windows = read_session(&path).windows;
        assert_eq!(windows.len(), 1);
        assert_eq!(windows[0].label, "main");
        assert_eq!(windows[0].models, vec![model("A")]);

        let _ = fs::remove_dir_all(path.parent().unwrap());
    }

    #[test]
    fn restored_labels_are_tracked() {
        let state = SessionState::new();
        assert!(!state.is_restored("main"));
        state.mark_restored("main");
        assert!(state.is_restored("main"));
    }
}
