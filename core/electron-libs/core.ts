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
import {BrowserWindow} from 'electron';
import * as path from 'path';
import * as portfinder from 'portfinder';
import {extension, isWin} from './platform/platform';
import {execPromise} from './utils/promisify';
import {windowsManager} from './windows-manager';
// @ts-ignore
import projectVersion from '../package.json';
import {inDevMode} from './utils/mode';

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
const processes: ChildProcess[] = [];

async function cleanUpProcesses(): Promise<void> {
  for (const process of processes) {
    if (!process) continue;

    console.log(`Killing process: ${process.pid}...`);
    const success = process.kill();
    if (!success) {
      try {
        await execPromise(isWin ? `taskkill /F /PID ${process.pid}` : `kill -9 ${process.pid}`);
        console.log(`Killed process: ${process.pid}`);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

function startService(): void {
  createSplashWindow();

  if (inDevMode()) {
    (global as any).backendPort = 9090;
    setTimeout(() => {
      splashWindow?.close();
      windowsManager.createNewWindow();
    }, 1000);
    return;
  }

  portfinder
    .getPortPromise({
      port: 30000,
      stopPort: 31000,
    })
    .then(port => {
      const rootPath = path.join(__dirname, '..', '..', '..', 'backend', isWin ? 'signed_dir' : '');

      if (processes.length === 0) {
        (global as any).backendPort = port;
        const proc = spawn(path.join(rootPath, `ame-backend-${projectVersion.version}-${extension}`), [`-Dmicronaut.server.port=${port}`]);

        proc.stdout.on('data', (data: Buffer) => {
          console.log(data.toString());
          if (data.includes(`Server Running`)) {
            console.log(`AME Server Running`);
            splashWindow?.close();
            windowsManager.createNewWindow();
          }
        });

        proc.on('close', (code: number) => {
          console.log(`child process exited with code ${code}`);
        });

        proc.on('error', (error: Error) => {
          console.log('Error on opening Tomcat');
          console.log(error);
        });

        processes.push(proc);
      }
    })
    .catch(error => {
      console.log(error);
      alert('Port between 30000 and 31000 are already in use.');
    });
}

function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
  });

  const splashScreenPath = inDevMode()
    ? path.join('.', 'electron-libs', 'loading-screen')
    : path.join(__dirname, '..', '..', '..', 'loading-screen');

  splashWindow.loadFile(`${splashScreenPath}${path.sep}splash.html`).catch(() => console.log('Splash screen not found.'));
}

export {cleanUpProcesses, mainWindow, startService};
