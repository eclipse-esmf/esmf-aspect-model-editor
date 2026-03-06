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
      label: translation.MENU.FILE.LABEL,
      submenu: file(translation.MENU.FILE),
    },
    {
      id: 'MENU_VIEW',
      label: translation.MENU.VIEW.LABEL,
      submenu: view(translation.MENU.VIEW),
    },
    {
      id: 'MENU_EDIT',
      label: translation.MENU.EDIT.LABEL,
      submenu: edit(translation.MENU.EDIT),
    },
    {
      id: 'MENU_VALIDATE',
      label: translation.MENU.VALIDATE.LABEL,
      submenu: validate(translation.MENU.VALIDATE),
    },
    {
      id: 'MENU_GENERATE',
      label: translation.MENU.GENERATE.LABEL,
      submenu: generate(translation.MENU.GENERATE),
    },
    {
      id: 'MENU_SEARCH',
      label: translation.MENU.SEARCH.LABEL,
      submenu: search(translation.MENU.SEARCH),
    },
  ];
}

export default {appMenuTemplate};
