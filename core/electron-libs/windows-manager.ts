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

import {enable, initialize} from '@electron/remote/main';
import {BrowserWindow, ipcMain, Menu, MenuItem, NativeImage} from 'electron';
import * as path from 'path';
import {icons} from './const/icons';
import {EVENTS} from './events';
import {appMenuTemplate} from './menu/app';
import {getIcon} from './utils/icon-utils';
import {inDevMode} from './utils/mode';

export interface WindowOptions {
  namespace: string;
  file: string;
  editElement?: string;
  fromWorkspace?: boolean;
}

export interface WindowInfo {
  id: number;
  window: BrowserWindow;
  options: WindowOptions | null;
  menu: Menu | null;
}

export interface LockedFile {
  namespace: string;
  file: string;
}

export interface CustomMenuItem {
  id?: string;
  submenu?: CustomMenuItem[];
  icon?: NativeImage;
  enabled?: boolean;
  [key: string]: any;
}

class WindowsManager {
  private _windowConfig: Electron.BrowserWindowConstructorOptions;
  private _state: {
    focusedWindowId?: number;
    activeWindows: WindowInfo[];
    lockedFiles: LockedFile[];
  };
  private _timeout?: NodeJS.Timeout;
  private _updates: Array<{ids: string[]; update: Record<string, any>}>;

