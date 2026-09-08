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
import {validate} from './validate';

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
  currentModel: 'Current Model',
};

describe('validate menu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should return 1 menu item', () => {
    const items = validate(translation);

    expect(items).toHaveLength(1);
  });

  it('should include VALIDATE_MODEL as disabled with correct label', () => {
    const items = validate(translation);
    const item = items.find(i => i.id === 'VALIDATE_MODEL');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Current Model');
    expect(item!.enabled).toBe(false);
  });

  describe('click handlers', () => {
    function getClickHandler(id: string) {
      const items = validate(translation);
      return (items.find(i => i.id === id) as any)?.click;
    }

    it('VALIDATE_MODEL click should send correct event', () => {
      getClickHandler('VALIDATE_MODEL')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.VALIDATE_MODEL);
    });

    it('click handler should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      expect(() => getClickHandler('VALIDATE_MODEL')(null, undefined)).not.toThrow();
    });
  });
});
