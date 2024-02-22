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

// @ts-check

const {app, globalShortcut, BrowserWindow, Menu, nativeTheme} = require('electron');
const platformData = require('./electron-libs/os-checker');
const core = require('./electron-libs/core');
const {windowsManager} = require('./electron-libs/windows-manager');
const {inProdMode} = require('./electron-libs/consts');
const {registerMacSpecificShortcuts, unregisterMacSpecificShortcuts} = require('./electron-libs/mac/shortcuts');

if (require('electron-squirrel-startup')) process.exit();

if (inProdMode()) {
  // Disable test logging on production
  console.log = () => {};
}

if (platformData.isWin) app.setUserTasks([]);

app.on('ready', () => {
  if (platformData.isMac) {
    app.on('browser-window-blur', unregisterMacSpecificShortcuts);
    app.on('browser-window-focus', registerMacSpecificShortcuts);
  }

  core.startService();
  windowsManager.activateCommunicationProtocol();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowsManager.createWindow(null);
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  core.cleanUpProcesses();
});

nativeTheme.themeSource = 'light';
