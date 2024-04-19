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
  SIGNAL_GENERATE_AASX_XML,
  SIGNAL_GENERATE_HTML_DOCUMENTATION,
  SIGNAL_GENERATE_JSON_PAYLOAD,
  SIGNAL_GENERATE_JSON_SCHEMA,
  SIGNAL_GENERATE_OPEN_API_SPECIFICATION,
  SIGNAL_GENERATE_ASYNC_API_SPECIFICATION,
} = require('../events');
const {getIcon} = require('./utils');

function generateSubmenu(translation) {
  return [
    {
      id: 'GENERATE_HTML_DOCUMENTATION',
      label: translation.HTML_DOCUMENTATION,
      icon: getIcon(icons.GENERATE_HTML_DOCUMENTATION.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_HTML_DOCUMENTATION),
    },
    {
      id: 'GENERATE_OPEN_API_SPECIFICATION',
      label: translation.OPEN_API_SPECIFICATION,
      icon: getIcon(icons.GENERATE_OPEN_API_SPECIFICATION.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_OPEN_API_SPECIFICATION),
    },
    {
      id: 'GENERATE_ASYNC_API_SPECIFICATION',
      label: translation.ASYNC_API_SPECIFICATION,
      icon: getIcon(icons.GENERATE_ASYNC_API_SPECIFICATION.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_ASYNC_API_SPECIFICATION),
    },
    {
      id: 'GENERATE_AASX_XML',
      label: translation.AASX_XML,
      icon: getIcon(icons.GENERATE_AASX_XML.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_AASX_XML),
    },
    {
      type: 'separator',
    },
    {
      id: 'GENERATE_JSON_PAYLOAD',
      label: translation.SAMPLE_JSON_PAYLOAD,
      icon: getIcon(icons.GENERATE_JSON_PAYLOAD.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_JSON_PAYLOAD),
    },
    {
      id: 'GENERATE_JSON_SCHEMA',
      label: translation.JSON_SCHEMA,
      icon: getIcon(icons.GENERATE_JSON_SCHEMA.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_JSON_SCHEMA),
    },
  ];
}

module.exports = {generateSubmenu};
