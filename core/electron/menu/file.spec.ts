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
import {file} from './file';

jest.mock('electron', () => ({
  BrowserWindow: Object.assign(jest.fn(), {getFocusedWindow: jest.fn()}),
}));

jest.mock('../utils/icon-utils', () => ({
  getIcon: jest.fn(() => 'mock-icon'),
}));

jest.mock('../const/icons', () => ({
  icons: new Proxy({}, {get: () => ({enabled: 'icon-path', disabled: 'icon-path-disabled'})}),
}));

jest.mock('../const/paths', () => ({
  paths: {models: '/mock/models'},
}));

jest.mock('../utils/file-utils', () => ({
  openFile: jest.fn(),
  getFileInfo: jest.fn(),
}));

import {openFile, getFileInfo} from '../utils/file-utils';

const mockedOpenFile = openFile as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedGetFileInfo = getFileInfo as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedGetFocusedWindow = BrowserWindow.getFocusedWindow as unknown as jest.MockedFunction<(...args: any[]) => any>;

const mockSend = jest.fn();
const mockWin = {webContents: {send: mockSend}};

const translation = {
  NEW: {
    LABEL: 'New',
    SUBMENU: {
      EMPTY_MODEL: 'Empty Model',
      LOAD_FILE: 'Load File',
      COPY_PASTE: 'Copy/Paste',
      EXAMPLES: 'Examples',
    },
  },
  NEW_WINDOW: 'New Window',
  IMPORT_MODEL: 'Import Model',
  IMPORT_PACKAGE: 'Import Package',
  COPY_TO_CLIPBOARD: 'Copy to Clipboard',
  SAVE_TO_WORKSPACE: 'Save to Workspace',
  EXPORT_MODEL: 'Export Model',
  EXPORT_PACKAGE: 'Export Package',
};

