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

const {isMac} = require('../os-checker');
const {fileSubmenu} = require('./file-sub-menu');
const {viewSubmenu} = require('./view-sub-menu');
const {editSubmenu} = require('./edit-sub-menu');
const {validateSubmenu} = require('./validate-sub-menu');
const {generateSubmenu} = require('./generate-sub-menu');
const {searchSubmenu} = require('./search-sub-menu');

/**
 * @returns {Array<MenuItemConstructorOptions | MenuItem>}
 */
function appMenuTemplate(translation) {
  return [
    ...(isMac
      ? [
          {
            role: 'appMenu',
          },
        ]
      : []),
    {
      id: 'MENU_FILE',
      label: translation.MENU.FILE.LABEL,
      submenu: fileSubmenu(translation.MENU.FILE),
    },
    {
      id: 'MENU_VIEW',
      label: translation.MENU.VIEW.LABEL,
      submenu: viewSubmenu(translation.MENU.VIEW),
    },
    {
      id: 'MENU_EDIT',
      label: translation.MENU.EDIT.LABEL,
      submenu: editSubmenu(translation.MENU.EDIT),
    },
    {
      id: 'MENU_VALIDATE',
      label: translation.MENU.VALIDATE.LABEL,
      submenu: validateSubmenu(translation.MENU.VALIDATE),
    },
    {
      id: 'MENU_GENERATE',
      label: translation.MENU.GENERATE.LABEL,
      submenu: generateSubmenu(translation.MENU.GENERATE),
    },
    {
      id: 'MENU_SEARCH',
      label: translation.MENU.SEARCH.LABEL,
      submenu: searchSubmenu(translation.MENU.SEARCH),
    },
  ];
}

module.exports = {appMenuTemplate};
