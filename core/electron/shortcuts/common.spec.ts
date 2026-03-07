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
import {BrowserWindow, globalShortcut} from 'electron';
import {registerCommonShortcuts} from './common';

jest.mock('electron', () => ({
  BrowserWindow: {
    getFocusedWindow: jest.fn(),
  },
  globalShortcut: {
    register: jest.fn(),
  },
}));

const mockedRegister = globalShortcut.register as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedGetFocusedWindow = BrowserWindow.getFocusedWindow as unknown as jest.MockedFunction<(...args: any[]) => any>;

const mockWin = {
  close: jest.fn(),
  minimize: jest.fn(),
  maximize: jest.fn(),
  setFullScreen: jest.fn(),
  reload: jest.fn(),
  webContents: {
    undo: jest.fn(),
  },
};

describe('registerCommonShortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should register all 7 common shortcuts', () => {
    registerCommonShortcuts();

    expect(mockedRegister).toHaveBeenCalledTimes(7);
  });

  it('should register CommandOrControl+W', () => {
    registerCommonShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('CommandOrControl+W', expect.any(Function));
  });

  it('should register CommandOrControl+M', () => {
    registerCommonShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('CommandOrControl+M', expect.any(Function));
  });

  it('should register CommandOrControl+Shift+M', () => {
    registerCommonShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('CommandOrControl+Shift+M', expect.any(Function));
  });

  it('should register CommandOrControl+Shift+F', () => {
    registerCommonShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('CommandOrControl+Shift+F', expect.any(Function));
  });

  it('should register CommandOrControl+Shift+G', () => {
    registerCommonShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('CommandOrControl+Shift+G', expect.any(Function));
  });

  it('should register CommandOrControl+Z', () => {
    registerCommonShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('CommandOrControl+Z', expect.any(Function));
  });

  it('should register CommandOrControl+R', () => {
    registerCommonShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('CommandOrControl+R', expect.any(Function));
  });

  describe('shortcut actions', () => {
    function getRegisteredAction(key: string): () => void {
      registerCommonShortcuts();
      const call = mockedRegister.mock.calls.find((c: any[]) => c[0] === key);
      return call?.[1] as () => void;
    }

    it('CommandOrControl+W should call win.close()', () => {
      const action = getRegisteredAction('CommandOrControl+W');
      action();

      expect(mockWin.close).toHaveBeenCalled();
    });

    it('CommandOrControl+M should call win.minimize()', () => {
      const action = getRegisteredAction('CommandOrControl+M');
      action();

      expect(mockWin.minimize).toHaveBeenCalled();
    });

    it('CommandOrControl+Shift+M should call win.maximize()', () => {
      const action = getRegisteredAction('CommandOrControl+Shift+M');
      action();

      expect(mockWin.maximize).toHaveBeenCalled();
    });

    it('CommandOrControl+Shift+F should call win.setFullScreen(true)', () => {
      const action = getRegisteredAction('CommandOrControl+Shift+F');
      action();

      expect(mockWin.setFullScreen).toHaveBeenCalledWith(true);
    });

    it('CommandOrControl+Shift+G should call win.setFullScreen(false)', () => {
      const action = getRegisteredAction('CommandOrControl+Shift+G');
      action();

      expect(mockWin.setFullScreen).toHaveBeenCalledWith(false);
    });

    it('CommandOrControl+Z should call win.webContents.undo()', () => {
      const action = getRegisteredAction('CommandOrControl+Z');
      action();

      expect(mockWin.webContents.undo).toHaveBeenCalled();
    });

    it('CommandOrControl+R should call win.reload()', () => {
      const action = getRegisteredAction('CommandOrControl+R');
      action();

      expect(mockWin.reload).toHaveBeenCalled();
    });

    it('should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);
      registerCommonShortcuts();

      const calls = mockedRegister.mock.calls as any[][];
      expect(() => calls.forEach(([, action]) => action())).not.toThrow();
    });
  });
});
