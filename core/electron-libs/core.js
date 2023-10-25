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

const {BrowserWindow} = require('electron');
const {spawn} = require('child_process');
const path = require('path');
const promises = require('./promisify');
const portfinder = require('portfinder');
const platformData = require('./os-checker').default;
const {windowsManager} = require('./windows-manager');

/**
 * @type string[]
 */
const processesIDs = [];

/**
 * @type BrowserWindow
 */
let mainWindow = null;

async function cleanUpProcesses() {
  for (const pid of processesIDs) {
    console.log(`Killing process: ${pid}...`);
    try {
      await promises.exec(`kill -9 ${pid}`);
      console.log(`Killed process: ${pid}`);
    } catch (error) {
      console.log(error);
    }
  }
}

function startService() {
  if (process.argv.includes('--dev')) {
    global.backendPort = 9091;
    windowsManager.createWindow();
    return;
  }

  portfinder
    .getPortPromise({
      port: 30000,
      stopPort: 31000,
    })
    .then(port => {
      const rootPath = path.join(__dirname, '..', '..', '..', 'backend');
      if (processesIDs.length === 0) {
        global.backendPort = port;
        const loader = spawn(path.join(rootPath, `ame-backend${platformData.extension}`), [`-Dserver.port=${port}`]);

        loader.stdout.on('data', data => {
          if (data.includes(`Tomcat started on port(s): ${port}`)) {
            console.log(`Tomcat is now started on port ${port}`);
            windowsManager.createWindow();
          }
        });

        loader.on('close', code => {
          // notify frontend
          console.log(`child process exited with code ${code}`);
        });

        loader.on('error', error => {
          console.log('Error on opening Tomcat');
          console.log(error);
        });

        processesIDs.push(loader.pid);
      }
    })
    .catch(error => {
      alert();
      console.log(error);
      alert('Port between 30000 and 31000 are already in use.');
    });
}

module.exports = {
  mainWindow,
  cleanUpProcesses,
  startService,
};
