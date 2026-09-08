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

import {beforeAll, describe, expect, it, MockedFunction, vi} from 'vitest';

const {mockOn, mockQuit, mockGetAllWindows, mockSetUserTasks} = vi.hoisted(() => ({
  mockOn: vi.fn(),
  mockQuit: vi.fn(),
  mockGetAllWindows: vi.fn(),
  mockSetUserTasks: vi.fn(),
}));

vi.mock('electron', () => ({
  app: {
    on: mockOn,
    quit: mockQuit,
    setUserTasks: mockSetUserTasks,
  },
  BrowserWindow: Object.assign(vi.fn(), {
    getAllWindows: mockGetAllWindows,
  }),
}));

vi.mock('./electron/core', () => ({
  cleanUpProcesses: vi.fn(),
  startService: (vi.fn() as unknown as MockedFunction<(...args: any[]) => any>).mockResolvedValue(undefined),
}));

vi.mock('./electron/platform/platform', () => ({
  isWin: false,
}));

vi.mock('./electron/shortcuts', () => ({
  registerGlobalShortcuts: vi.fn(),
  unregisterGlobalShortcuts: vi.fn(),
}));

vi.mock('./electron/utils/mode', () => ({
  inProdMode: vi.fn().mockReturnValue(false),
}));

vi.mock('./electron/windows-manager', () => ({
  windowsManager: {
    createNewWindow: vi.fn(),
    activateCommunicationProtocol: vi.fn(),
  },
}));

import {cleanUpProcesses, startService} from './electron/core';
import {registerGlobalShortcuts, unregisterGlobalShortcuts} from './electron/shortcuts';
import {windowsManager} from './electron/windows-manager';

const mockedStartService = startService as unknown as MockedFunction<(...args: any[]) => any>;
const mockedCleanUpProcesses = cleanUpProcesses as unknown as MockedFunction<(...args: any[]) => any>;
const mockedRegisterShortcuts = registerGlobalShortcuts as unknown as MockedFunction<(...args: any[]) => any>;
const mockedUnregisterShortcuts = unregisterGlobalShortcuts as unknown as MockedFunction<(...args: any[]) => any>;
const mockedCreateNewWindow = windowsManager.createNewWindow as unknown as MockedFunction<(...args: any[]) => any>;
const mockedActivate = windowsManager.activateCommunicationProtocol as unknown as MockedFunction<(...args: any[]) => any>;

function getAppHandler(event: string): (...args: any[]) => any {
  const call = mockOn.mock.calls.find((c: any[]) => c[0] === event);
  return call?.[1] as (...args: any[]) => any;
}

describe('main', () => {
  beforeAll(async () => {
    await import('./main');
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
