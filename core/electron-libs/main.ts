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

import {app, BrowserWindow} from 'electron';
import {cleanUpProcesses, startService} from './core';
import {isWin} from './platform/platform';
import {registerGlobalShortcuts, unregisterGlobalShortcuts} from './shortcuts/index';
import {inProdMode} from './utils/mode';
import {windowsManager} from './windows-manager';

if (inProdMode()) {
  console.log = () => {};
}

if (isWin) app.setUserTasks([]);

const onReady = async (): Promise<void> => {
  try {
    app.on('browser-window-blur', unregisterGlobalShortcuts);
    app.on('browser-window-focus', registerGlobalShortcuts);
    await startService();
    windowsManager.activateCommunicationProtocol();
  } catch (error) {
    console.error('Failed to start service:', error);
  }
};

const onActivate = (): void => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowsManager.createNewWindow();
  }
};

const onWindowAllClosed = (): void => {
  app.quit();
};

const onBeforeQuit = (): void => {
  cleanUpProcesses();
};

app.on('ready', onReady);
app.on('activate', onActivate);
app.on('window-all-closed', onWindowAllClosed);
app.on('before-quit', onBeforeQuit);
