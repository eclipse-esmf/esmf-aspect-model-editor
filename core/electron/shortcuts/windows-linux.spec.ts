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
import {registerWindowsLinuxShortcuts} from './windows-linux';

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

const mockOpenDevTools = jest.fn();
const mockWin = {
  webContents: {
    openDevTools: mockOpenDevTools,
  },
};

describe('registerWindowsLinuxShortcuts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetFocusedWindow.mockReturnValue(mockWin);
  });

  it('should register exactly 1 shortcut', () => {
    registerWindowsLinuxShortcuts();

    expect(mockedRegister).toHaveBeenCalledTimes(1);
  });

  it('should register Control+Shift+I', () => {
    registerWindowsLinuxShortcuts();

    expect(mockedRegister).toHaveBeenCalledWith('Control+Shift+I', expect.any(Function));
  });

  describe('shortcut actions', () => {
    function getRegisteredAction(key: string): () => void {
      registerWindowsLinuxShortcuts();
      const call = mockedRegister.mock.calls.find((c: any[]) => c[0] === key);
      return call?.[1] as () => void;
    }

    it('Control+Shift+I should call webContents.openDevTools() on focused window', () => {
      const action = getRegisteredAction('Control+Shift+I');
      action();

      expect(mockOpenDevTools).toHaveBeenCalledTimes(1);
    });

    it('Control+Shift+I should not throw when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      const action = getRegisteredAction('Control+Shift+I');

      expect(() => action()).not.toThrow();
    });

    it('Control+Shift+I should not call openDevTools when no focused window is available', () => {
      mockedGetFocusedWindow.mockReturnValue(null);

      const action = getRegisteredAction('Control+Shift+I');
      action();

      expect(mockOpenDevTools).not.toHaveBeenCalled();
    });

    it('should call getFocusedWindow when shortcut is triggered', () => {
      const action = getRegisteredAction('Control+Shift+I');
      action();

      expect(mockedGetFocusedWindow).toHaveBeenCalled();
    });
  });
});
