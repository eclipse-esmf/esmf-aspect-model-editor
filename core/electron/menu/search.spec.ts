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

import {BrowserWindow} from 'electron';
import {beforeEach, describe, expect, it, MockedFunction, vi} from 'vitest';
import {EVENTS} from '../events/events';
import {search} from './search';

vi.mock('electron', () => ({
  BrowserWindow: Object.assign(vi.fn(), {getFocusedWindow: vi.fn()}),
}));

vi.mock('../utils/icon-utils', () => ({
  getIcon: vi.fn(() => 'mock-icon'),
}));

vi.mock('../const/icons', () => ({
  icons: new Proxy({}, {get: () => ({enabled: 'icon-path', disabled: 'icon-path-disabled'})}),
}));

const mockedGetFocusedWindow = BrowserWindow.getFocusedWindow as unknown as MockedFunction<(...args: any[]) => any>;

const mockSend = vi.fn();
const mockWin = {webContents: {send: mockSend}};

const translation = {
  elements: 'Elements',
  files: 'Files',
};

describe('search menu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should return 2 menu items', () => {
    const items = search(translation);

    expect(items).toHaveLength(2);
  });

  it('should include SEARCH_ELEMENTS as disabled with correct label', () => {
    const items = search(translation);
    const item = items.find(i => i.id === 'SEARCH_ELEMENTS');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Elements');
    expect(item!.enabled).toBe(false);
  });

  it('should include SEARCH_FILES with correct label', () => {
    const items = search(translation);
    const item = items.find(i => i.id === 'SEARCH_FILES');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Files');
  });

  describe('click handlers', () => {
    function getClickHandler(id: string) {
      const items = search(translation);
      return (items.find(i => i.id === id) as any)?.click;
    }

    it('SEARCH_ELEMENTS click should send correct event', () => {
      getClickHandler('SEARCH_ELEMENTS')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.SEARCH_ELEMENTS);
    });

    it('SEARCH_FILES click should send correct event', () => {
      getClickHandler('SEARCH_FILES')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.SEARCH_FILES);
    });

    it('click handler should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      expect(() => getClickHandler('SEARCH_FILES')(null, undefined)).not.toThrow();
    });
  });
});
