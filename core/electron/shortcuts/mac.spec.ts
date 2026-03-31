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
import {app, BrowserWindow, globalShortcut} from 'electron';
import {registerMacShortcuts} from './mac';

jest.mock('electron', () => ({
  app: {
    quit: jest.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: jest.fn(),
  },
  globalShortcut: {
    register: jest.fn(),
  },
}));

const mockedRegister = globalShortcut.register as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedGetFocusedWindow = BrowserWindow.getFocusedWindow as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedQuit = app.quit as unknown as jest.MockedFunction<(...args: any[]) => any>;

const mockOpenDevTools = jest.fn();
const mockWin = {
  webContents: {
    openDevTools: mockOpenDevTools,
  },
};

describe('registerMacShortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should register exactly 2 shortcuts', () => {
    registerMacShortcuts();

    expect(mockedRegister).toHaveBeenCalledTimes(2);
  });

  it('should register CommandOrControl+Q', () => {
    registerMacShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('CommandOrControl+Q', expect.any(Function));
  });

  it('should register Command+Option+I', () => {
    registerMacShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('Command+Option+I', expect.any(Function));
  });

  describe('shortcut actions', () => {
    function getRegisteredAction(key: string): () => void {
      registerMacShortcuts();
      const call = mockedRegister.mock.calls.find((c: any[]) => c[0] === key);
      return call?.[1] as () => void;
    }

    it('CommandOrControl+Q should call app.quit()', () => {
      const action = getRegisteredAction('CommandOrControl+Q');
      action();

      expect(mockedQuit).toHaveBeenCalledTimes(1);
    });

    it('Command+Option+I should call webContents.openDevTools() on focused window', () => {
      const action = getRegisteredAction('Command+Option+I');
      action();

      expect(mockOpenDevTools).toHaveBeenCalledTimes(1);
    });

    it('Command+Option+I should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      const action = getRegisteredAction('Command+Option+I');

      expect(() => action()).not.toThrow();
    });

    it('CommandOrControl+Q should not call openDevTools', () => {
      const action = getRegisteredAction('CommandOrControl+Q');
      action();

      expect(mockOpenDevTools).not.toHaveBeenCalled();
    });

    it('Command+Option+I should not call app.quit()', () => {
      const action = getRegisteredAction('Command+Option+I');
      action();

      expect(mockedQuit).not.toHaveBeenCalled();
    });
  });
});
