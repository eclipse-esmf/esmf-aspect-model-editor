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

import {app, BrowserWindow, globalShortcut} from 'electron';
import platformData from './platform/platform';

type ShortcutAction = (win?: Electron.BrowserWindow) => void;
interface Shortcut {
  key: string;
  action: ShortcutAction;
}

const COMMON_SHORTCUTS: Shortcut[] = [
  {key: 'CommandOrControl+W', action: win => win?.close()},
  {key: 'CommandOrControl+M', action: win => win?.minimize()},
  {key: 'CommandOrControl+Shift+M', action: win => win?.maximize()},
  {key: 'CommandOrControl+Shift+F', action: win => win?.setFullScreen(true)},
  {key: 'CommandOrControl+Shift+G', action: win => win?.setFullScreen(false)},
  {key: 'CommandOrControl+Z', action: win => win?.webContents.undo()},
  {key: 'CommandOrControl+R', action: win => win?.reload()},
];

const MAC_SHORTCUTS: Shortcut[] = [
  {
    key: 'CommandOrControl+Q',
    action: () => {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        app.quit();
      }
    },
  },
  {
    key: 'Command+Option+I',
    action: () => {
      const win = BrowserWindow.getFocusedWindow();
      win?.webContents.openDevTools();
    },
  },
];

const DEVTOOLS_SHORTCUTS: Shortcut[] = [
  {
    key: 'Control+Shift+I',
    action: () => {
      const win = BrowserWindow.getFocusedWindow();
      win?.webContents.openDevTools();
    },
  },
];

function registerShortcut({key, action}: Shortcut): void {
  globalShortcut.register(key, () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (!focusedWindow && action.length > 0) {
      return;
    }
    if (action.length > 0) {
      action(focusedWindow);
    } else {
      action();
    }
  });
}

export function registerGlobalShortcuts(): void {
  COMMON_SHORTCUTS.forEach(registerShortcut);

  if (platformData.isMac) {
    MAC_SHORTCUTS.forEach(registerShortcut);
  }

  if (platformData.isWin || platformData.isLinux) {
    DEVTOOLS_SHORTCUTS.forEach(registerShortcut);
  }
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}
