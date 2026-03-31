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
import {view} from './view';

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
  TOGGLE_TOOLBAR: 'Toggle Toolbar',
  TOGGLE_MINIMAP: 'Toggle Minimap',
  FILTER: {
    LABEL: 'Filter',
    SUBMENU: {
      NONE: 'None',
      PROPERTIES: 'Properties',
    },
  },
  ZOOM_IN: 'Zoom In',
  ZOOM_OUT: 'Zoom Out',
  ZOOM_TO_FIT: 'Zoom to Fit',
  ZOOM_TO_100: 'Zoom to 100%',
};

describe('view menu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should return 8 menu items (7 items + 1 separator)', () => {
    const items = view(translation);

    expect(items).toHaveLength(8);
  });

  it('should include SHOW_HIDE_TOOLBAR with correct label', () => {
    const items = view(translation);
    const item = items.find(i => i.id === 'SHOW_HIDE_TOOLBAR');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Toggle Toolbar');
  });

  it('should include SHOW_HIDE_MINIMAP with correct label', () => {
    const items = view(translation);
    const item = items.find(i => i.id === 'SHOW_HIDE_MINIMAP');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Toggle Minimap');
  });

  it('should include MENU_FILTER_MODEL_BY as disabled with submenu', () => {
    const items = view(translation);
    const item = items.find(i => i.id === 'MENU_FILTER_MODEL_BY') as any;

    expect(item).toBeDefined();
    expect(item.label).toBe('Filter');
    expect(item.enabled).toBe(false);
    expect(item.submenu).toHaveLength(2);
  });

  it('should include a separator', () => {
    const items = view(translation);

    expect(items.find(i => i.type === 'separator')).toBeDefined();
  });

  it('should include ZOOM_IN as disabled', () => {
    const items = view(translation);
    const item = items.find(i => i.id === 'ZOOM_IN');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Zoom In');
    expect(item!.enabled).toBe(false);
  });

  it('should include ZOOM_OUT as disabled', () => {
    const items = view(translation);
    const item = items.find(i => i.id === 'ZOOM_OUT');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Zoom Out');
    expect(item!.enabled).toBe(false);
  });

  it('should include ZOOM_TO_FIT as disabled', () => {
    const items = view(translation);
    const item = items.find(i => i.id === 'ZOOM_TO_FIT');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Zoom to Fit');
    expect(item!.enabled).toBe(false);
  });

  it('should include ZOOM_TO_ACTUAL as disabled', () => {
    const items = view(translation);
    const item = items.find(i => i.id === 'ZOOM_TO_ACTUAL');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Zoom to 100%');
    expect(item!.enabled).toBe(false);
  });

  describe('click handlers', () => {
    function getClickHandler(id: string) {
      const items = view(translation);
      return (items.find(i => i.id === id) as any)?.click;
    }

    function getSubmenuClickHandler(parentId: string, childId: string) {
      const items = view(translation);
      const parent = items.find(i => i.id === parentId) as any;
      return parent?.submenu?.find((i: any) => i.id === childId)?.click;
    }

    it('SHOW_HIDE_TOOLBAR click should send correct event', () => {
      getClickHandler('SHOW_HIDE_TOOLBAR')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.SHOW_HIDE_TOOLBAR);
    });

    it('SHOW_HIDE_MINIMAP click should send correct event', () => {
      getClickHandler('SHOW_HIDE_MINIMAP')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.SHOW_HIDE_MINIMAP);
    });

    it('FILTER_MODEL_BY_NONE click should send FILTER_MODEL_BY with default', () => {
      getSubmenuClickHandler('MENU_FILTER_MODEL_BY', 'FILTER_MODEL_BY_NONE')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.FILTER_MODEL_BY, 'default');
    });

    it('FILTER_MODEL_BY_PROPERTIES click should send FILTER_MODEL_BY with properties', () => {
      getSubmenuClickHandler('MENU_FILTER_MODEL_BY', 'FILTER_MODEL_BY_PROPERTIES')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.FILTER_MODEL_BY, 'properties');
    });

    it('ZOOM_IN click should send correct event', () => {
      getClickHandler('ZOOM_IN')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.ZOOM_IN);
    });

    it('ZOOM_OUT click should send correct event', () => {
      getClickHandler('ZOOM_OUT')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.ZOOM_OUT);
    });

    it('ZOOM_TO_FIT click should send correct event', () => {
      getClickHandler('ZOOM_TO_FIT')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.ZOOM_TO_FIT);
    });

    it('ZOOM_TO_ACTUAL click should send correct event', () => {
      getClickHandler('ZOOM_TO_ACTUAL')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.ZOOM_TO_ACTUAL);
    });

    it('click handler should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      expect(() => getClickHandler('SHOW_HIDE_TOOLBAR')(null, undefined)).not.toThrow();
    });
  });
});
