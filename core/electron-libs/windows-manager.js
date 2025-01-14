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

// @ts-check

/** @typedef {{namespace: string, file: string, editElement?: string, fromWorkspace?: boolean}} WindowOptions */
/** @typedef {{id: number, window: BrowserWindow, options: WindowOptions | null, menu: Menu}} WindowInfo */
/** @typedef {{namespace: string; file: string}} LockedFile */

const {BrowserWindow, ipcMain, Menu} = require('electron');
const {appMenuTemplate} = require('./menu/app-menu');
const electronRemote = require('@electron/remote/main');
const path = require('path');
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
  RESPONSE_LOCKED_FILES,
  REQUEST_ADD_LOCK,
  REQUEST_REMOVE_LOCK,
  REQUEST_LOCKED_FILES,
  SIGNAL_WINDOW_FOCUS,
  SIGNAL_UPDATE_MENU_ITEM,
  SIGNAL_TRANSLATE_MENU_ITEMS,
} = require('./events');
const {inDevMode, icons} = require('./consts');
const {getIcon} = require('./menu/utils');

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

  // State is mutable at the moment
  /** @type {{focusedWindowId?: number, activeWindows: WindowInfo[], lockedFiles: LockedFile[]}} */
  state = {
    focusedWindowId: undefined,
    activeWindows: [],
    lockedFiles: [],
  };

  activateCommunicationProtocol() {
    ipcMain.on(REQUEST_CREATE_WINDOW, (_, options) => this.createWindow(options));

    // updates loaded file data with new loaded one or with new file data
    ipcMain.on(REQUEST_UPDATE_DATA, (event, options) => {
      const windowId = event.sender.id;
      const windowInfo = this.state.activeWindows.find(windowInfo => windowInfo.id === windowId);

      if (!windowInfo) return;

      windowInfo.options = options;
      console.log(`UPDATED: \x1b[36m${windowId}\x1b[0m with \x1b[36m${options.namespace} | ${options.file}\x1b[0m`);

      ipcMain.emit(SIGNAL_REFRESH_WORKSPACE);
    });

    // maximizes window if it exists
    ipcMain.on(REQUEST_MAXIMIZE_WINDOW, event => {
      const windowId = event.sender.id;
      const window = this.state.activeWindows.find(windowInfo => windowInfo.id === windowId)?.window;
      if (window) {
        window.maximize();
      }
    });

    // checks to see if the is only one window opened
    ipcMain.on(REQUEST_IS_FIRST_WINDOW, event => {
      event.sender.send(RESPONSE_IS_FIRST_WINDOW, this.state.activeWindows.length <= 1);
    });

    // closes window by force
    ipcMain.on(REQUEST_CLOSE_WINDOW, event => {
      const windowId = event.sender.id;
      const index = this.state.activeWindows.findIndex(windowInfo => windowId === windowInfo.id);
      const win = index >= 0 ? this.state.activeWindows[index]?.window : null;

      this.state.activeWindows.splice(index, 1);

      if (!win) {
        return;
      }

      win.destroy();
    });

    ipcMain.on(SIGNAL_REFRESH_WORKSPACE, (event, ignoreSenderWindow = false) => {
      const windowId = event?.sender?.id;
      this.state.activeWindows.forEach(({id, window}) => {
        if (ignoreSenderWindow && windowId && id === windowId) return;
        window.webContents.send(REQUEST_REFRESH_WORKSPACE);
      });
    });

    ipcMain.on(REQUEST_ADD_LOCK, (_, {namespace, file}) => {
      const found = this.state.lockedFiles.find(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file);
      if (!found) {
        console.log('REQUEST_ADD_LOCK', namespace, file);
        this.state.lockedFiles.push({namespace, file});
        this.state.activeWindows.forEach(({window}) => window.webContents.send(RESPONSE_LOCKED_FILES, this.state.lockedFiles));
      }
    });

    ipcMain.on(REQUEST_REMOVE_LOCK, (_, {namespace, file}) => {
      const foundIndex = this.state.lockedFiles.findIndex(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file);
      if (foundIndex > -1) {
        console.log('REQUEST_REMOVE_LOCK', namespace, file);
        this.state.lockedFiles.splice(foundIndex, 1);
        this.state.activeWindows.forEach(({window}) => window.webContents.send(RESPONSE_LOCKED_FILES, this.state.lockedFiles));
      }
    });

    ipcMain.on(REQUEST_LOCKED_FILES, event => {
      console.log('REQUEST_LOCKED_FILES', this.state.lockedFiles);
      event.sender.send(RESPONSE_LOCKED_FILES, this.state.lockedFiles);
    });

    ipcMain.on(SIGNAL_WINDOW_FOCUS, event => {
      console.log('SIGNAL_WINDOW_FOCUS', event.sender.id);
      this.state.focusedWindowId = event.sender.id;
      this.setActiveMenu();
    });

    ipcMain.on(SIGNAL_UPDATE_MENU_ITEM, (event, {id, payload}) => {
      console.log('SIGNAL_UPDATE_MENU_ITEM', event.sender.id);
      this.state.focusedWindowId = event.sender.id;
      this.updateMenuItemById(id, payload);
    });

    ipcMain.on(SIGNAL_TRANSLATE_MENU_ITEMS, (event, {id, payload}) => {
      Menu.setApplicationMenu(Menu.buildFromTemplate([...appMenuTemplate(payload.translation)]));
    });
  }

  //#region Selectors

  selectActiveWindow() {
    if (!this.state.focusedWindowId) {
      return;
    }

    return this.state.activeWindows.find(window => window.id === this.state.focusedWindowId);
  }

  selectActiveWindowMenu() {
    const activeWindow = this.selectActiveWindow();
    return activeWindow?.menu;
  }

  selectMenuItemById(id) {
    const menu = this.selectActiveWindowMenu();
    return menu?.getMenuItemById(id);
  }

  //#endregion
  //#region Actions

  #updates = [];
  #timeout;

  // Mutates the menu item object
  updateMenuItemById(id, update) {
    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#updates.push({id, update});
    }

    this.#timeout = setTimeout(() => {
      while (this.#updates.length) {
        const currentUpdate = this.#updates[0];
        this.#updateMenuIcon(currentUpdate.id, currentUpdate.update);
        this.#updates.shift();
      }
      Menu.setApplicationMenu(Menu.buildFromTemplate([...appMenuTemplate(update.translation)]));
    }, 150);
  }

  setActiveMenu() {
    const menu = this.selectActiveWindowMenu();
    menu && Menu.setApplicationMenu(menu);
  }

  //#endregion

  /** @param {WindowOptions | null} options */
  createWindow(options) {
    const createdWindow = options
      ? this.state.activeWindows.find(
          winInfo =>
            options.namespace === winInfo.options?.namespace && winInfo.options?.file === options.file && winInfo.options?.fromWorkspace,
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

    if (!this.state.activeWindows.length) {
      electronRemote.initialize();
    }

    this.state.activeWindows.push(windowInfo);
    this.state.focusedWindowId = windowInfo.id;

    electronRemote.enable(newWindow.webContents);
    this.#listenForWindowDataRequest();
    this.#loadApplication(windowInfo);

    return newWindow;
  }

  /**
   * @param {string} id
   * @param {Record<string, any>} updates
   */
  #updateMenuIcon(id, updates) {
    const activeMenu = this.selectActiveWindowMenu();
    if (!activeMenu) return;

    /** @type {any[]}  */
    const stack = [appMenuTemplate(updates.translation)];

    while (stack.length) {
      const menuList = stack.pop();
      if (!menuList) continue;

      for (const menuItem of menuList) {
        /** @type {any} */
        const menu = activeMenu.getMenuItemById(menuItem.id);

        if (!menu) continue;
        if (menuItem.submenu?.length) stack.push(menuItem.submenu);

        if (!this.#updates.find(({id: updateId}) => id === updateId)) {
          menuItem.label = menu.label;
          menuItem.icon = menu.icon;
        }

        if (id === menuItem.id) {
          for (const key in updates) {
            menuItem[key] = updates[key];
          }

          if (typeof updates.enabled === 'boolean') {
            menuItem.icon = getIcon(updates.enabled ? icons[id].enabled : icons[id].disabled);
          }
        }
      }
    }
  }

  /** @param {WindowInfo} windowInfo */
  #configureWindow(windowInfo) {
    const win = windowInfo.window;

    win.show();
    win.removeMenu();
    Menu.setApplicationMenu(windowInfo.menu || null);

    win.webContents.setWindowOpenHandler(() => {
      return {action: 'allow', overrideBrowserWindowOptions: {width: 1280, height: 720}};
    });
  }

  /** @param {WindowInfo} windowInfo */
  #setWindowListeners(windowInfo) {
    windowInfo.window.on('closed', () => {
      const windowIndex = this.state.activeWindows.findIndex(({id}) => windowInfo.id === id);
      if (windowIndex >= 0) {
        this.state.activeWindows.splice(windowIndex, 1);
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
      const {id, options} = this.state.activeWindows.find(window => window.id === windowId) || {};
      if (!id) {
        return;
      }

      event.sender.send(RESPONSE_WINDOW_DATA, {id, options});
    };

    ipcMain.on(REQUEST_WINDOW_DATA, executeFn);
  }

  /** @param {WindowInfo} _ */
  #loadApplication({window, id}) {
    if (inDevMode()) {
      return window.loadURL('http://localhost:4200').then(() => {
        window.webContents.openDevTools();
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
