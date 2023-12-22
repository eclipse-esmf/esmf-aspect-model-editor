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
/** @typedef {{id: number, window: BrowserWindow, options: WindowOptions | null}} WindowInfo */

const {BrowserWindow, ipcMain} = require('electron');
const electronRemote = require('@electron/remote/main');
const path = require('path');
const electronLocalShortcut = require('electron-localshortcut');
const {
  REQUEST_MAXIMIZE_WINDOW,
  REQUEST_CREATE_WINDOW,
  REQUEST_IS_FIRST_WINDOW,
  RESPONSE_IS_FIRST_WINDOW,
  REQUEST_WINDOW_DATA,
  RESPONSE_WINDOW_DATA,
  REQUEST_IS_FILE_SAVED,
  REQUEST_CLOSE_WINDOW,
  REQUEST_SHOW_NOTIFICATION,
  REQUEST_UPDATE_DATA,
  REQUEST_EDIT_ELEMENT,
  SIGNAL_REFRESH_WORKSPACE,
  REQUEST_REFRESH_WORKSPACE,
  REQUEST_UNLOCK_FILE,
  REQUEST_LOCK_FILE,
  RESPONSE_LOCKED_FILES,
  REQUEST_ADD_LOCK,
  REQUEST_REMOVE_LOCK,
  REQUEST_LOCKED_FILES,
} = require('./events');

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

  /** @type {{namespace: string; file: string}[]} */
  lockedFiles = [];

  activateCommunicationProtocol() {
    ipcMain.on(REQUEST_CREATE_WINDOW, (_, options) => this.createWindow(options));

    // updates loaded file data with new loaded one or with new file data
    ipcMain.on(REQUEST_UPDATE_DATA, (event, options) => {
      const windowId = event.sender.id;
      const windowInfo = this.activeWindows.find(windowInfo => windowInfo.id === windowId);

      if (!windowInfo) return;
      if (windowInfo.options?.fromWorkspace) {
        // Request unlock old file if is from workspace
        console.log(`Unlocking ${windowInfo.options?.namespace} - ${windowInfo.options?.namespace}`);
        windowInfo.window.webContents.send(REQUEST_UNLOCK_FILE, windowInfo.options?.namespace, windowInfo.options?.file);
      }

      windowInfo.options = options;
      console.log(`UPDATED: \x1b[36m${windowId}\x1b[0m with \x1b[36m${options.namespace} | ${options.file}\x1b[0m`);

      if (windowInfo.options?.fromWorkspace) {
        console.log(`locking ${windowInfo.options?.namespace} - ${windowInfo.options?.namespace}`);
        // Request lock file if it is from workspace
        windowInfo.window.webContents.send(REQUEST_LOCK_FILE, windowInfo.options?.namespace, windowInfo.options?.file);
      }

      ipcMain.emit(SIGNAL_REFRESH_WORKSPACE);
    });

    // maximizes window if it exists
    ipcMain.on(REQUEST_MAXIMIZE_WINDOW, event => {
      const windowId = event.sender.id;
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
    ipcMain.on(REQUEST_CLOSE_WINDOW, event => {
      const windowId = event.sender.id;
      const index = this.activeWindows.findIndex(windowInfo => windowId === windowInfo.id);
      const win = index >= 0 ? this.activeWindows[index]?.window : null;

      this.activeWindows.splice(index, 1);

      if (!win) {
        return;
      }

      win.destroy();
    });

    ipcMain.on(SIGNAL_REFRESH_WORKSPACE, (event, ignoreSenderWindow = false) => {
      const windowId = event?.sender?.id;
      this.activeWindows.forEach(({id, window}) => {
        if (ignoreSenderWindow && windowId && id === windowId) return;
        window.webContents.send(REQUEST_REFRESH_WORKSPACE);
      });
    });

    ipcMain.on(REQUEST_ADD_LOCK, (_, {namespace, file}) => {
      const found = this.lockedFiles.find(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file);
      if (!found) {
        console.log('REQUEST_ADD_LOCK', namespace, file);
        this.lockedFiles.push({namespace, file});
        this.activeWindows.forEach(({window}) => window.webContents.send(RESPONSE_LOCKED_FILES, this.lockedFiles));
      }
    });

    ipcMain.on(REQUEST_REMOVE_LOCK, (_, {namespace, file}) => {
      const foundIndex = this.lockedFiles.findIndex(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file);
      if (foundIndex > -1) {
        console.log('REQUEST_REMOVE_LOCK', namespace, file);
        this.lockedFiles.splice(foundIndex, 1);
        this.activeWindows.forEach(({window}) => window.webContents.send(RESPONSE_LOCKED_FILES, this.lockedFiles));
      }
    });

    ipcMain.on(REQUEST_LOCKED_FILES, event => {
      console.log('REQUEST_LOCKED_FILES', this.lockedFiles);
      event.sender.send(RESPONSE_LOCKED_FILES, this.lockedFiles);
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
      id: newWindow.webContents.id,
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
    this.#listenForWindowDataRequest();
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

  #listenForWindowDataRequest() {
    const executeFn = event => {
      console.log('RECEIVED REQUEST WINDOW DATA');
      const windowId = event.sender.id;
      const {id, options} = this.activeWindows.find(window => window.id === windowId);
      event.sender.send(RESPONSE_WINDOW_DATA, {id, options});
    };

    ipcMain.on(REQUEST_WINDOW_DATA, executeFn);
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
