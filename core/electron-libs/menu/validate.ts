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
import {EVENTS} from '../events';
import {getIcon} from '../utils/icon-utils';
import {Translation} from './app';

export function validate(translation: Translation): MenuItemConstructorOptions[] {
  return [
    {
      id: 'VALIDATE_MODEL',
      label: translation.CURRENT_MODEL,
      enabled: false,
      icon: getIcon(icons.VALIDATE_MODEL.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.VALIDATE_MODEL);
      },
    },
  ];
}

export default {validateSubmenu: validate};
