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
import {EVENTS} from '../events/events';
import {getIcon} from '../utils/icon-utils';
import {Translation} from './app';

export function generate(translation: Translation): MenuItemConstructorOptions[] {
  return [
    {
      id: 'GENERATE_HTML_DOCUMENTATION',
      label: translation.HTML_DOCUMENTATION,
      enabled: false,
      icon: getIcon(icons.GENERATE_HTML_DOCUMENTATION.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.GENERATE_HTML_DOCUMENTATION);
      },
    },
    {
      id: 'GENERATE_OPEN_API_SPECIFICATION',
      label: translation.OPEN_API_SPECIFICATION,
      enabled: false,
      icon: getIcon(icons.GENERATE_OPEN_API_SPECIFICATION.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.GENERATE_OPEN_API_SPECIFICATION);
      },
    },
    {
      id: 'GENERATE_ASYNC_API_SPECIFICATION',
      label: translation.ASYNC_API_SPECIFICATION,
      enabled: false,
      icon: getIcon(icons.GENERATE_ASYNC_API_SPECIFICATION.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.GENERATE_ASYNC_API_SPECIFICATION);
      },
    },
    {
      id: 'GENERATE_AASX_XML',
      label: translation.AASX_XML,
      enabled: false,
      icon: getIcon(icons.GENERATE_AASX_XML.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.GENERATE_AASX_XML);
      },
    },
    {
      type: 'separator',
    },
    {
      id: 'GENERATE_JSON_PAYLOAD',
      label: translation.SAMPLE_JSON_PAYLOAD,
      enabled: false,
      icon: getIcon(icons.GENERATE_JSON_PAYLOAD.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.GENERATE_JSON_PAYLOAD);
      },
    },
    {
      id: 'GENERATE_JSON_SCHEMA',
      label: translation.JSON_SCHEMA,
      enabled: false,
      icon: getIcon(icons.GENERATE_JSON_SCHEMA.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.GENERATE_JSON_SCHEMA);
      },
    },
  ];
}

export default {generateSubmenu: generate};
