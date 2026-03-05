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

import {globalShortcut} from 'electron';
import platformData from '../platform/platform';
import {registerCommonShortcuts} from './common';
import {registerMacShortcuts} from './mac';
import {registerWindowsLinuxShortcuts} from './windows-linux';

export function registerGlobalShortcuts(): void {
  registerCommonShortcuts();

  if (platformData.isMac) {
    registerMacShortcuts();
  } else if (platformData.isWin || platformData.isLinux) {
    registerWindowsLinuxShortcuts();
  }
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}