  constructor() {
    this._windowConfig = {
      show: false,
      icon: this._getIcon(),
      webPreferences: {
        nodeIntegration: true,
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
    ipcMain.on(EVENTS.REQUEST_CREATE_WINDOW, (_, options) => {
      const activeWindow = this._isWindowAlreadyDefined(options);
      activeWindow ? this.createWindow(activeWindow, options) : this.createNewWindow(options);
    });

    // updates loaded file data with new loaded one or with new file data
    ipcMain.on(EVENTS.REQUEST_UPDATE_DATA, (event, options) => {
      const windowId = event.sender.id;
      const windowInfo = this._state.activeWindows.find(windowInfo => windowInfo.id === windowId);

      if (!windowInfo) return;

      windowInfo.options = options;
      console.log(`UPDATED: \x1b[36m${windowId}\x1b[0m with \x1b[36m${options.namespace} | ${options.file}\x1b[0m`);

      ipcMain.emit(EVENTS.SIGNAL_REFRESH_WORKSPACE);
    });

    // maximizes window if it exists
    ipcMain.on(EVENTS.REQUEST_MAXIMIZE_WINDOW, event => {
      const windowId = event.sender.id;
      const window = this._state.activeWindows.find(windowInfo => windowInfo.id === windowId)?.window;
      if (window) {
        window.maximize();
      }
    });

    // checks to see if the is only one window opened
    ipcMain.on(EVENTS.REQUEST_IS_FIRST_WINDOW, event => {
      event.sender.send(EVENTS.RESPONSE_IS_FIRST_WINDOW, this._state.activeWindows.length <= 1);
    });

    // closes window by force
    ipcMain.on(EVENTS.REQUEST_CLOSE_WINDOW, event => {
      const windowId = event.sender.id;
      const index = this._state.activeWindows.findIndex(windowInfo => windowId === windowInfo.id);
      const win = index >= 0 ? this._state.activeWindows[index]?.window : null;

      this._state.activeWindows.splice(index, 1);

      if (!win) {
        return;
      }

      win.destroy();
    });

    ipcMain.on(EVENTS.SIGNAL_REFRESH_WORKSPACE, event => {
      const windowId = event?.sender?.id;
      this._state.activeWindows.forEach(({id, window}) => {
        window.webContents.send(EVENTS.REQUEST_REFRESH_WORKSPACE);
      });
    });

    ipcMain.on(EVENTS.REQUEST_ADD_LOCK, (_, {namespace, file}) => {
      const found = this._state.lockedFiles.find(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file);
      if (!found) {
        console.log('REQUEST_ADD_LOCK', namespace, file);
        this._state.lockedFiles.push({namespace, file});
        this._state.activeWindows.forEach(({window}) => window.webContents.send(EVENTS.RESPONSE_LOCKED_FILES, this._state.lockedFiles));
      }
    });

    ipcMain.on(EVENTS.REQUEST_REMOVE_LOCK, (_, {namespace, file}) => {
      const foundIndex = this._state.lockedFiles.findIndex(lockedFile => lockedFile.namespace === namespace && lockedFile.file === file);
      if (foundIndex > -1) {
        console.log('REQUEST_REMOVE_LOCK', namespace, file);
        this._state.lockedFiles.splice(foundIndex, 1);
        this._state.activeWindows.forEach(({window}) => window.webContents.send(EVENTS.RESPONSE_LOCKED_FILES, this._state.lockedFiles));
      }
    });

    ipcMain.on(EVENTS.REQUEST_LOCKED_FILES, event => {
      console.log('REQUEST_LOCKED_FILES', this._state.lockedFiles);
      event.sender.send(EVENTS.RESPONSE_LOCKED_FILES, this._state.lockedFiles);
    });

    ipcMain.on(EVENTS.SIGNAL_WINDOW_FOCUS, event => {
      console.log('SIGNAL_WINDOW_FOCUS', event.sender.id);
      this._state.focusedWindowId = event.sender.id;
      this._setActiveMenu();
    });

    ipcMain.on(EVENTS.SIGNAL_UPDATE_MENU_ITEM, (event, {ids, payload}) => {
      console.log('SIGNAL_UPDATE_MENU_ITEM', event.sender.id);
      this._state.focusedWindowId = event.sender.id;
      this._updateMenu(ids, payload);
    });

    ipcMain.on(EVENTS.SIGNAL_TRANSLATE_MENU_ITEMS, (event, {id, payload}) => {
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
  createNewWindow(options: WindowOptions = null): BrowserWindow {
    const newWindow = new BrowserWindow(this._windowConfig);

    const windowInfo = {
      id: newWindow.webContents.id,
      window: newWindow,
      options: options,
      menu: null as any,
    };

    this._configureWindow(windowInfo);
    this._setWindowListeners(windowInfo);

    if (this._state.activeWindows.length === 0) {
      initialize();
    }

    this._state.activeWindows.push(windowInfo);
    this._state.focusedWindowId = windowInfo.id;

    enable(newWindow.webContents);
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
  createWindow(activeWindow: WindowInfo, options: WindowOptions): void {
    const {window} = activeWindow;
    window.show();
    window.focus();

    if (options?.editElement) {
      window.webContents.send(EVENTS.REQUEST_EDIT_ELEMENT, options.editElement);
    } else {
      window.webContents.send(EVENTS.REQUEST_SHOW_NOTIFICATION, 'Model already loaded');
    }
  }

  //#region Selectors
  /**
   * Returns the active window that is currently focused.
   *
   * @returns {WindowInfo|undefined} The focused window info, or `undefined` if none is focused.
   */
  private _selectActiveWindow(): WindowInfo | undefined {
    return this._state.activeWindows.find(window => window.id === this._state?.focusedWindowId);
  }

  /**
   * Checks if a window with the given options already exists in the active windows list.
   * Returns the matching window info if found, otherwise `undefined`.
   *
   * @param {WindowOptions} options - The options to match against existing windows.
   * @returns {WindowInfo|undefined} The matching window info, or `undefined` if not found.
   */
  private _isWindowAlreadyDefined(options: WindowOptions): WindowInfo | undefined {
    return this._state.activeWindows.find(
      ({options: winOptions}) =>
        options?.namespace === winOptions?.namespace && options?.file === winOptions?.file && winOptions?.fromWorkspace,
    );
  }
  //#endregion

  //#region Actions
  private _updateMenu(ids: string[], update: Record<string, any>) {
    this._updates.push({ids, update});
    if (this._timeout) clearTimeout(this._timeout);

    this._timeout = setTimeout(() => {
      const menu = this._processMenuUpdates();
      this._applyMenu(menu, update);
    }, 150);
  }

  private _processMenuUpdates(): CustomMenuItem[] | null {
    let menu: CustomMenuItem[] | null = null;
    while (this._updates.length) {
      const {ids, update} = this._updates.shift()!;
      menu = this._updateMenuIcon(ids, update);
    }
    return menu;
  }

  private _applyMenu(menu: CustomMenuItem[] | null, update: Record<string, any>) {
    const activeWindow = this._selectActiveWindow();
    if (!activeWindow) return;

    if (menu) {
      activeWindow.menu = Menu.buildFromTemplate(menu);
    } else {
      activeWindow.menu = Menu.buildFromTemplate([...appMenuTemplate(update.translation)]);
    }
    this._setActiveMenu();
  }

  private _setActiveMenu() {
    const menu = this._selectActiveWindow()?.menu;
    if (menu) Menu.setApplicationMenu(menu);
  }

  //#endregion
  private _updateMenuIcon(ids: string[], updates: Record<string, any>): CustomMenuItem[] | undefined {
    const activeMenu = this._selectActiveWindow()?.menu;
    if (!activeMenu) return;

    const cleanMenuItem = (item: MenuItem): CustomMenuItem => {
      const copy: CustomMenuItem = {};
      for (const key in item) {
        if (key !== 'items' && !key.startsWith('_')) {
          copy[key] = (item as any)[key];
        }
      }
      if ((item as any).submenu && Array.isArray((item as any).submenu.items)) {
        copy.submenu = (item as any).submenu.items.map((subItem: MenuItem) => cleanMenuItem(subItem));
      }
      if ((item as any).submenu && Array.isArray((item as any).submenu.submenu)) {
        copy.submenu = (item as any).submenu.submenu.map((subSubItem: MenuItem) => cleanMenuItem(subSubItem));
      }
      return copy;
    };
    const stack: CustomMenuItem[] = activeMenu.items.map((item: MenuItem) => cleanMenuItem(item));

    for (const menuItem of stack) {
      if (!menuItem.id) continue;
      if (!menuItem.submenu?.length) continue;

      for (const subMenu of menuItem.submenu) {
        if (ids.includes(subMenu.id!)) {
          for (const key in updates) {
            subMenu[key] = updates[key];
          }

          if (typeof updates.enabled === 'boolean') {
            const id = ids.find(id => id === subMenu.id);
            if (id) {
              const icon = icons[id as keyof typeof icons];
              subMenu.icon = getIcon(updates.enabled ? icon.enabled : icon.disabled);
            }
          }
        } else if (subMenu.id === 'MENU_NEW' && subMenu.submenu) {
          for (const subSubMenu of subMenu.submenu) {
            if (ids.includes(subSubMenu.id!)) {
              for (const key in updates) {
                subSubMenu[key] = updates[key];
              }

              if (typeof updates.enabled === 'boolean') {
                const id = ids.find(id => id === subSubMenu.id);
                if (id) {
                  const icon = icons[id as keyof typeof icons];
                  subSubMenu.icon = getIcon(updates.enabled ? icon.enabled : icon.disabled);
                }
              }
            }
          }
        }
      }
    }
    return stack;
  }

  private _configureWindow(windowInfo: WindowInfo) {
    const win = windowInfo.window;

    win.show();
    win.removeMenu();
    Menu.setApplicationMenu(windowInfo.menu || null);

    win.webContents.setWindowOpenHandler(() => {
      return {action: 'allow', overrideBrowserWindowOptions: {width: 1280, height: 720}};
    });
  }

  private _setWindowListeners(windowInfo: WindowInfo) {
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

  private _getIcon(): string {
    const iconPathArray = ['..', 'apps', 'ame', 'src', 'assets', 'img', 'png', 'aspect-model-editor-targetsize-192.png'];
    return path.join(__dirname, ...iconPathArray);
  }

  private _listenForWindowDataRequest() {
    const executeFn = (event: Electron.IpcMainEvent) => {
      console.log('RECEIVED REQUEST WINDOW DATA');
      const windowId = event.sender.id;
      const {id, options} = this._state.activeWindows.find(window => window.id === windowId) || {};
      if (!id) {
        return;
      }

      event.sender.send(EVENTS.RESPONSE_WINDOW_DATA, {id, options});
    };

    ipcMain.on(EVENTS.REQUEST_WINDOW_DATA, executeFn);
  }

  private _loadApplication({window, id}: WindowInfo) {
    if (inDevMode()) {
      return window.loadURL('http://localhost:4200').then(() => {
        window.webContents.openDevTools();
        console.log(`Window \x1b[36m${id}\x1b[0m created!`);
      });
    }
    return window.loadFile('./dist/apps/ame/index.html').then(() => console.log(`Window ${id} created!`));
  }

  private _handleClosingWindow(windowInfo: WindowInfo) {
    const {window} = windowInfo;
    window.show();
    window.webContents.send(EVENTS.REQUEST_IS_FILE_SAVED, windowInfo.id);
  }
}

export const windowsManager = new WindowsManager();
