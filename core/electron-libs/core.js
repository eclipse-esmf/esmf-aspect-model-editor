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

const {BrowserWindow} = require('electron');
const {spawn} = require('child_process');
const path = require('path');
const promises = require('./promisify');
const portfinder = require('portfinder');
const platformData = require('./os-checker');
const {windowsManager} = require('./windows-manager');
const projectVersion = require('../package.json').version;
const {inDevMode} = require('./consts');

/**
 * @type string[]
 */
const processes = [];

/**
 * @type BrowserWindow
 */
let mainWindow = null;
let splashWindow = null;

async function cleanUpProcesses() {
  for (const process of processes) {
    if (!process) continue;

    console.log(`Killing process: ${process.pid}...`);
    const success = process.kill();
    if (!success) {
      try {
        await promises.exec(platformData.isWin ? `taskkill /F /PID ${process.pid}` : `kill -9 ${process.pid}`);
        console.log(`Killed process: ${process.pid}`);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

function startService() {
  createSplashWindow();

  if (inDevMode()) {
    global.backendPort = 9091;
    setTimeout(function () {
      splashWindow.close();
      windowsManager.createWindow();
    }, 1000);
    return;
  }

  portfinder
    .getPortPromise({
      port: 30000,
      stopPort: 31000,
    })
    .then(port => {
      const rootPath = path.join(__dirname, '..', '..', '..', 'backend', platformData.isWin ? 'signed_dir' : '');

      if (processes.length === 0) {
        global.backendPort = port;
        const process = spawn(path.join(rootPath, `ame-backend-${projectVersion}-${platformData.extension}`), [`-Dserver.port=${port}`]);

        process.stdout.on('data', data => {
          if (data.includes(`Tomcat started on port(s): ${port}`)) {
            console.log(`Tomcat is now started on port ${port}`);
            splashWindow.close();
            windowsManager.createWindow();
          }
        });

        process.on('close', code => {
          // notify frontend
          console.log(`child process exited with code ${code}`);
        });

        process.on('error', error => {
          console.log('Error on opening Tomcat');
          console.log(error);
        });

        processes.push(process);
      }
    })
    .catch(error => {
      console.log(error);
      alert('Port between 30000 and 31000 are already in use.');
    });
}

function createSplashWindow() {
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

module.exports = {
  mainWindow,
  cleanUpProcesses,
  startService,
};
