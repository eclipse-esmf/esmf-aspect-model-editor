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
import {Shortcut} from './common';

const MAC_SHORTCUTS: Shortcut[] = [
  {
    key: 'CommandOrControl+Q',
    action: () => app.quit(),
  },
  {
    key: 'Command+Option+I',
    action: () => BrowserWindow.getFocusedWindow()?.webContents.openDevTools(),
  },
];

export function registerMacShortcuts(): void {
  MAC_SHORTCUTS.forEach(shortcut => {
    globalShortcut.register(shortcut.key, () => {
      shortcut.action(BrowserWindow.getFocusedWindow());
    });
  });
}
