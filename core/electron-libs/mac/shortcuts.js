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

const {app, globalShortcut, BrowserWindow, Menu, nativeTheme} = require('electron');

function registerMacSpecificShortcuts() {
  globalShortcut.register('CommandOrControl+Q', () => {
    if (BrowserWindow.getFocusedWindow()) {
      app.quit();
    }
  });

  globalShortcut.register('CommandOrControl+W', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().close();
    }
  });

  globalShortcut.register('CommandOrControl+M', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().minimize();
    }
  });

  globalShortcut.register('CommandOrControl+R', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().reload();
    }
  });

  globalShortcut.register('Command+Option+I', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().webContents.openDevTools();
    }
  });

  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
    }
  });

  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().maximize();
    }
  });

  globalShortcut.register('CommandOrControl+Shift+F', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().setFullScreen(true);
    }
  });

  globalShortcut.register('CommandOrControl+Shift+G', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().setFullScreen(false);
    }
  });
}

function unregisterMacSpecificShortcuts() {
  globalShortcut.unregister('CommandOrControl+Q', () => {
    if (BrowserWindow.getFocusedWindow()) {
      app.quit();
    }
  });

  globalShortcut.unregister('CommandOrControl+W', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().close();
    }
  });

  globalShortcut.unregister('CommandOrControl+M', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().minimize();
    }
  });

  globalShortcut.unregister('CommandOrControl+R', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().reload();
    }
  });

  globalShortcut.unregister('Command+Option+I', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().webContents.openDevTools();
    }
  });

  globalShortcut.unregister('CommandOrControl+Shift+R', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().webContents.reloadIgnoringCache();
    }
  });

  globalShortcut.unregister('CommandOrControl+Shift+M', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().maximize();
    }
  });

  globalShortcut.unregister('CommandOrControl+Shift+F', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().setFullScreen(true);
    }
  });

  globalShortcut.unregister('CommandOrControl+Shift+G', () => {
    if (BrowserWindow.getFocusedWindow()) {
      BrowserWindow.getFocusedWindow().setFullScreen(false);
    }
  });
}

module.exports = {
  registerMacSpecificShortcuts,
  unregisterMacSpecificShortcuts,
};
