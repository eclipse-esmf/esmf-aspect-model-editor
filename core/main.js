/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

const {app, BrowserWindow, Menu} = require('electron');
const platformData = require('./electron-libs/os-checker');
const core = require('./electron-libs/core');
const {windowsManager} = require('./electron-libs/windows-manager');

if (require('electron-squirrel-startup')) process.exit();

if (!process.argv.includes('--dev')) {
  // Disable test logging on production
  console.log = () => {};
}

Menu.setApplicationMenu(null);

if (platformData.isWin) app.setUserTasks([]);

app.on('ready', () => {
  core.startService();
  windowsManager.activateCommunicationProtocol();
});

app.on('activate', () => {
  // Re-create window on MacOS when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    windowsManager.createWindow(null);
  }
});

app.on('window-all-closed', () => {
  // On MacOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (!platformData.isMac) {
    app.quit();
  }
});

app.on('before-quit', () => {
  core.cleanUpProcesses();
});
