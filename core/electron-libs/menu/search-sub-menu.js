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
const {SIGNAL_SEARCH_ELEMENTS, SIGNAL_SEARCH_FILES} = require('../events');

function searchSubmenu(translation) {
  return [
    {
      id: 'SEARCH_ELEMENTS',
      label: translation.ELEMENTS,
      icon: getIcon(icons.SEARCH_ELEMENTS.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SEARCH_ELEMENTS)
    },
    {
      id: 'SEARCH_FILES',
      label: translation.FILES,
      icon: getIcon(icons.SEARCH_FILES.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SEARCH_FILES)
    }
  ];
}

module.exports = {searchSubmenu};
