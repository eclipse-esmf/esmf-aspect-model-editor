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

import {describe, it, expect, jest, beforeAll} from '@jest/globals';

const mockOn = jest.fn();
const mockQuit = jest.fn();
const mockGetAllWindows = jest.fn();
const mockSetUserTasks = jest.fn();

jest.mock('electron', () => ({
  app: {
    on: mockOn,
    quit: mockQuit,
    setUserTasks: mockSetUserTasks,
  },
  BrowserWindow: Object.assign(jest.fn(), {
    getAllWindows: mockGetAllWindows,
  }),
}));

jest.mock('./electron/core', () => ({
  cleanUpProcesses: jest.fn(),
  startService: (jest.fn() as unknown as jest.MockedFunction<(...args: any[]) => any>).mockResolvedValue(undefined),
}));

jest.mock('./electron/platform/platform', () => ({
  isWin: false,
}));

jest.mock('./electron/shortcuts', () => ({
  registerGlobalShortcuts: jest.fn(),
  unregisterGlobalShortcuts: jest.fn(),
}));

jest.mock('./electron/utils/mode', () => ({
  inProdMode: jest.fn().mockReturnValue(false),
}));

jest.mock('./electron/windows-manager', () => ({
  windowsManager: {
    createNewWindow: jest.fn(),
    activateCommunicationProtocol: jest.fn(),
  },
}));

import {cleanUpProcesses, startService} from './electron/core';
import {registerGlobalShortcuts, unregisterGlobalShortcuts} from './electron/shortcuts';
import {windowsManager} from './electron/windows-manager';

const mockedStartService = startService as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedCleanUpProcesses = cleanUpProcesses as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedRegisterShortcuts = registerGlobalShortcuts as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedUnregisterShortcuts = unregisterGlobalShortcuts as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedCreateNewWindow = windowsManager.createNewWindow as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedActivate = windowsManager.activateCommunicationProtocol as unknown as jest.MockedFunction<(...args: any[]) => any>;

function getAppHandler(event: string): (...args: any[]) => any {
  const call = mockOn.mock.calls.find((c: any[]) => c[0] === event);
  return call?.[1] as (...args: any[]) => any;
}

describe('main', () => {
  beforeAll(() => {
    require('./main');
  });

  describe('app event registration', () => {
    it('should register ready event handler', () => {
      expect(mockOn).toHaveBeenCalledWith('ready', expect.any(Function));
    });

    it('should register activate event handler', () => {
      expect(mockOn).toHaveBeenCalledWith('activate', expect.any(Function));
    });

    it('should register window-all-closed event handler', () => {
      expect(mockOn).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
    });

    it('should register before-quit event handler', () => {
      expect(mockOn).toHaveBeenCalledWith('before-quit', expect.any(Function));
    });
  });

  describe('onReady', () => {
    it('should register browser-window-blur and browser-window-focus listeners', async () => {
      mockedStartService.mockResolvedValue(undefined);
      const onReady = getAppHandler('ready');
      await onReady();

      expect(mockOn).toHaveBeenCalledWith('browser-window-blur', mockedUnregisterShortcuts);
      expect(mockOn).toHaveBeenCalledWith('browser-window-focus', mockedRegisterShortcuts);
    });

    it('should call startService', async () => {
      mockedStartService.mockResolvedValue(undefined);
      const onReady = getAppHandler('ready');
      await onReady();

      expect(mockedStartService).toHaveBeenCalled();
    });

    it('should call activateCommunicationProtocol', async () => {
      mockedStartService.mockResolvedValue(undefined);
      const onReady = getAppHandler('ready');
      await onReady();

      expect(mockedActivate).toHaveBeenCalled();
    });
  });

  describe('onActivate', () => {
    it('should create a new window when no windows are open', () => {
      mockGetAllWindows.mockReturnValue([]);
      const onActivate = getAppHandler('activate');
      onActivate();

      expect(mockedCreateNewWindow).toHaveBeenCalled();
    });

    it('should not create a new window when windows are already open', () => {
      mockGetAllWindows.mockReturnValue([{}]);
      mockedCreateNewWindow.mockClear();
      const onActivate = getAppHandler('activate');
      onActivate();

      expect(mockedCreateNewWindow).not.toHaveBeenCalled();
    });
  });

  describe('onWindowAllClosed', () => {
    it('should call app.quit()', () => {
      const onWindowAllClosed = getAppHandler('window-all-closed');
      onWindowAllClosed();

      expect(mockQuit).toHaveBeenCalled();
    });
  });

  describe('onBeforeQuit', () => {
    it('should call cleanUpProcesses()', () => {
      const onBeforeQuit = getAppHandler('before-quit');
      onBeforeQuit();

      expect(mockedCleanUpProcesses).toHaveBeenCalled();
    });
  });
});
