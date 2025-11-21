/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

const {app, globalShortcut, BrowserWindow, Menu, nativeTheme} = require('electron');
const platformData = require('./os-checker');

const COMMON_SHORTCUTS = [
  {key: 'CommandOrControl+W', action: win => win.close()},
  {key: 'CommandOrControl+M', action: win => win.minimize()},
  {key: 'CommandOrControl+Shift+M', action: win => win.maximize()},
  {key: 'CommandOrControl+Shift+F', action: win => win.setFullScreen(true)},
  {key: 'CommandOrControl+Shift+G', action: win => win.setFullScreen(false)},
  // Edit operations
  {key: 'CommandOrControl+X', action: win => win.webContents.cut()},
  {key: 'CommandOrControl+C', action: win => win.webContents.copy()},
  {key: 'CommandOrControl+V', action: win => win.webContents.paste()},
  {key: 'CommandOrControl+Z', action: win => win.webContents.undo()},
  {key: 'CommandOrControl+A', action: win => win.webContents.selectAll()},
  {key: 'CommandOrControl+R', action: win => win.reload()},
];

const MAC_SHORTCUTS = [
  {
    key: 'CommandOrControl+Q',
    action: () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        app.quit();
      }
    },
  },
  {
    key: 'Command+Option+I',
    action: () => {
      const win = BrowserWindow.getFocusedWindow();
      win?.webContents.openDevTools();
    },
  },
];

const DEVTOOLS_SHORTCUTS = [
  {
    key: 'Control+Shift+I',
    action: () => {
      const win = BrowserWindow.getFocusedWindow();
      win?.webContents.openDevTools();
    },
  },
];

function registerShortcut({key, action}) {
  globalShortcut.register(key, () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow && action.length > 0) {
      // For actions that rely on a window, do nothing if there is none
      return;
    }

    if (action.length > 0) {
      // action expects a window
      action(focusedWindow);
    } else {
      // action handles its own window lookup
      action();
    }
  });
}

function registerGlobalShortcuts() {
  COMMON_SHORTCUTS.forEach(registerShortcut);

  if (platformData.isMac) {
    MAC_SHORTCUTS.forEach(registerShortcut);
  }

  if (platformData.isWin || platformData.isLinux) {
    DEVTOOLS_SHORTCUTS.forEach(registerShortcut);
  }
}

function unregisterGlobalShortcuts() {
  globalShortcut.unregisterAll();
}

module.exports = {
  registerGlobalShortcuts,
  unregisterGlobalShortcuts,
};
