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
const {SIGNAL_VALIDATE_MODEL} = require('../events');

function validateSubmenu(translation) {
  return [
    {
      id: 'VALIDATE_MODEL',
      label: translation.CURRENT_MODEL,
      icon: getIcon(icons.VALIDATE_MODEL.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_VALIDATE_MODEL)
    }
  ];
}

module.exports = {validateSubmenu};
