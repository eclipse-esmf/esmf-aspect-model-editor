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

import {describe, it, expect, beforeEach, jest} from '@jest/globals';
import {BrowserWindow} from 'electron';
import {EVENTS} from '../events/events';
import {generate} from './generate';

jest.mock('electron', () => ({
  BrowserWindow: Object.assign(jest.fn(), {getFocusedWindow: jest.fn()}),
}));

jest.mock('../utils/icon-utils', () => ({
  getIcon: jest.fn(() => 'mock-icon'),
}));

jest.mock('../const/icons', () => ({
  icons: new Proxy({}, {get: () => ({enabled: 'icon-path', disabled: 'icon-path-disabled'})}),
}));

const mockedGetFocusedWindow = BrowserWindow.getFocusedWindow as unknown as jest.MockedFunction<(...args: any[]) => any>;

const mockSend = jest.fn();
const mockWin = {webContents: {send: mockSend}};

const translation = {
  HTML_DOCUMENTATION: 'HTML Documentation',
  OPEN_API_SPECIFICATION: 'Open API Specification',
  ASYNC_API_SPECIFICATION: 'Async API Specification',
  AASX_XML: 'AASX XML',
  SAMPLE_JSON_PAYLOAD: 'Sample JSON Payload',
  JSON_SCHEMA: 'JSON Schema',
};

describe('generate menu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should return 7 menu items (6 items + 1 separator)', () => {
    const items = generate(translation);

    expect(items).toHaveLength(7);
  });

  it('should include GENERATE_HTML_DOCUMENTATION as disabled', () => {
    const items = generate(translation);
    const item = items.find(i => i.id === 'GENERATE_HTML_DOCUMENTATION');

    expect(item).toBeDefined();
    expect(item!.label).toBe('HTML Documentation');
    expect(item!.enabled).toBe(false);
  });

  it('should include GENERATE_OPEN_API_SPECIFICATION as disabled', () => {
    const items = generate(translation);
    const item = items.find(i => i.id === 'GENERATE_OPEN_API_SPECIFICATION');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Open API Specification');
    expect(item!.enabled).toBe(false);
  });

  it('should include GENERATE_ASYNC_API_SPECIFICATION as disabled', () => {
    const items = generate(translation);
    const item = items.find(i => i.id === 'GENERATE_ASYNC_API_SPECIFICATION');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Async API Specification');
    expect(item!.enabled).toBe(false);
  });

  it('should include GENERATE_AASX_XML as disabled', () => {
    const items = generate(translation);
    const item = items.find(i => i.id === 'GENERATE_AASX_XML');

    expect(item).toBeDefined();
    expect(item!.label).toBe('AASX XML');
    expect(item!.enabled).toBe(false);
  });

  it('should include a separator', () => {
    const items = generate(translation);

    expect(items.find(i => i.type === 'separator')).toBeDefined();
  });

  it('should include GENERATE_JSON_PAYLOAD as disabled', () => {
    const items = generate(translation);
    const item = items.find(i => i.id === 'GENERATE_JSON_PAYLOAD');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Sample JSON Payload');
    expect(item!.enabled).toBe(false);
  });

  it('should include GENERATE_JSON_SCHEMA as disabled', () => {
    const items = generate(translation);
    const item = items.find(i => i.id === 'GENERATE_JSON_SCHEMA');

    expect(item).toBeDefined();
    expect(item!.label).toBe('JSON Schema');
    expect(item!.enabled).toBe(false);
  });

  describe('click handlers', () => {
    function getClickHandler(id: string) {
      const items = generate(translation);
      return (items.find(i => i.id === id) as any)?.click;
    }

    it('GENERATE_HTML_DOCUMENTATION click should send correct event', () => {
      getClickHandler('GENERATE_HTML_DOCUMENTATION')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.GENERATE_HTML_DOCUMENTATION);
    });

    it('GENERATE_OPEN_API_SPECIFICATION click should send correct event', () => {
      getClickHandler('GENERATE_OPEN_API_SPECIFICATION')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.GENERATE_OPEN_API_SPECIFICATION);
    });

    it('GENERATE_ASYNC_API_SPECIFICATION click should send correct event', () => {
      getClickHandler('GENERATE_ASYNC_API_SPECIFICATION')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.GENERATE_ASYNC_API_SPECIFICATION);
    });

    it('GENERATE_AASX_XML click should send correct event', () => {
      getClickHandler('GENERATE_AASX_XML')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.GENERATE_AASX_XML);
    });

    it('GENERATE_JSON_PAYLOAD click should send correct event', () => {
      getClickHandler('GENERATE_JSON_PAYLOAD')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.GENERATE_JSON_PAYLOAD);
    });

    it('GENERATE_JSON_SCHEMA click should send correct event', () => {
      getClickHandler('GENERATE_JSON_SCHEMA')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.GENERATE_JSON_SCHEMA);
    });

    it('click handler should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      expect(() => getClickHandler('GENERATE_HTML_DOCUMENTATION')(null, undefined)).not.toThrow();
    });
  });
});
