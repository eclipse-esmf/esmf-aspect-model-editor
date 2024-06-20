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
const {
  SIGNAL_COLLAPSE_EXPAND_MODEL,
  SIGNAL_CONNECT_ELEMENTS,
  SIGNAL_FORMAT_MODEL,
  SIGNAL_OPEN_SELECTED_ELEMENT,
  SIGNAL_REMOVE_SELECTED_ELEMENT,
} = require('../events');
const {getIcon} = require('./utils');

function editSubmenu(translation) {
  return [
    {
      id: 'OPEN_SELECTED_ELEMENT',
      label: translation.OPEN_SELECTED_ELEMENT,
      enabled: true,
      icon: getIcon(icons.OPEN_SELECTED_ELEMENT.disabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_OPEN_SELECTED_ELEMENT),
    },
    {
      id: 'REMOVE_SELECTED_ELEMENT',
      label: translation.REMOVE_SELECTED_ELEMENT,
      enabled: true,
      icon: getIcon(icons.REMOVE_SELECTED_ELEMENT.disabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_REMOVE_SELECTED_ELEMENT),
    },
    {
      id: 'COLLAPSE_EXPAND_MODEL',
      label: translation.COLLAPSE_EXPAND_MODEL,
      icon: getIcon(icons.COLLAPSE_EXPAND_MODEL.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_COLLAPSE_EXPAND_MODEL),
    },
    {
      id: 'FORMAT_MODEL',
      label: translation.FORMAT_MODEL,
      icon: getIcon(icons.FORMAT_MODEL.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_FORMAT_MODEL),
    },
    {
      id: 'CONNECT_ELEMENTS',
      label: translation.CONNECT_SELECTED_ELEMENTS,
      enabled: true,
      icon: getIcon(icons.CONNECT_ELEMENTS.disabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_CONNECT_ELEMENTS),
    },
  ];
}

module.exports = {editSubmenu};
