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

import {ChildProcess, spawn} from 'child_process';
import {BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';
import * as portfinder from 'portfinder';
import {extension, isWin} from './platform/platform';
import {execPromise} from './utils/promisify';
import {windowsManager} from './windows-manager';
// @ts-ignore
import projectVersion from '../package.json';
import {inDevMode} from './utils/mode';

/**
 * Array of spawned backend processes.
 * @type {ChildProcess[]}
 */
const processes: ChildProcess[] = [];

/**
 * Cleans up all spawned backend processes by attempting to kill them.
 * Uses platform-specific commands if processed. kill fails.
 * Logs the outcome for each process.
 *
 * @async
 * @returns {Promise<void>} Resolves when all processes are cleaned up.
 */
export async function cleanUpProcesses(): Promise<void> {
  for (const process of processes) {
    if (!process) continue;
    console.log(`Killing process: ${process.pid}...`);
    if (!process.kill()) {
      try {
        await execPromise(isWin ? `taskkill /F /PID ${process.pid}` : `kill -9 ${process.pid}`);
        console.log(`Killed process: ${process.pid}`);
      } catch (error) {
        console.error(`Failed to kill process ${process.pid}:`, error);
      }
    }
  }
}

/**
 * Creates and returns a splash window for loading screen.
 *
 * @async
 * @returns {Promise<BrowserWindow>} The splash BrowserWindow instance.
 */
async function _createSplashWindow(): Promise<BrowserWindow> {
  const splashWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
  });

  const splashScreenPath = inDevMode()
    ? path.join('.', 'electron-libs', 'loading-screen')
    : path.join(__dirname, '..', '..', '..', 'loading-screen');

  await splashWindow.loadFile(`${splashScreenPath}${path.sep}splash.html`).catch(() => console.warn('Splash screen not found.'));

  return splashWindow;
}

/**
 * Spawns the backend process and attaches listeners for output and errors.
 *
 * @param {number} port - The port to start the backend server on.
 * @param {BrowserWindow} splashWindow - The splash window to close when ready.
 * @returns {ChildProcess} The spawned backend process.
 */
function spawnBackendProcess(port: number, splashWindow: BrowserWindow): ChildProcess {
  const rootPath = path.join(__dirname, '..', '..', '..', 'backend', isWin ? 'signed_dir' : '');
  const execPath = path.join(rootPath, `ame-backend-${projectVersion.version}-${extension}`);
  const proc = spawn(execPath, [`-Dmicronaut.server.port=${port}`]);

  proc.stdout.on('data', (data: Buffer) => {
    const output = data.toString();
    console.log(output);
    if (output.includes('Server Running')) {
      console.log('AME Server Running');
      splashWindow?.close();
      windowsManager.createNewWindow();
    }
  });

  proc.on('close', (code: number) => {
    console.log(`Backend process exited with code ${code}`);
  });

  proc.on('error', (error: Error) => {
    console.error('Error starting backend process:', error);
  });

  return proc;
}

/**
 * Starts the backend service and opens the main application window.
 * Handles splash screen, port selection, and backend process spawning.
 *
 * @async
 * @returns {Promise<void>} Resolves when the service is started.
 */
export async function startService(): Promise<void> {
  const splashWindow = await _createSplashWindow();

  if (inDevMode()) {
    ipcMain.handle('get-backend-port', () => '9090');
    setTimeout(() => {
      splashWindow?.close();
      windowsManager.createNewWindow();
    }, 1000);
    return;
  }

  try {
    const port = await portfinder.getPortPromise({port: 30000, stopPort: 31000});
    ipcMain.handle('get-backend-port', () => port.toString());
    if (processes.length === 0) {
      const process = spawnBackendProcess(port, splashWindow);
      processes.push(process);
    }
  } catch (error) {
    console.error('Port between 30000 and 31000 are already in use.', error);
    alert('Port between 30000 and 31000 are already in use.');
  }
}
