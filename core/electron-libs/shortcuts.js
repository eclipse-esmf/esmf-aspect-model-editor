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

function registerGlobalShortcuts() {
  // These shortcuts are already cross-platform
  const shortcuts = [
    {key: 'CommandOrControl+Q', action: () => (BrowserWindow.getFocusedWindow() ? app.quit() : null)},
    {key: 'CommandOrControl+W', action: () => BrowserWindow.getFocusedWindow()?.close()},
    {key: 'CommandOrControl+M', action: () => BrowserWindow.getFocusedWindow()?.minimize()},
    {key: 'CommandOrControl+R', action: () => BrowserWindow.getFocusedWindow()?.reload()},
    {
      key: 'CommandOrControl+Shift+R',
      action: () => BrowserWindow.getFocusedWindow()?.webContents.reloadIgnoringCache(),
    },
    {key: 'CommandOrControl+Shift+M', action: () => BrowserWindow.getFocusedWindow()?.maximize()},
    {key: 'CommandOrControl+Shift+F', action: () => BrowserWindow.getFocusedWindow()?.setFullScreen(true)},
    {key: 'CommandOrControl+Shift+G', action: () => BrowserWindow.getFocusedWindow()?.setFullScreen(false)},
  ];

  shortcuts.forEach(({key, action}) => {
    globalShortcut.register(key, action);
  });

  if (platformData.isWin || platformData.isLinux) {
    globalShortcut.register('Control+Shift+I', () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        focusedWindow.webContents.openDevTools();
      }
    });
  }

  if (platformData.isMac) {
    globalShortcut.register('Command+Option+I', () => {
      if (BrowserWindow.getFocusedWindow()) {
        BrowserWindow.getFocusedWindow().webContents.openDevTools();
      }
    });
  }
}

function unregisterGlobalShortcuts() {
  globalShortcut.unregisterAll();
}

module.exports = {
  registerGlobalShortcuts,
  unregisterGlobalShortcuts,
};
