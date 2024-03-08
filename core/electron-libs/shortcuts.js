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
  const shortcutsGlobal = [
    {key: 'CommandOrControl+W', action: () => BrowserWindow.getFocusedWindow()?.close()},
    {key: 'CommandOrControl+M', action: () => BrowserWindow.getFocusedWindow()?.minimize()},
    {key: 'CommandOrControl+Shift+M', action: () => BrowserWindow.getFocusedWindow()?.maximize()},
    {key: 'CommandOrControl+Shift+F', action: () => BrowserWindow.getFocusedWindow()?.setFullScreen(true)},
    {key: 'CommandOrControl+Shift+G', action: () => BrowserWindow.getFocusedWindow()?.setFullScreen(false)},
  ];

  const shortcutsMac = [
    {key: 'CommandOrControl+Q', action: () => (BrowserWindow.getFocusedWindow() ? app.quit() : null)},
    {key: 'Command+Option+I', action: () => BrowserWindow.getFocusedWindow().webContents.openDevTools()},
    {key: 'CommandOrControl+R', action: () => BrowserWindow.getFocusedWindow()?.reload()},
    {
      key: 'CommandOrControl+Shift+R',
      action: () => BrowserWindow.getFocusedWindow()?.webContents.reloadIgnoringCache(),
    },
  ];

  const shortcutsWin = [{key: 'Control+Shift+I', action: () => BrowserWindow.getFocusedWindow().webContents.openDevTools()}];

  shortcutsGlobal.forEach(({key, action}) => {
    globalShortcut.register(key, action);
  });

  if (platformData.isMac) {
    shortcutsMac.forEach(({key, action}) => {
      globalShortcut.register(key, action);
    });
  }

  if (platformData.isWin) {
    shortcutsWin.forEach(({key, action}) => {
      globalShortcut.register(key, action);
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
