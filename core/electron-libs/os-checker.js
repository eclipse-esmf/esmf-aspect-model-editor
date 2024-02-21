/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

module.exports = {
  os: process.platform,
  extension: process.platform === 'win32' ? 'win.exe' : process.platform === 'darwin' ? 'mac' : 'linux',
  isWin: process.platform === 'win32',
  isLinux: process.platform === 'linux',
  isMac: process.platform === 'darwin',
};
