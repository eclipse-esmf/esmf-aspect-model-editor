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

module.exports = {
  app: {
    getPath: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    on: jest.fn(),
    webContents: {send: jest.fn()},
  })),
};
