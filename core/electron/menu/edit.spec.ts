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
import {edit} from './edit';

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
  openSelectedElement: 'Open',
  removeSelectedElement: 'Remove',
  collapseExpandModel: 'Collapse/Expand',
  formatModel: 'Format',
  connectSelectedElements: 'Connect',
};

describe('edit menu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should return 9 menu items', () => {
    const items = edit(translation);

    expect(items).toHaveLength(9);
  });

  it('should include OPEN_SELECTED_ELEMENT with correct label', () => {
    const items = edit(translation);
    const item = items.find(i => i.id === 'OPEN_SELECTED_ELEMENT');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Open');
    expect(item!.enabled).toBe(false);
  });

  it('should include REMOVE_SELECTED_ELEMENT with correct label', () => {
    const items = edit(translation);
    const item = items.find(i => i.id === 'REMOVE_SELECTED_ELEMENT');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Remove');
    expect(item!.enabled).toBe(false);
  });

  it('should include COLLAPSE_EXPAND_MODEL with correct label', () => {
    const items = edit(translation);
    const item = items.find(i => i.id === 'COLLAPSE_EXPAND_MODEL');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Collapse/Expand');
  });

  it('should include FORMAT_MODEL with correct label', () => {
    const items = edit(translation);
    const item = items.find(i => i.id === 'FORMAT_MODEL');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Format');
  });

  it('should include CONNECT_ELEMENTS with correct label', () => {
    const items = edit(translation);
    const item = items.find(i => i.id === 'CONNECT_ELEMENTS');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Connect');
  });

  it('should include hidden cut, copy, paste, selectAll roles', () => {
    const items = edit(translation);

    expect(items.find(i => i.role === 'cut')).toBeDefined();
    expect(items.find(i => i.role === 'copy')).toBeDefined();
    expect(items.find(i => i.role === 'paste')).toBeDefined();
    expect(items.find(i => i.role === 'selectAll')).toBeDefined();
  });

  describe('click handlers', () => {
    function getClickHandler(id: string) {
      const items = edit(translation);
      return (items.find(i => i.id === id) as any)?.click;
    }

    it('OPEN_SELECTED_ELEMENT click should send correct event', () => {
      getClickHandler('OPEN_SELECTED_ELEMENT')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.OPEN_SELECTED_ELEMENT);
    });

    it('REMOVE_SELECTED_ELEMENT click should send correct event', () => {
      getClickHandler('REMOVE_SELECTED_ELEMENT')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.REMOVE_SELECTED_ELEMENT);
    });

    it('COLLAPSE_EXPAND_MODEL click should send correct event', () => {
      getClickHandler('COLLAPSE_EXPAND_MODEL')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.COLLAPSE_EXPAND_MODEL);
    });

    it('FORMAT_MODEL click should send correct event', () => {
      getClickHandler('FORMAT_MODEL')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.FORMAT_MODEL);
    });

    it('CONNECT_ELEMENTS click should send correct event', () => {
      getClickHandler('CONNECT_ELEMENTS')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.CONNECT_ELEMENTS);
    });

    it('click handler should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      expect(() => getClickHandler('OPEN_SELECTED_ELEMENT')(null, undefined)).not.toThrow();
    });
  });
});
