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

  // Data events
  REQUEST_WINDOW_DATA: 'REQUEST_WINDOW_DATA',
  RESPONSE_WINDOW_DATA: 'RESPONSE_WINDOW_DATA',
  REQUEST_UPDATE_DATA: 'REQUEST_UPDATE_DATA',

  // Maximize window events
  REQUEST_MAXIMIZE_WINDOW: 'REQUEST_MAXIMIZE_WINDOW',
  RESPONSE_MAXIMIZE_WINDOW: 'RESPONSE_MAXIMIZE_WINDOW',

  // Closing window events
  REQUEST_IS_FILE_SAVED: 'REQUEST_IS_FILE_SAVED',
  REQUEST_CLOSE_WINDOW: 'REQUEST_CLOSE_WINDOW',

  // Notification requests
  REQUEST_SHOW_NOTIFICATION: 'REQUEST_SHOW_NOTIFICATION',

  // Highlight element
  REQUEST_EDIT_ELEMENT: 'REQUEST_EDIT_ELEMENT',

  // Refresh workspace
  REQUEST_REFRESH_WORKSPACE: 'REQUEST_REFRESH_WORKSPACE',
  SIGNAL_REFRESH_WORKSPACE: 'SIGNAL_REFRESH_WORKSPACE',

  // Request lock file
  REQUEST_LOCK_FILE: 'REQUEST_LOCK_FILE',

  // Request lock file
  REQUEST_UNLOCK_FILE: 'REQUEST_UNLOCK_FILE',

  // add/remove locks
  REQUEST_ADD_LOCK: 'REQUEST_ADD_LOCK',
  REQUEST_REMOVE_LOCK: 'REQUEST_REMOVE_LOCK',
  REQUEST_LOCKED_FILES: 'REQUEST_LOCKED_FILES',
  RESPONSE_LOCKED_FILES: 'RESPONSE_LOCKED_FILES',

  // Window state
  SIGNAL_WINDOW_FOCUS: 'SIGNAL_WINDOW_FOCUS',

  // App menu actions
  SIGNAL_NEW_EMPTY_MODEL: 'SIGNAL_NEW_EMPTY_MODEL',
  SIGNAL_LOAD_FILE: 'SIGNAL_LOAD_FILE',
  SIGNAL_LOAD_FROM_TEXT: 'SIGNAL_LOAD_FROM_TEXT',
  SIGNAL_LOAD_SPECIFIC_FILE: 'SIGNAL_LOAD_SPECIFIC_FILE',
  SIGNAL_NEW_WINDOW: 'SIGNAL_NEW_WINDOW',
  SIGNAL_IMPORT_TO_WORKSPACE: 'SIGNAL_IMPORT_TO_WORKSPACE',
  SIGNAL_IMPORT_NAMESPACES: 'SIGNAL_IMPORT_NAMESPACES',
  SIGNAL_COPY_TO_CLIPBOARD: 'SIGNAL_COPY_TO_CLIPBOARD',
  SIGNAL_SAVE_TO_WORKSPACE: 'SIGNAL_SAVE_TO_WORKSPACE',
  SIGNAL_EXPORT_MODEL: 'SIGNAL_EXPORT_MODEL',
  SIGNAL_EXPORT_NAMESPACES: 'SIGNAL_EXPORT_NAMESPACES',
  SIGNAL_SHOW_HIDE_TOOLBAR: 'SIGNAL_SHOW_HIDE_TOOLBAR',
  SIGNAL_SHOW_HIDE_MINIMAP: 'SIGNAL_SHOW_HIDE_MINIMAP',
  SIGNAL_FILTER_MODEL_BY: 'SIGNAL_FILTER_MODEL_BY',
  SIGNAL_ZOOM_IN: 'SIGNAL_ZOOM_IN',
  SIGNAL_ZOOM_OUT: 'SIGNAL_ZOOM_OUT',
  SIGNAL_ZOOM_TO_FIT: 'SIGNAL_ZOOM_TO_FIT',
  SIGNAL_ZOOM_TO_ACTUAL: 'SIGNAL_ZOOM_TO_ACTUAL',
  SIGNAL_OPEN_SELECTED_ELEMENT: 'SIGNAL_OPEN_SELECTED_ELEMENT',
  SIGNAL_REMOVE_SELECTED_ELEMENT: 'SIGNAL_REMOVE_SELECTED_ELEMENT',
  SIGNAL_COLLAPSE_EXPAND_MODEL: 'SIGNAL_COLLAPSE_EXPAND_MODEL',
  SIGNAL_FORMAT_MODEL: 'SIGNAL_FORMAT_MODEL',
  SIGNAL_CONNECT_ELEMENTS: 'SIGNAL_CONNECT_ELEMENTS',
  SIGNAL_SEARCH_ELEMENT: 'SIGNAL_SEARCH_ELEMENT',
  SIGNAL_VALIDATE_MODEL: 'SIGNAL_VALIDATE_MODEL',
  SIGNAL_GENERATE_HTML_DOCUMENTATION: 'SIGNAL_GENERATE_HTML_DOCUMENTATION',
  SIGNAL_GENERATE_OPEN_API_SPECIFICATION: 'SIGNAL_GENERATE_OPEN_API_SPECIFICATION',
  SIGNAL_GENERATE_AASX_XML: 'SIGNAL_GENERATE_AASX_XML',
  SIGNAL_GENERATE_JSON_PAYLOAD: 'SIGNAL_GENERATE_JSON_PAYLOAD',
  SIGNAL_GENERATE_JSON_SCHEMA: 'SIGNAL_GENERATE_JSON_SCHEMA',
  SIGNAL_SEARCH_ELEMENTS: 'SIGNAL_SEARCH_ELEMENTS',
  SIGNAL_SEARCH_FILES: 'SIGNAL_SEARCH_FILES',

  // App menu updates
  SIGNAL_UPDATE_MENU_ITEM: 'SIGNAL_UPDATE_MENU_ITEM',
};