describe('file menu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should return 9 top-level menu items (8 items + 1 separator)', () => {
    const items = file(translation);

    expect(items).toHaveLength(9);
  });

  it('MENU_NEW submenu should have 7 items', () => {
    const items = file(translation);
    const item = items.find(i => i.id === 'MENU_NEW') as any;

    expect(item.submenu).toHaveLength(7);
  });

  it('should include NEW_WINDOW with correct label', () => {
    const items = file(translation);
    const item = items.find(i => i.id === 'NEW_WINDOW');

    expect(item).toBeDefined();
    expect(item!.label).toBe('New Window');
  });

  it('should include IMPORT_MODEL with correct label', () => {
    const items = file(translation);
    const item = items.find(i => i.id === 'IMPORT_MODEL');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Import Model');
  });

  it('should include IMPORT_PACKAGE with correct label', () => {
    const items = file(translation);
    const item = items.find(i => i.id === 'IMPORT_PACKAGE');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Import Package');
  });

  it('should include COPY_TO_CLIPBOARD as disabled', () => {
    const items = file(translation);
    const item = items.find(i => i.id === 'COPY_TO_CLIPBOARD');

    expect(item).toBeDefined();
    expect(item!.enabled).toBe(false);
  });

  it('should include SAVE_TO_WORKSPACE as disabled', () => {
    const items = file(translation);
    const item = items.find(i => i.id === 'SAVE_TO_WORKSPACE');

    expect(item).toBeDefined();
    expect(item!.enabled).toBe(false);
  });

  it('should include EXPORT_MODEL as disabled', () => {
    const items = file(translation);
    const item = items.find(i => i.id === 'EXPORT_MODEL');

    expect(item).toBeDefined();
    expect(item!.enabled).toBe(false);
  });

  it('should include EXPORT_PACKAGE with correct label', () => {
    const items = file(translation);
    const item = items.find(i => i.id === 'EXPORT_PACKAGE');

    expect(item).toBeDefined();
    expect(item!.label).toBe('Export Package');
  });

  describe('click handlers', () => {
    function getClickHandler(id: string) {
      const items = file(translation);
      return (items.find(i => i.id === id) as any)?.click;
    }

    function getSubmenuClickHandler(parentId: string, childId: string) {
      const items = file(translation);
      const parent = items.find(i => i.id === parentId) as any;
      return parent?.submenu?.find((i: any) => i.id === childId)?.click;
    }

    it('NEW_EMPTY_MODEL click should send correct event', () => {
      getSubmenuClickHandler('MENU_NEW', 'NEW_EMPTY_MODEL')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.NEW_EMPTY_MODEL);
    });

    it('LOAD_FILE click should call openFile and send LOAD_FILE event', async () => {
      const fakeFileInfo = {path: '/file.ttl', content: Buffer.from(''), name: 'file.ttl'};
      mockedOpenFile.mockResolvedValue(fakeFileInfo);

      getSubmenuClickHandler('MENU_NEW', 'LOAD_FILE')(null, undefined);
      await Promise.resolve();

      expect(mockedOpenFile).toHaveBeenCalledWith([{name: 'Turtle Files', extensions: ['ttl']}]);
    });

    it('LOAD_FROM_TEXT click should send correct event', () => {
      getSubmenuClickHandler('MENU_NEW', 'LOAD_FROM_TEXT')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.LOAD_FROM_TEXT);
    });

    it('LOAD_DEFAULT_EXAMPLE click should call getFileInfo', async () => {
      const fakeFileInfo = {path: '/mock/models/SimpleAspect.ttl', content: Buffer.from(''), name: 'SimpleAspect.ttl'};
      mockedGetFileInfo.mockResolvedValue(fakeFileInfo);

      getSubmenuClickHandler('MENU_NEW', 'LOAD_DEFAULT_EXAMPLE')(null, undefined);
      await Promise.resolve();

      expect(mockedGetFileInfo).toHaveBeenCalled();
    });

    it('LOAD_MOVEMENT_EXAMPLE click should call getFileInfo', async () => {
      const fakeFileInfo = {path: '/mock/models/Movement.ttl', content: Buffer.from(''), name: 'Movement.ttl'};
      mockedGetFileInfo.mockResolvedValue(fakeFileInfo);

      getSubmenuClickHandler('MENU_NEW', 'LOAD_MOVEMENT_EXAMPLE')(null, undefined);
      await Promise.resolve();

      expect(mockedGetFileInfo).toHaveBeenCalled();
    });

    it('NEW_WINDOW click should send correct event', () => {
      getClickHandler('NEW_WINDOW')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.NEW_WINDOW);
    });

    it('IMPORT_MODEL click should call openFile with TTL filter', async () => {
      mockedOpenFile.mockResolvedValue({path: '/file.ttl', content: Buffer.from(''), name: 'file.ttl'});

      getClickHandler('IMPORT_MODEL')(null, undefined);
      await Promise.resolve();

      expect(mockedOpenFile).toHaveBeenCalledWith([{name: 'Turtle Files', extensions: ['ttl']}]);
    });

    it('IMPORT_PACKAGE click should call openFile with ZIP filter', async () => {
      mockedOpenFile.mockResolvedValue({path: '/file.zip', content: Buffer.from(''), name: 'file.zip'});

      getClickHandler('IMPORT_PACKAGE')(null, undefined);
      await Promise.resolve();

      expect(mockedOpenFile).toHaveBeenCalledWith([{name: 'ZIP Files', extensions: ['zip']}]);
    });

    it('COPY_TO_CLIPBOARD click should send correct event', () => {
      getClickHandler('COPY_TO_CLIPBOARD')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.COPY_TO_CLIPBOARD);
    });

    it('SAVE_TO_WORKSPACE click should send correct event', () => {
      getClickHandler('SAVE_TO_WORKSPACE')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.SAVE_TO_WORKSPACE);
    });

    it('EXPORT_MODEL click should send correct event', () => {
      getClickHandler('EXPORT_MODEL')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.EXPORT_MODEL);
    });

    it('EXPORT_PACKAGE click should send correct event', () => {
      getClickHandler('EXPORT_PACKAGE')(null, undefined);

      expect(mockSend).toHaveBeenCalledWith(EVENTS.SIGNAL.EXPORT_NAMESPACES);
    });

    it('click handler should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      expect(() => getClickHandler('NEW_WINDOW')(null, undefined)).not.toThrow();
    });
  });
});
