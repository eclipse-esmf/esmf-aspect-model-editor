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

import {BaseWindow, BrowserWindow, MenuItemConstructorOptions} from 'electron';
import {icons} from '../const/icons';
import {EVENTS} from '../events';
import {getIcon} from '../utils/icon-utils';
import {Translation} from './app';
import MenuItem = Electron.MenuItem;

export function edit(translation: Translation): MenuItemConstructorOptions[] {
  return [
    {
      id: 'OPEN_SELECTED_ELEMENT',
      label: translation.OPEN_SELECTED_ELEMENT,
      enabled: false,
      icon: getIcon(icons.OPEN_SELECTED_ELEMENT.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.OPEN_SELECTED_ELEMENT);
      },
    },
    {
      id: 'REMOVE_SELECTED_ELEMENT',
      label: translation.REMOVE_SELECTED_ELEMENT,
      enabled: false,
      icon: getIcon(icons.REMOVE_SELECTED_ELEMENT.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.REMOVE_SELECTED_ELEMENT);
      },
    },
    {
      id: 'COLLAPSE_EXPAND_MODEL',
      label: translation.COLLAPSE_EXPAND_MODEL,
      enabled: false,
      icon: getIcon(icons.COLLAPSE_EXPAND_MODEL.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.COLLAPSE_EXPAND_MODEL);
      },
    },
    {
      id: 'FORMAT_MODEL',
      label: translation.FORMAT_MODEL,
      enabled: false,
      icon: getIcon(icons.FORMAT_MODEL.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.FORMAT_MODEL);
      },
    },
    {
      id: 'CONNECT_ELEMENTS',
      label: translation.CONNECT_SELECTED_ELEMENTS,
      enabled: false,
      icon: getIcon(icons.CONNECT_ELEMENTS.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.CONNECT_ELEMENTS);
      },
    },
    {
      role: 'cut',
      accelerator: 'CommandOrControl+X',
      visible: false,
      acceleratorWorksWhenHidden: true,
    },
    {
      role: 'copy',
      accelerator: 'CommandOrControl+C',
      visible: false,
      acceleratorWorksWhenHidden: true,
    },
    {
      role: 'paste',
      accelerator: 'CommandOrControl+V',
      visible: false,
      acceleratorWorksWhenHidden: true,
    },
    {
      role: 'selectAll',
      accelerator: 'CommandOrControl+A',
      visible: false,
      acceleratorWorksWhenHidden: true,
    },
  ];
}

export default {editSubmenu: edit};
