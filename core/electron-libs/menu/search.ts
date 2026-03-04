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

import {BaseWindow, BrowserWindow, MenuItem, MenuItemConstructorOptions} from 'electron';
import {icons} from '../const/icons';
import {EVENTS} from '../events';
import {getIcon} from '../utils/icon-utils';
import {Translation} from './app';

export function search(translation: Translation): MenuItemConstructorOptions[] {
  return [
    {
      id: 'SEARCH_ELEMENTS',
      label: translation.ELEMENTS,
      enabled: false,
      icon: getIcon(icons.SEARCH_ELEMENTS.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL_SEARCH_ELEMENTS);
      },
    },
    {
      id: 'SEARCH_FILES',
      label: translation.FILES,
      icon: getIcon(icons.SEARCH_FILES.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL_SEARCH_FILES);
      },
    },
  ];
}

export default {searchSubmenu: search};
