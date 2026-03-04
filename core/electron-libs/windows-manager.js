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

// @ts-check

/** @typedef {{namespace: string, file: string, editElement?: string, fromWorkspace?: boolean}} WindowOptions */
/** @typedef {{id: number, window: BrowserWindow, options: WindowOptions | null, menu: Menu | null}} WindowInfo */
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
  SIGNAL_NEW_WINDOW,
} = require('./events');
const {inDevMode, icons} = require('./consts');
const {getIcon} = require('./menu/utils');

class WindowsManager {
  _windowConfig;
  _state;
  _timeout;
  _updates;

  constructor() {
    this._windowConfig = {
      show: false,
      icon: this._getIcon(),
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
      },
    };

    this._state = {
      focusedWindowId: undefined,
      activeWindows: [],
      lockedFiles: [],
    };

    this._updates = [];
  }

  activateCommunicationProtocol() {
    ipcMain.on(REQUEST_CREATE_WINDOW, (_, options) => {
      const activeWindow = this._isWindowAlreadyDefined(options);
      activeWindow ? this.createWindow(activeWindow, options) : this.createNewWindow(options);
    });

    // updates loaded file data with new loaded one or with new file data
    ipcMain.on(REQUEST_UPDATE_DATA, (event, options) => {
      const windowId = event.sender.id;
      const windowInfo = this._state.activeWindows.find(windowInfo => windowInfo.id === windowId);

      if (!windowInfo) return;

      windowInfo.options = options;
      console.log(`UPDATED: \x1b[36m${windowId}\x1b[0m with \x1b[36m${options.namespace} | ${options.file}\x1b[0m`);

      ipcMain.emit(SIGNAL_REFRESH_WORKSPACE);
    });

    // maximizes window if it exists
    ipcMain.on(REQUEST_MAXIMIZE_WINDOW, event => {
      const windowId = event.sender.id;
      const window = this._state.activeWindows.find(windowInfo => windowInfo.id === windowId)?.window;
      if (window) {
        window.maximize();
      }
    });

    // checks to see if the is only one window opened
    ipcMain.on(REQUEST_IS_FIRST_WINDOW, event => {
      event.sender.send(RESPONSE_IS_FIRST_WINDOW, this._state.activeWindows.length <= 1);
    });

    // closes window by force
    ipcMain.on(REQUEST_CLOSE_WINDOW, event => {
      const windowId = event.sender.id;
      const index = this._state.activeWindows.findIndex(windowInfo => windowId === windowInfo.id);
      const win = index >= 0 ? this._state.activeWindows[index]?.window : null;

      this._state.activeWindows.splice(index, 1);

      if (!win) {
        return;
      }

      win.destroy();
    });

    ipcMain.on(SIGNAL_REFRESH_WORKSPACE, event => {
      const windowId = event?.sender?.id;
      this._state.activeWindows.forEach(({id, window}) => {
        window.webContents.send(REQUEST_REFRESH_WORKSPACE);
      });
    });

    ipcMain.on(REQUEST_ADD_LOCK, (_, {namespace, file}) => {
      const found = this._state.lockedFiles.find(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file);
      if (!found) {
        console.log('REQUEST_ADD_LOCK', namespace, file);
        this._state.lockedFiles.push({namespace, file});
        this._state.activeWindows.forEach(({window}) => window.webContents.send(RESPONSE_LOCKED_FILES, this._state.lockedFiles));
      }
    });

    ipcMain.on(REQUEST_REMOVE_LOCK, (_, {namespace, file}) => {
      const foundIndex = this._state.lockedFiles.findIndex(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file);
      if (foundIndex > -1) {
        console.log('REQUEST_REMOVE_LOCK', namespace, file);
        this._state.lockedFiles.splice(foundIndex, 1);
        this._state.activeWindows.forEach(({window}) => window.webContents.send(RESPONSE_LOCKED_FILES, this._state.lockedFiles));
      }
    });

    ipcMain.on(REQUEST_LOCKED_FILES, event => {
      console.log('REQUEST_LOCKED_FILES', this._state.lockedFiles);
      event.sender.send(RESPONSE_LOCKED_FILES, this._state.lockedFiles);
    });

    ipcMain.on(SIGNAL_WINDOW_FOCUS, event => {
      console.log('SIGNAL_WINDOW_FOCUS', event.sender.id);
      this._state.focusedWindowId = event.sender.id;
      this._setActiveMenu();
    });

    ipcMain.on(SIGNAL_UPDATE_MENU_ITEM, (event, {ids, payload}) => {
      console.log('SIGNAL_UPDATE_MENU_ITEM', event.sender.id);
      this._state.focusedWindowId = event.sender.id;
      this._updateMenu(ids, payload);
    });

    ipcMain.on(SIGNAL_TRANSLATE_MENU_ITEMS, (event, {id, payload}) => {
      Menu.setApplicationMenu(Menu.buildFromTemplate([...appMenuTemplate(payload.translation)]));
    });
  }

  /**
   * Creates a new Electron `BrowserWindow`, configures it, sets up listeners,
   * initializes Electron remote if needed, and loads the application.
   * Adds the window to the active windows state and sets it as focused.
   *
   * @returns {BrowserWindow} The newly created BrowserWindow instance.
   */
  createNewWindow(options) {
    const newWindow = new BrowserWindow(this._windowConfig);

    /** @type {WindowInfo} */
    const windowInfo = {
      id: newWindow.webContents.id,
      window: newWindow,
      options: options,
      menu: null,
    };

    this._configureWindow(windowInfo);
    this._setWindowListeners(windowInfo);

    if (this._state.activeWindows.length === 0) {
      electronRemote.initialize();
    }

    this._state.activeWindows.push(windowInfo);
    this._state.focusedWindowId = windowInfo.id;

    electronRemote.enable(newWindow.webContents);
    this._listenForWindowDataRequest();
    this._loadApplication(windowInfo);

    return newWindow;
  }

  /**
   * Finds an existing window matching the given options and brings it to the foreground.
   * If the window exists, it is shown and focused. If `editElement` is provided in options,
   * sends an edit request to the window; otherwise, shows a notification that the model is already loaded.
   *
   * @param {WindowInfo} activeWindow - The window info object to activate.
   * @param {WindowOptions} options - Options describing the window to find or create.
   * @returns {void}
   */
  createWindow(activeWindow, options) {
    const {window} = activeWindow;
    window.show();
    window.focus();

    if (options?.editElement) {
      window.webContents.send(REQUEST_EDIT_ELEMENT, options.editElement);
    } else {
      window.webContents.send(REQUEST_SHOW_NOTIFICATION, 'Model already loaded');
    }
  }

  //#region Selectors
  /**
   * Returns the active window that is currently focused.
   *
   * @returns {WindowInfo|undefined} The focused window info, or `undefined` if none is focused.
   */
  _selectActiveWindow() {
    return this._state.activeWindows.find(window => window.id === this._state?.focusedWindowId);
  }

  /**
   * Checks if a window with the given options already exists in the active windows list.
   * Returns the matching window info if found, otherwise `undefined`.
   *
   * @param {WindowOptions} options - The options to match against existing windows.
   * @returns {WindowInfo|undefined} The matching window info, or `undefined` if not found.
   */
  _isWindowAlreadyDefined(options) {
    return this._state.activeWindows.find(
      ({options: winOptions}) =>
        options?.namespace === winOptions?.namespace && options?.file === winOptions?.file && winOptions?.fromWorkspace,
    );
  }
  //#endregion

  //#region Actions
  _updateMenu(ids, update) {
    this._updates.push({ids, update});
    if (this._timeout) clearTimeout(this._timeout);

    this._timeout = setTimeout(() => {
      const menu = this._processMenuUpdates();
      this._applyMenu(menu, update);
    }, 150);
  }

  _processMenuUpdates() {
    let menu = null;
    while (this._updates.length) {
      const {ids, update} = this._updates.shift();
      menu = this._updateMenuIcon(ids, update);
    }
    return menu;
  }

  _applyMenu(menu, update) {
    const activeWindow = this._selectActiveWindow();
    if (!activeWindow) return;

    if (menu) {
      activeWindow.menu = Menu.buildFromTemplate(menu);
    } else {
      activeWindow.menu = Menu.buildFromTemplate([...appMenuTemplate(update.translation)]);
    }
    this._setActiveMenu();
  }

  _setActiveMenu() {
    const menu = this._selectActiveWindow().menu;
    menu && Menu.setApplicationMenu(menu);
  }
  //#endregion

  /**
   * @param {string[]} ids
   * @param {Record<string, any>} updates
   */
  _updateMenuIcon(ids, updates) {
    const activeMenu = this._selectActiveWindow().menu;
    if (!activeMenu) return;

    const cleanMenuItem = item => {
      const copy = {};
      for (const key in item) {
        if (key !== 'items' && !key.startsWith('_')) {
          copy[key] = item[key];
        }
      }
      if (item.submenu && Array.isArray(item.submenu.items)) {
        copy.submenu = item.submenu.items.map(subItem => cleanMenuItem(subItem));
      }
      if (item.submenu && Array.isArray(item.submenu.submenu)) {
        copy.submenu = item.submenu.submenu.map(subSubItem => cleanMenuItem(subSubItem));
      }
      return copy;
    };

    const stack = activeMenu.items.map(cleanMenuItem);

    for (const menuItem of stack) {
      if (!menuItem.id) continue;
      if (!menuItem.submenu?.length) continue;

      for (const subMenu of menuItem.submenu) {
        if (ids.includes(subMenu.id)) {
          for (const key in updates) {
            subMenu[key] = updates[key];
          }

          if (typeof updates.enabled === 'boolean') {
            const id = ids.find(id => id === subMenu.id);
            subMenu.icon = getIcon(updates.enabled ? icons[id].enabled : icons[id].disabled);
          }
        } else if (subMenu.id === 'MENU_NEW') {
          for (const subSubMenu of subMenu.submenu) {
            if (ids.includes(subSubMenu.id)) {
              for (const key in updates) {
                subSubMenu[key] = updates[key];
              }

              if (typeof updates.enabled === 'boolean') {
                const id = ids.find(id => id === subSubMenu.id);
                subSubMenu.icon = getIcon(updates.enabled ? icons[id].enabled : icons[id].disabled);
              }
            }
          }
        }
      }
    }

    return stack;
  }

  /** @param {WindowInfo} windowInfo */
  _configureWindow(windowInfo) {
    const win = windowInfo.window;

    win.show();
    win.removeMenu();
    Menu.setApplicationMenu(windowInfo.menu || null);

    win.webContents.setWindowOpenHandler(() => {
      return {action: 'allow', overrideBrowserWindowOptions: {width: 1280, height: 720}};
    });
  }

  /** @param {WindowInfo} windowInfo */
  _setWindowListeners(windowInfo) {
    windowInfo.window.on('closed', () => {
      const windowIndex = this._state.activeWindows.findIndex(({id}) => windowInfo.id === id);
      if (windowIndex >= 0) {
        this._state.activeWindows.splice(windowIndex, 1);
        console.log(`Window closed: \x1b[36m${windowInfo.id}\x1b[0m`);
      }
    });

    windowInfo.window.on('close', event => {
      event.preventDefault();
      this._handleClosingWindow(windowInfo);
    });
  }

  _getIcon() {
    const iconPathArray = ['..', 'apps', 'ame', 'src', 'assets', 'img', 'png', 'aspect-model-editor-targetsize-192.png'];
    return path.join(__dirname, ...iconPathArray);
  }

  _listenForWindowDataRequest() {
    const executeFn = event => {
      console.log('RECEIVED REQUEST WINDOW DATA');
      const windowId = event.sender.id;
      const {id, options} = this._state.activeWindows.find(window => window.id === windowId) || {};
      if (!id) {
        return;
      }

      event.sender.send(RESPONSE_WINDOW_DATA, {id, options});
    };

    ipcMain.on(REQUEST_WINDOW_DATA, executeFn);
  }

  /** @param {WindowInfo} _ */
  _loadApplication({window, id}) {
    if (inDevMode()) {
      return window.loadURL('http://localhost:4200').then(() => {
        window.webContents.openDevTools();
        console.log(`Window \x1b[36m${id}\x1b[0m created!`);
      });
    }
    return window.loadFile('./dist/apps/ame/index.html').then(() => console.log(`Window ${id} created!`));
  }

  /** @param {WindowInfo} windowInfo */
  _handleClosingWindow(windowInfo) {
    const {window} = windowInfo;
    window.show();
    window.webContents.send(REQUEST_IS_FILE_SAVED, windowInfo.id);
  }
}

exports.windowsManager = new WindowsManager();
