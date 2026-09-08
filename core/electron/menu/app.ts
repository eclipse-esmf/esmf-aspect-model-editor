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

import {MenuItem, MenuItemConstructorOptions} from 'electron';
import {isMac} from '../platform/platform';
import {edit} from './edit';
import {file} from './file';
import {generate} from './generate';
import {search} from './search';
import {validate} from './validate';
import {view} from './view';

export interface Translation {
  [key: string]: any;
}

export function appMenuTemplate(translation: Translation): Array<MenuItemConstructorOptions | MenuItem> {
  return [
    ...(isMac
      ? [
          {
            role: 'appMenu',
          } as MenuItemConstructorOptions,
        ]
      : []),
    {
      id: 'MENU_FILE',
      label: translation.menu.file.label,
      submenu: file(translation.menu.file),
    },
    {
      id: 'MENU_VIEW',
      label: translation.menu.view.label,
      submenu: view(translation.menu.view),
    },
    {
      id: 'MENU_EDIT',
      label: translation.menu.edit.label,
      submenu: edit(translation.menu.edit),
    },
    {
      id: 'MENU_VALIDATE',
      label: translation.menu.validate.label,
      submenu: validate(translation.menu.validate),
    },
    {
      id: 'MENU_GENERATE',
      label: translation.menu.generate.label,
      submenu: generate(translation.menu.generate),
    },
    {
      id: 'MENU_SEARCH',
      label: translation.menu.search.label,
      submenu: search(translation.menu.search),
    },
  ];
}

export default {appMenuTemplate};
