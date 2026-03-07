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

import {BrowserWindow, globalShortcut} from 'electron';

type ShortcutAction = (win?: Electron.BrowserWindow) => void;

export interface Shortcut {
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

export function registerCommonShortcuts(): void {
  COMMON_SHORTCUTS.forEach(shortcut => {
    globalShortcut.register(shortcut.key, () => {
      const win = BrowserWindow.getFocusedWindow();
      shortcut.action(win);
    });
  });
}
