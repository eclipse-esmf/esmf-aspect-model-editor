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

/** @typedef {{namespace: string, file: string, editElement?: string, fromWorkspace?: boolean}} WindowOptions */
/** @typedef {{id: string, window: BrowserWindow, options: WindowOptions | null}} WindowInfo */

const {BrowserWindow, ipcMain} = require('electron');
const electronRemote = require('@electron/remote/main');
const path = require('path');
const electronLocalShortcut = require('electron-localshortcut');
const {
  REQUEST_MAXIMIZE_WINDOW,
  REQUEST_CREATE_WINDOW,
  REQUEST_IS_FIRST_WINDOW,
  RESPONSE_IS_FIRST_WINDOW,
  REQUEST_STARTUP_DATA,
  RESPONSE_STARTUP_DATA,
  REQUEST_IS_FILE_SAVED,
  REQUEST_CLOSE_WINDOW,
  REQUEST_SHOW_NOTIFICATION,
  REQUEST_UPDATE_DATA,
  REQUEST_EDIT_ELEMENT,
  SIGNAL_REFRESH_WORKSPACE,
  REQUEST_REFRESH_WORKSPACE,
} = require('./events');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class WindowsManager {
  #windowConfig = {
    show: false,
    icon: this.#getIcon(),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  };

  /** @type {WindowInfo[]} */
  activeWindows = [];

  activateCommunicationProtocol() {
    ipcMain.on(REQUEST_CREATE_WINDOW, (e, options) => {
      this.createWindow(options);
    });

    // updates loaded file data with new loaded one or with new file data
    ipcMain.on(REQUEST_UPDATE_DATA, (event, windowId, options) => {
      const windowInfo = this.activeWindows.find(windowInfo => windowInfo.id === windowId);
      if (!windowInfo) return;
      console.log(`UPDATED: \x1b[36m${windowId}\x1b[0m with \x1b[36m${options.namespace} | ${options.file}\x1b[0m`);
      windowInfo.options = options;
    });

    // maximizes window if it exists
    ipcMain.on(REQUEST_MAXIMIZE_WINDOW, (event, windowId) => {
      const window = this.activeWindows.find(windowInfo => windowInfo.id === windowId)?.window;
      if (window) {
        window.maximize();
      }
    });

    // checks to see if the is only one window opened
    ipcMain.on(REQUEST_IS_FIRST_WINDOW, event => {
      event.sender.send(RESPONSE_IS_FIRST_WINDOW, this.activeWindows.length <= 1);
    });

    // closes window by force
    ipcMain.on(REQUEST_CLOSE_WINDOW, (event, windowId) => {
      const win = this.activeWindows.find(windowInfo => windowId === windowInfo.id)?.window;
      if (!win) {
        return;
      }

      win.destroy();
    });

    ipcMain.on(SIGNAL_REFRESH_WORKSPACE, (_, windowId) => {
      const otherWindows = this.activeWindows.filter(({id}) => id !== windowId);
      for (const {window} of otherWindows) {
        window.webContents.send(REQUEST_REFRESH_WORKSPACE);
      }
    });
  }

  /** @param {WindowOptions | null} options */
  createWindow(options) {
    const createdWindow = options
      ? this.activeWindows.find(
          winInfo =>
            options.namespace === winInfo.options?.namespace && winInfo.options?.file === options.file && winInfo.options?.fromWorkspace
        )
      : null;

    if (createdWindow) {
      createdWindow.window.show();
      createdWindow.window.focus();

      if (options?.editElement) {
        createdWindow.window.webContents.send(REQUEST_EDIT_ELEMENT, options.editElement);
      } else {
        createdWindow.window.webContents.send(REQUEST_SHOW_NOTIFICATION, 'Model already loaded');
      }
      return;
    }

    const newWindow = new BrowserWindow(this.#windowConfig);

    /** @type {WindowInfo} */
    const windowInfo = {
      id: uuid(),
      window: newWindow,
      options,
    };

    this.#configureWindow(windowInfo);
    this.#setWindowListeners(windowInfo);

    if (!this.activeWindows.length) {
      electronRemote.initialize();
    }

    this.activeWindows.push(windowInfo);
    electronRemote.enable(newWindow.webContents);
    this.#listenForWindowInfoRequest(windowInfo);
    this.#loadApplication(windowInfo);

    return newWindow;
  }

  /** @param {WindowInfo} windowInfo */
  #configureWindow(windowInfo) {
    const win = windowInfo.window;

    win.show();
    win.removeMenu();

    win.webContents.setWindowOpenHandler(() => {
      return {action: 'allow', overrideBrowserWindowOptions: {width: 1280, height: 720}};
    });
  }

  /** @param {WindowInfo} windowInfo */
  #setWindowListeners(windowInfo) {
    windowInfo.window.on('closed', () => {
      const windowIndex = this.activeWindows.findIndex(({id}) => windowInfo.id === id);
      if (windowIndex >= 0) {
        this.activeWindows.splice(windowIndex, 1);
        console.log(`Window closed: \x1b[36m${windowInfo.id}\x1b[0m`);
      }
    });

    windowInfo.window.on('close', event => {
      event.preventDefault();
      this.#handleClosingWindow(windowInfo);
    });
  }

  #getIcon() {
    const iconPathArray = ['..', 'apps', 'ame', 'src', 'assets', 'img', 'png', 'aspect-model-editor-targetsize-192.png'];
    return path.join(__dirname, ...iconPathArray);
  }

  /** @param {{id: string, options: WindowOptions | null}} _ */
  #listenForWindowInfoRequest({id, options}) {
    const executeFn = event => {
      console.log('RECEIVED REQUEST STARTUP DATA');
      event.sender.send(RESPONSE_STARTUP_DATA, {id, options});
      ipcMain.removeListener(REQUEST_STARTUP_DATA, executeFn);
    };

    ipcMain.on(REQUEST_STARTUP_DATA, executeFn);
  }

  /** @param {BrowserWindow} window */
  #enableDevtools(window) {
    window.webContents.openDevTools();
    electronLocalShortcut.register(window, 'CommandOrControl+F12', () => {
      window.webContents.openDevTools();
    });
  }

  /** @param {{window: BrowserWindow, id: string}} _ */
  #loadApplication({window, id}) {
    if (process.argv.includes('--dev')) {
      return window.loadURL('http://localhost:4200').then(() => {
        this.#enableDevtools(window);
        console.log(`Window \x1b[36m${id}\x1b[0m created!`);
      });
    }
    return window.loadFile('./dist/apps/ame/index.html').then(() => console.log(`Window ${id} created!`));
  }

  /** @param {WindowInfo} windowInfo */
  #handleClosingWindow(windowInfo) {
    const {window} = windowInfo;
    window.show();
    window.webContents.send(REQUEST_IS_FILE_SAVED, windowInfo.id);
  }
}

exports.windowsManager = new WindowsManager();
