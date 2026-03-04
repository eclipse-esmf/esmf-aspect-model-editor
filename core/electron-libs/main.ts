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

import {app, BrowserWindow, nativeTheme} from 'electron';
import {cleanUpProcesses, startService} from './core';
import {isWin} from './platform/platform';
import {registerGlobalShortcuts, unregisterGlobalShortcuts} from './shortcuts';
import {inProdMode} from './utils/mode';
import {windowsManager} from './windows-manager';

if (require('electron-squirrel-startup')) process.exit();

if (inProdMode()) {
  console.log = () => {};
}

if (isWin) app.setUserTasks([]);

app.on('ready', () => {
  app.on('browser-window-blur', unregisterGlobalShortcuts);
  app.on('browser-window-focus', registerGlobalShortcuts);

  startService();
  windowsManager.activateCommunicationProtocol();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowsManager.createNewWindow();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  cleanUpProcesses();
});

nativeTheme.themeSource = 'light';
