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

import {beforeEach, describe, expect, it, MockedFunction, vi} from 'vitest';

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
}));

vi.mock('child_process', () => ({spawn: vi.fn()}));
vi.mock('portfinder', () => ({getPortPromise: vi.fn()}));
vi.mock('./platform/platform', () => ({extension: 'mac', isWin: false}));
vi.mock('./utils/promisify', () => ({execPromise: vi.fn()}));
vi.mock('./utils/mode', () => ({inDevMode: vi.fn()}));
vi.mock('./windows-manager', () => ({
  windowsManager: {createNewWindow: vi.fn(), activateCommunicationProtocol: vi.fn()},
}));
vi.mock('../package.json', () => ({version: '1.0.0', default: {version: '1.0.0'}}), {virtual: true});

import {spawn} from 'child_process';
import {BrowserWindow, ipcMain} from 'electron';
import * as portfinder from 'portfinder';
import {cleanUpProcesses, startService} from './core';
import {inDevMode} from './utils/mode';
import {execPromise} from './utils/promisify';
import {windowsManager} from './windows-manager';

const mockedBrowserWindow = BrowserWindow as unknown as MockedFunction<(...args: any[]) => any>;
const mockedIpcMainHandle = ipcMain.handle as unknown as MockedFunction<(...args: any[]) => any>;
const mockedIpcMainOn = ipcMain.on as unknown as MockedFunction<(...args: any[]) => any>;
const mockedSpawn = spawn as unknown as MockedFunction<(...args: any[]) => any>;
const mockedGetPortPromise = portfinder.getPortPromise as unknown as MockedFunction<(...args: any[]) => any>;
const mockedExecPromise = execPromise as unknown as MockedFunction<(...args: any[]) => any>;
const mockedInDevMode = inDevMode as unknown as MockedFunction<(...args: any[]) => any>;
const mockedCreateNewWindow = windowsManager.createNewWindow as unknown as MockedFunction<(...args: any[]) => any>;

function makeSplash() {
  return {
    loadFile: (vi.fn() as unknown as MockedFunction<(...args: any[]) => any>).mockResolvedValue(undefined),
    close: vi.fn(),
  };
}

function makeProcMock() {
  const stdoutOn = vi.fn() as unknown as MockedFunction<(...args: any[]) => any>;
  return {
    pid: 5678,
    stdout: {on: stdoutOn},
    on: vi.fn(),
    kill: vi.fn().mockReturnValue(true),
  };
}

describe('core', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      vi.useFakeTimers();
      mockedInDevMode.mockReturnValue(true);
      mockedBrowserWindow.mockImplementation(function () {
        return makeSplash();
      });

      const servicePromise = startService();
      vi.runAllTimers();
      await servicePromise;

      const handler = mockedIpcMainHandle.mock.calls.find((c: any[]) => c[0] === 'get-backend-port')?.[1] as () => string;
      expect(handler()).toBe('9090');
      vi.useRealTimers();
    });

    it('should create new window after timeout in dev mode', async () => {
      vi.useFakeTimers();
      mockedInDevMode.mockReturnValue(true);
      const splash = makeSplash();
      mockedBrowserWindow.mockImplementation(function () {
        return splash;
      });

      const servicePromise = startService();
      // flush loadFile microtask, advance timer, flush setTimeout callback microtasks
      for (let i = 0; i < 5; i++) await Promise.resolve();
      vi.runAllTimers();
      for (let i = 0; i < 5; i++) await Promise.resolve();
      await servicePromise;

      expect(mockedCreateNewWindow).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should get a port and spawn backend in prod mode', async () => {
      mockedInDevMode.mockReturnValue(false);
      mockedBrowserWindow.mockImplementation(function () {
        return makeSplash();
      });
      mockedSpawn.mockReturnValue(makeProcMock());
      mockedGetPortPromise.mockResolvedValue(30000);

      await startService();

      expect(mockedGetPortPromise).toHaveBeenCalledWith({port: 30000, stopPort: 31000});
      expect(mockedSpawn).toHaveBeenCalled();
    });

    it('should register get-backend-port handler returning port string in prod mode', async () => {
      mockedInDevMode.mockReturnValue(false);
      mockedBrowserWindow.mockImplementation(function () {
        return makeSplash();
      });
      mockedSpawn.mockReturnValue(makeProcMock());
      mockedGetPortPromise.mockResolvedValue(30001);

      await startService();

      const handler = mockedIpcMainHandle.mock.calls.find((c: any[]) => c[0] === 'get-backend-port')?.[1] as () => string;
      expect(handler()).toBe('30001');
    });

    // This test must run before any prod-mode test that pushes to `processes`
    it('should close splash and create new window when backend outputs "Server Running"', async () => {
      // Reset module so `processes` array is fresh
      vi.resetModules();
      vi.doMock('electron', () => ({BrowserWindow: mockedBrowserWindow, ipcMain: {handle: mockedIpcMainHandle, on: mockedIpcMainOn}}));
      vi.doMock('child_process', () => ({spawn: mockedSpawn}));
      vi.doMock('portfinder', () => ({getPortPromise: mockedGetPortPromise}));
      vi.doMock('./platform/platform', () => ({extension: 'mac', isWin: false}));
      vi.doMock('./utils/mode', () => ({inDevMode: () => false}));
      vi.doMock('./utils/promisify', () => ({execPromise: mockedExecPromise}));
      vi.doMock('./windows-manager', () => ({windowsManager: {createNewWindow: mockedCreateNewWindow}}));
      vi.doMock('../package.json', () => ({version: '1.0.0', default: {version: '1.0.0'}}));

      const {startService: freshStartService} = (await import('./core')) as typeof import('./core');

      mockedInDevMode.mockReturnValue(false);
      const splashMock = makeSplash();
      mockedBrowserWindow.mockImplementation(function () {
        return splashMock;
      });

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
