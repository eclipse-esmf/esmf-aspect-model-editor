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

jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
  },
}));

jest.mock('child_process', () => ({spawn: jest.fn()}));
jest.mock('portfinder', () => ({getPortPromise: jest.fn()}));
jest.mock('./platform/platform', () => ({extension: 'mac', isWin: false}));
jest.mock('./utils/promisify', () => ({execPromise: jest.fn()}));
jest.mock('./utils/mode', () => ({inDevMode: jest.fn()}));
jest.mock('./windows-manager', () => ({
  windowsManager: {createNewWindow: jest.fn(), activateCommunicationProtocol: jest.fn()},
}));
jest.mock('../package.json', () => ({version: '1.0.0'}), {virtual: true});

import {BrowserWindow, ipcMain} from 'electron';
import {spawn} from 'child_process';
import * as portfinder from 'portfinder';
import {execPromise} from './utils/promisify';
import {inDevMode} from './utils/mode';
import {windowsManager} from './windows-manager';
import {cleanUpProcesses, startService} from './core';

const mockedBrowserWindow = BrowserWindow as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedIpcMainHandle = ipcMain.handle as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedIpcMainOn = ipcMain.on as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedSpawn = spawn as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedGetPortPromise = portfinder.getPortPromise as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedExecPromise = execPromise as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedInDevMode = inDevMode as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedCreateNewWindow = windowsManager.createNewWindow as unknown as jest.MockedFunction<(...args: any[]) => any>;

function makeSplash() {
  return {
    loadFile: (jest.fn() as unknown as jest.MockedFunction<(...args: any[]) => any>).mockResolvedValue(undefined),
    close: jest.fn(),
  };
}

function makeProcMock() {
  const stdoutOn = jest.fn() as unknown as jest.MockedFunction<(...args: any[]) => any>;
  return {
    pid: 5678,
    stdout: {on: stdoutOn},
    on: jest.fn(),
    kill: jest.fn().mockReturnValue(true),
  };
}

describe('core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanUpProcesses', () => {
    it('should resolve without error when processes array is empty', async () => {
      await expect(cleanUpProcesses()).resolves.toBeUndefined();
    });

    it('should not call execPromise when processes array is empty', async () => {
      await cleanUpProcesses();

      expect(mockedExecPromise).not.toHaveBeenCalled();
    });
  });

  describe('startService', () => {
    it('should register get-backend-port handler returning "9090" in dev mode', async () => {
      jest.useFakeTimers();
      mockedInDevMode.mockReturnValue(true);
      mockedBrowserWindow.mockImplementation(() => makeSplash());

      const servicePromise = startService();
      jest.runAllTimers();
      await servicePromise;

      const handler = mockedIpcMainHandle.mock.calls.find((c: any[]) => c[0] === 'get-backend-port')?.[1] as () => string;
      expect(handler()).toBe('9090');
      jest.useRealTimers();
    });

    it('should create new window after timeout in dev mode', async () => {
      jest.useFakeTimers();
      mockedInDevMode.mockReturnValue(true);
      const splash = makeSplash();
      mockedBrowserWindow.mockImplementation(() => splash);

      const servicePromise = startService();
      // flush loadFile microtask, advance timer, flush setTimeout callback microtasks
      for (let i = 0; i < 5; i++) await Promise.resolve();
      jest.runAllTimers();
      for (let i = 0; i < 5; i++) await Promise.resolve();
      await servicePromise;

      expect(mockedCreateNewWindow).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should get a port and spawn backend in prod mode', async () => {
      mockedInDevMode.mockReturnValue(false);
      mockedBrowserWindow.mockImplementation(() => makeSplash());
      mockedSpawn.mockReturnValue(makeProcMock());
      mockedGetPortPromise.mockResolvedValue(30000);

      await startService();

      expect(mockedGetPortPromise).toHaveBeenCalledWith({port: 30000, stopPort: 31000});
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it('should register get-backend-port handler returning port string in prod mode', async () => {
      mockedInDevMode.mockReturnValue(false);
      mockedBrowserWindow.mockImplementation(() => makeSplash());
      mockedSpawn.mockReturnValue(makeProcMock());
      mockedGetPortPromise.mockResolvedValue(30001);

      await startService();

      const handler = mockedIpcMainHandle.mock.calls.find((c: any[]) => c[0] === 'get-backend-port')?.[1] as () => string;
      expect(handler()).toBe('30001');
    });

    // This test must run before any prod-mode test that pushes to `processes`
    it('should close splash and create new window when backend outputs "Server Running"', async () => {
      // Reset module so `processes` array is fresh
      jest.resetModules();
      jest.doMock('electron', () => ({BrowserWindow: mockedBrowserWindow, ipcMain: {handle: mockedIpcMainHandle, on: mockedIpcMainOn}}));
      jest.doMock('child_process', () => ({spawn: mockedSpawn}));
      jest.doMock('portfinder', () => ({getPortPromise: mockedGetPortPromise}));
      jest.doMock('./platform/platform', () => ({extension: 'mac', isWin: false}));
      jest.doMock('./utils/mode', () => ({inDevMode: () => false}));
      jest.doMock('./utils/promisify', () => ({execPromise: mockedExecPromise}));
      jest.doMock('./windows-manager', () => ({windowsManager: {createNewWindow: mockedCreateNewWindow}}));
      jest.doMock('../package.json', () => ({version: '1.0.0'}));

      const {startService: freshStartService} = require('./core') as typeof import('./core');

      mockedInDevMode.mockReturnValue(false);
      const splashMock = makeSplash();
      mockedBrowserWindow.mockImplementation(() => splashMock);

      let stdoutDataHandler: ((data: Buffer) => void) | undefined;
      const proc = makeProcMock();
      proc.stdout.on.mockImplementation((event: any, cb: any) => {
        if (event === 'data') stdoutDataHandler = cb;
      });
      mockedSpawn.mockReturnValue(proc);
      mockedGetPortPromise.mockResolvedValue(30000);

      await freshStartService();

      expect(stdoutDataHandler).toBeDefined();
      stdoutDataHandler!(Buffer.from('Server Running'));

      expect(splashMock.close).toHaveBeenCalled();
      expect(mockedCreateNewWindow).toHaveBeenCalled();
    });
  });
});
