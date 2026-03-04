/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

export const os: NodeJS.Platform = process.platform;

export const isWin = os === 'win32';
export const isMac = os === 'darwin';
export const isLinux = os === 'linux';

export const extension = isWin ? 'win.exe' : isMac ? 'mac' : 'linux';

export default {
  os,
  extension,
  isWin,
  isLinux,
  isMac,
};
