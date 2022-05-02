/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
const electronLocalShortcut = require('electron-localshortcut');
const electronRemote = require('@electron/remote/main');
const promises = require('./promisify');
const platformData = require('./os-checker').default;

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

function createWindow() {
  const iconPathArray = ['..', 'apps', 'ame', 'src', 'assets', 'img', 'png', 'aspect-model-editor-targetsize-256.png'];
  const iconPath = path.join(__dirname, ...iconPathArray);

  mainWindow = new BrowserWindow({
    show: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  electronRemote.initialize();
  electronRemote.enable(mainWindow.webContents);

  if (process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:4200/').then(() => console.log('Dev mode launched'));
  } else {
    mainWindow.loadFile('./dist/apps/ame/index.html').then(() => console.log('Application successfully launched'));
  }

  mainWindow.maximize();
  mainWindow.show();
  mainWindow.removeMenu();
  mainWindow.on('closed', () => (mainWindow = null));

  electronLocalShortcut.register(mainWindow, 'CommandOrControl+F12', () => {
    mainWindow.webContents.openDevTools();
  });

  mainWindow.webContents.setWindowOpenHandler(() => {
    return {action: 'allow', overrideBrowserWindowOptions: {width: 1280, height: 720}};
  });

  return mainWindow;
}

function startService() {
  const rootPath = path.join(__dirname, '..', '..', '..', 'backend');
  if (processesIDs.length === 0) {
    const loader = spawn(path.join(rootPath, `ame-backend${platformData.extension}`));

    loader.stdout.on('data', data => {
      if (data.includes('Tomcat started on port(s): 9091')) {
        console.log('Tomcat is now started');
        createWindow();
      }
    });

    loader.on('close', code => {
      // notify frontend
      console.log(`child process exited with code ${code}`);
    });

    loader.on('error', error => {
      console.log('Error on opening Tomcat');
      console.log(error);
      cleanUpProcesses();
    });

    processesIDs.push(loader.pid);
  }
}

exports.default = {
  mainWindow,
  createWindow,
  cleanUpProcesses,
  startService,
};
