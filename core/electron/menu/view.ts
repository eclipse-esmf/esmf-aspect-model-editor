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

export function view(translation: Translation): MenuItemConstructorOptions[] {
  return [
    {
      id: 'SHOW_HIDE_TOOLBAR',
      label: translation.toggleToolbar,
      icon: getIcon(icons.SHOW_HIDE_TOOLBAR.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR);
      },
    },
    {
      id: 'SHOW_HIDE_MINIMAP',
      label: translation.toggleMinimap,
      icon: getIcon(icons.SHOW_HIDE_MINIMAP.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.SHOW_HIDE_MINIMAP);
      },
    },
    {
      id: 'MENU_FILTER_MODEL_BY',
      label: translation.filter.label,
      enabled: false,
      icon: getIcon(icons.MENU_FILTER_MODEL_BY.enabled),
      submenu: [
        {
          id: 'FILTER_MODEL_BY_NONE',
          label: translation.filter.submenu.none,
          icon: getIcon(icons.FILTER_MODEL_BY_NONE.enabled),
          click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
            const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
            bw?.webContents.send(EVENTS.SIGNAL.FILTER_MODEL_BY, 'default');
          },
        },
        {
          id: 'FILTER_MODEL_BY_PROPERTIES',
          label: translation.filter.submenu.properties,
          icon: getIcon(icons.FILTER_MODEL_BY_PROPERTIES.enabled),
          click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
            const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
            bw?.webContents.send(EVENTS.SIGNAL.FILTER_MODEL_BY, 'properties');
          },
        },
      ],
    },
    {
      type: 'separator',
    },
    {
      id: 'ZOOM_IN',
      label: translation.zoomIn,
      enabled: false,
      icon: getIcon(icons.ZOOM_IN.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.ZOOM_IN);
      },
    },
    {
      id: 'ZOOM_OUT',
      label: translation.zoomOut,
      enabled: false,
      icon: getIcon(icons.ZOOM_OUT.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.ZOOM_OUT);
      },
    },
    {
      id: 'ZOOM_TO_FIT',
      label: translation.zoomToFit,
      enabled: false,
      icon: getIcon(icons.ZOOM_TO_FIT.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.ZOOM_TO_FIT);
      },
    },
    {
      id: 'ZOOM_TO_ACTUAL',
      label: translation.zoomTo100,
      enabled: false,
      icon: getIcon(icons.ZOOM_TO_ACTUAL.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.ZOOM_TO_ACTUAL);
      },
    },
  ];
}

export default {viewSubmenu: view};
