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

const {icons} = require('../consts');
const {getIcon} = require('./utils');
const {
  SIGNAL_FILTER_MODEL_BY,
  SIGNAL_SHOW_HIDE_MINIMAP,
  SIGNAL_SHOW_HIDE_TOOLBAR,
  SIGNAL_ZOOM_IN,
  SIGNAL_ZOOM_OUT,
  SIGNAL_ZOOM_TO_ACTUAL,
  SIGNAL_ZOOM_TO_FIT
} = require('../events');

function viewSubmenu(translation) {
  return [
    {
      id: 'SHOW_HIDE_TOOLBAR',
      label: translation.TOGGLE_TOOLBAR,
      icon: getIcon(icons.SHOW_HIDE_TOOLBAR.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SHOW_HIDE_TOOLBAR)
    },
    {
      id: 'SHOW_HIDE_MINIMAP',
      label: translation.TOGGLE_MINIMAP,
      icon: getIcon(icons.SHOW_HIDE_MINIMAP.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SHOW_HIDE_MINIMAP)
    },
    {
      id: 'MENU_FILTER_MODEL_BY',
      label: translation.FILTER.LABEL,
      icon: getIcon(icons.MENU_FILTER_MODEL_BY.enabled),
      submenu: [
        {
          id: 'FILTER_MODEL_BY_NONE',
          label: translation.FILTER.SUBMENU.NONE,
          icon: getIcon(icons.FILTER_MODEL_BY_NONE.enabled),
          // Value must match "ModelFilter.DEFAULT" enum item
          click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_FILTER_MODEL_BY, 'default')
        },
        {
          id: 'FILTER_MODEL_BY_PROPERTIES',
          label: translation.FILTER.SUBMENU.PROPERTIES,
          icon: getIcon(icons.FILTER_MODEL_BY_PROPERTIES.enabled),
          // Value must match "ModelFilter.PROPERTIES" enum item
          click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_FILTER_MODEL_BY, 'properties')
        }
      ]
    },
    {
      type: 'separator'
    },
    {
      id: 'ZOOM_IN',
      label: translation.ZOOM_IN,
      icon: getIcon(icons.ZOOM_IN.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_ZOOM_IN)
    },
    {
      id: 'ZOOM_OUT',
      label: translation.ZOOM_OUT,
      icon: getIcon(icons.ZOOM_OUT.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_ZOOM_OUT)
    },
    {
      id: 'ZOOM_TO_FIT',
      label: translation.ZOOM_TO_FIT,
      icon: getIcon(icons.ZOOM_TO_FIT.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_ZOOM_TO_FIT)
    },
    {
      id: 'ZOOM_TO_ACTUAL',
      label: translation.ZOOM_TO_100,
      icon: getIcon(icons.ZOOM_TO_ACTUAL.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_ZOOM_TO_ACTUAL)
    }
  ];
}

module.exports = {viewSubmenu};
