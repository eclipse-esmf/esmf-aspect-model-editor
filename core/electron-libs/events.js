/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
  // Create window events
  REQUEST_CREATE_WINDOW: 'REQUEST_CREATE_WINDOW',
  RESPONSE_CREATE_WINDOW: 'RESPONSE_CREATE_WINDOW',

  // Is first window events
  REQUEST_IS_FIRST_WINDOW: 'REQUEST_IS_FIRST_WINDOW',
  RESPONSE_IS_FIRST_WINDOW: 'RESPONSE_IS_FIRST_WINDOW',

  // Has backend error events
  REQUEST_BACKEND_STARTUP_ERROR: 'REQUEST_BACKEND_STARTUP_ERROR',
  RESPONSE_BACKEND_STARTUP_ERROR: 'RESPONSE_BACKEND_STARTUP_ERROR',

  // Startup data events
  REQUEST_STARTUP_DATA: 'REQUEST_STARTUP_DATA',
  RESPONSE_STARTUP_DATA: 'RESPONSE_STARTUP_DATA',
  REQUEST_UPDATE_DATA: 'REQUEST_UPDATE_DATA',

  // Maximize window events
  REQUEST_MAXIMIZE_WINDOW: 'REQUEST_MAXIMIZE_WINDOW',
  RESPONSE_MAXIMIZE_WINDOW: 'RESPONSE_MAXIMIZE_WINDOW',

  // Closing window events
  REQUEST_IS_FILE_SAVED: 'REQUEST_IS_FILE_SAVED',
  REQUEST_CLOSE_WINDOW: 'REQUEST_CLOSE_WINDOW',

  // Notification requests
  REQUEST_SHOW_NOTIFICATION: 'REQUEST_SHOW_NOTIFICATION',
};
