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

/**
 * Disables console logging in production mode.
 */
if (inProdMode()) {
  console.log = () => {};
}

/**
 * Removes user tasks from Windows taskbar if running on Windows.
 */
if (isWin) app.setUserTasks([]);

/**
 * Handles Electron app 'ready' event.
 * Sets up global shortcut listeners, starts backend service, and activates window communication.
 *
 * @async
 * @returns {Promise<void>} Resolves when setup is complete.
 */
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

/**
 * Handles Electron app 'activate' event.
 * Creates a new window if none are open.
 */
const onActivate = (): void => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowsManager.createNewWindow();
  }
};

/**
 * Handles Electron app 'window-all-closed' event.
 * Quits the application.
 */
const onWindowAllClosed = (): void => {
  app.quit();
};

/**
 * Handles Electron app 'before-quit' event.
 * Cleans up backend processes before quitting.
 */
const onBeforeQuit = (): void => {
  cleanUpProcesses();
};

/**
 * Registers main Electron app event listeners.
 */
app.on('ready', onReady);
app.on('activate', onActivate);
app.on('window-all-closed', onWindowAllClosed);
app.on('before-quit', onBeforeQuit);
