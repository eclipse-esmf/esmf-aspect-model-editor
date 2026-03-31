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

import {describe, it, expect} from '@jest/globals';
import {EVENTS} from './events';

describe('EVENTS', () => {
  describe('REQUEST', () => {
    it('should define CREATE_WINDOW', () => {
      expect(EVENTS.REQUEST.CREATE_WINDOW).toBe('CREATE_WINDOW');
    });

    it('should define IS_FIRST_WINDOW', () => {
      expect(EVENTS.REQUEST.IS_FIRST_WINDOW).toBe('IS_FIRST_WINDOW');
    });

    it('should define WINDOW_DATA', () => {
      expect(EVENTS.REQUEST.WINDOW_DATA).toBe('WINDOW_DATA');
    });

    it('should define UPDATE_DATA', () => {
      expect(EVENTS.REQUEST.UPDATE_DATA).toBe('UPDATE_DATA');
    });

    it('should define MAXIMIZE_WINDOW', () => {
      expect(EVENTS.REQUEST.MAXIMIZE_WINDOW).toBe('MAXIMIZE_WINDOW');
    });

    it('should define IS_FILE_SAVED', () => {
      expect(EVENTS.REQUEST.IS_FILE_SAVED).toBe('IS_FILE_SAVED');
    });

    it('should define CLOSE_WINDOW', () => {
      expect(EVENTS.REQUEST.CLOSE_WINDOW).toBe('CLOSE_WINDOW');
    });

    it('should define SHOW_NOTIFICATION', () => {
      expect(EVENTS.REQUEST.SHOW_NOTIFICATION).toBe('SHOW_NOTIFICATION');
    });

    it('should define EDIT_ELEMENT', () => {
      expect(EVENTS.REQUEST.EDIT_ELEMENT).toBe('EDIT_ELEMENT');
    });

    it('should define REFRESH_WORKSPACE', () => {
      expect(EVENTS.REQUEST.REFRESH_WORKSPACE).toBe('REFRESH_WORKSPACE');
    });

    it('should have exactly 10 request events', () => {
      expect(Object.keys(EVENTS.REQUEST)).toHaveLength(10);
    });
  });

  describe('RESPONSE', () => {
    it('should define IS_FIRST_WINDOW', () => {
      expect(EVENTS.RESPONSE.IS_FIRST_WINDOW).toBe('IS_FIRST_WINDOW');
    });

    it('should define BACKEND_STARTUP_ERROR', () => {
      expect(EVENTS.RESPONSE.BACKEND_STARTUP_ERROR).toBe('BACKEND_STARTUP_ERROR');
    });

    it('should define WINDOW_DATA', () => {
      expect(EVENTS.RESPONSE.WINDOW_DATA).toBe('WINDOW_DATA');
    });

    it('should have exactly 3 response events', () => {
      expect(Object.keys(EVENTS.RESPONSE)).toHaveLength(3);
    });
  });

  describe('SIGNAL', () => {
    it('should define NEW_EMPTY_MODEL', () => {
      expect(EVENTS.SIGNAL.NEW_EMPTY_MODEL).toBe('NEW_EMPTY_MODEL');
    });

    it('should define LOAD_FILE', () => {
      expect(EVENTS.SIGNAL.LOAD_FILE).toBe('LOAD_FILE');
    });

    it('should define LOAD_FROM_TEXT', () => {
      expect(EVENTS.SIGNAL.LOAD_FROM_TEXT).toBe('LOAD_FROM_TEXT');
    });

    it('should define LOAD_SPECIFIC_FILE', () => {
      expect(EVENTS.SIGNAL.LOAD_SPECIFIC_FILE).toBe('LOAD_SPECIFIC_FILE');
    });

    it('should define NEW_WINDOW', () => {
      expect(EVENTS.SIGNAL.NEW_WINDOW).toBe('NEW_WINDOW');
    });

    it('should define IMPORT_TO_WORKSPACE', () => {
      expect(EVENTS.SIGNAL.IMPORT_TO_WORKSPACE).toBe('IMPORT_TO_WORKSPACE');
    });

    it('should define IMPORT_NAMESPACES', () => {
      expect(EVENTS.SIGNAL.IMPORT_NAMESPACES).toBe('IMPORT_NAMESPACES');
    });

    it('should define COPY_TO_CLIPBOARD', () => {
      expect(EVENTS.SIGNAL.COPY_TO_CLIPBOARD).toBe('COPY_TO_CLIPBOARD');
    });

    it('should define SAVE_TO_WORKSPACE', () => {
      expect(EVENTS.SIGNAL.SAVE_TO_WORKSPACE).toBe('SAVE_TO_WORKSPACE');
    });

    it('should define EXPORT_MODEL', () => {
      expect(EVENTS.SIGNAL.EXPORT_MODEL).toBe('EXPORT_MODEL');
    });

    it('should define EXPORT_NAMESPACES', () => {
      expect(EVENTS.SIGNAL.EXPORT_NAMESPACES).toBe('EXPORT_NAMESPACES');
    });

    it('should define VALIDATE_MODEL', () => {
      expect(EVENTS.SIGNAL.VALIDATE_MODEL).toBe('VALIDATE_MODEL');
    });

    it('should define GENERATE_HTML_DOCUMENTATION', () => {
      expect(EVENTS.SIGNAL.GENERATE_HTML_DOCUMENTATION).toBe('GENERATE_HTML_DOCUMENTATION');
    });

    it('should define GENERATE_OPEN_API_SPECIFICATION', () => {
      expect(EVENTS.SIGNAL.GENERATE_OPEN_API_SPECIFICATION).toBe('GENERATE_OPEN_API_SPECIFICATION');
    });

    it('should define GENERATE_ASYNC_API_SPECIFICATION', () => {
      expect(EVENTS.SIGNAL.GENERATE_ASYNC_API_SPECIFICATION).toBe('GENERATE_ASYNC_API_SPECIFICATION');
    });

    it('should define GENERATE_AASX_XML', () => {
      expect(EVENTS.SIGNAL.GENERATE_AASX_XML).toBe('GENERATE_AASX_XML');
    });

    it('should define GENERATE_JSON_PAYLOAD', () => {
      expect(EVENTS.SIGNAL.GENERATE_JSON_PAYLOAD).toBe('GENERATE_JSON_PAYLOAD');
    });

    it('should define GENERATE_JSON_SCHEMA', () => {
      expect(EVENTS.SIGNAL.GENERATE_JSON_SCHEMA).toBe('GENERATE_JSON_SCHEMA');
    });

    it('should define ZOOM_IN', () => {
      expect(EVENTS.SIGNAL.ZOOM_IN).toBe('ZOOM_IN');
    });

    it('should define ZOOM_OUT', () => {
      expect(EVENTS.SIGNAL.ZOOM_OUT).toBe('ZOOM_OUT');
    });

    it('should define ZOOM_TO_FIT', () => {
      expect(EVENTS.SIGNAL.ZOOM_TO_FIT).toBe('ZOOM_TO_FIT');
    });

    it('should define ZOOM_TO_ACTUAL', () => {
      expect(EVENTS.SIGNAL.ZOOM_TO_ACTUAL).toBe('ZOOM_TO_ACTUAL');
    });

    it('should define SHOW_HIDE_TOOLBAR', () => {
      expect(EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR).toBe('SHOW_HIDE_TOOLBAR');
    });

    it('should define SHOW_HIDE_MINIMAP', () => {
      expect(EVENTS.SIGNAL.SHOW_HIDE_MINIMAP).toBe('SHOW_HIDE_MINIMAP');
    });

    it('should define FILTER_MODEL_BY', () => {
      expect(EVENTS.SIGNAL.FILTER_MODEL_BY).toBe('FILTER_MODEL_BY');
    });

    it('should define SEARCH_ELEMENTS', () => {
      expect(EVENTS.SIGNAL.SEARCH_ELEMENTS).toBe('SEARCH_ELEMENTS');
    });

    it('should define SEARCH_FILES', () => {
      expect(EVENTS.SIGNAL.SEARCH_FILES).toBe('SEARCH_FILES');
    });

    it('should define UPDATE_MENU_ITEM', () => {
      expect(EVENTS.SIGNAL.UPDATE_MENU_ITEM).toBe('UPDATE_MENU_ITEM');
    });

    it('should define TRANSLATE_MENU_ITEMS', () => {
      expect(EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS).toBe('TRANSLATE_MENU_ITEMS');
    });

    it('should define SHOW_CONTEXT_MENU', () => {
      expect(EVENTS.SIGNAL.SHOW_CONTEXT_MENU).toBe('SHOW_CONTEXT_MENU');
    });

    it('should define OPEN_PRINT_WINDOW', () => {
      expect(EVENTS.SIGNAL.OPEN_PRINT_WINDOW).toBe('OPEN_PRINT_WINDOW');
    });

    it('should define WRITE_PRINT_FILE', () => {
      expect(EVENTS.SIGNAL.WRITE_PRINT_FILE).toBe('WRITE_PRINT_FILE');
    });
  });

  describe('immutability', () => {
    it('EVENTS should be a const object (not reassignable at runtime)', () => {
      expect(EVENTS).toBeDefined();
      expect(typeof EVENTS).toBe('object');
    });

    it('EVENTS.REQUEST keys should all have matching string values', () => {
      for (const [key, value] of Object.entries(EVENTS.REQUEST)) {
        expect(value).toBe(key);
      }
    });

    it('EVENTS.RESPONSE keys should all have matching string values', () => {
      for (const [key, value] of Object.entries(EVENTS.RESPONSE)) {
        expect(value).toBe(key);
      }
    });

    it('EVENTS.SIGNAL keys should all have matching string values', () => {
      for (const [key, value] of Object.entries(EVENTS.SIGNAL)) {
        expect(value).toBe(key);
      }
    });
  });
});
