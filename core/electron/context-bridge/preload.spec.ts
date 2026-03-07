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
  contextBridge: {
    exposeInMainWorld: jest.fn(),
  },
  ipcRenderer: {
    send: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    invoke: jest.fn(),
  },
  shell: {
    openExternal: jest.fn(),
  },
}));

import {contextBridge, ipcRenderer, shell} from 'electron';

const mockedExposeInMainWorld = contextBridge.exposeInMainWorld as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedSend = ipcRenderer.send as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedOn = ipcRenderer.on as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedRemoveListener = ipcRenderer.removeListener as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedInvoke = ipcRenderer.invoke as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedOpenExternal = shell.openExternal as unknown as jest.MockedFunction<(...args: any[]) => any>;

// Capture the exposed API once at module load time
let electronAPI: Record<string, any>;
mockedExposeInMainWorld.mockImplementation((_name: any, api: any) => {
  electronAPI = api;
});
require('./preload');

describe('preload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should expose electronAPI in main world', () => {
    expect(electronAPI).toBeDefined();
    expect(typeof electronAPI).toBe('object');
  });

  describe('send', () => {
    it('should call ipcRenderer.send with channel and args', () => {
      electronAPI.send('my-channel', {data: 123});

      expect(mockedSend).toHaveBeenCalledWith('my-channel', {data: 123});
    });

    it('should forward any args type', () => {
      electronAPI.send('test', 'string-arg');

      expect(mockedSend).toHaveBeenCalledWith('test', 'string-arg');
    });
  });

  describe('on', () => {
    it('should register a listener on ipcRenderer', () => {
      const cb = jest.fn();
      electronAPI.on('some-channel', cb);

      expect(mockedOn).toHaveBeenCalledWith('some-channel', expect.any(Function));
    });

    it('should call the callback with forwarded args (without event)', () => {
      const cb = jest.fn();
      electronAPI.on('some-channel', cb);

      const registeredHandler = mockedOn.mock.calls[0][1] as Function;
      registeredHandler({} /* event */, 'arg1', 'arg2');

      expect(cb).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should strip the ipcRenderer event object before calling callback', () => {
      const cb = jest.fn();
      electronAPI.on('chan', cb);

      const handler = mockedOn.mock.calls[0][1] as Function;
      handler({ipcEvent: true}, 'payload');

      expect(cb).not.toHaveBeenCalledWith({ipcEvent: true}, 'payload');
      expect(cb).toHaveBeenCalledWith('payload');
    });
  });

  describe('removeListener', () => {
    it('should call ipcRenderer.removeListener with listener name and callback', () => {
      const cb = jest.fn();
      electronAPI.removeListener('some-listener', cb);

      expect(mockedRemoveListener).toHaveBeenCalledWith('some-listener', cb);
    });
  });

  describe('getBackendPort', () => {
    it('should invoke get-backend-port and return the result', async () => {
      mockedInvoke.mockResolvedValue('3000');

      const result = await electronAPI.getBackendPort();

      expect(mockedInvoke).toHaveBeenCalledWith('get-backend-port');
      expect(result).toBe('3000');
    });
  });

  describe('openPrintWindow', () => {
    it('should invoke OPEN_PRINT_WINDOW with filePath', async () => {
      mockedInvoke.mockResolvedValue('ok');

      const result = await electronAPI.openPrintWindow('/some/file.html');

      expect(mockedInvoke).toHaveBeenCalledWith('OPEN_PRINT_WINDOW', '/some/file.html');
      expect(result).toBe('ok');
    });
  });

  describe('writePrintFile', () => {
    it('should invoke WRITE_PRINT_FILE with content', async () => {
      mockedInvoke.mockResolvedValue('written');

      const result = await electronAPI.writePrintFile('<html>content</html>');

      expect(mockedInvoke).toHaveBeenCalledWith('WRITE_PRINT_FILE', '<html>content</html>');
      expect(result).toBe('written');
    });
  });

  describe('openExternalLink', () => {
    it('should call shell.openExternal with the given link', async () => {
      mockedOpenExternal.mockResolvedValue(undefined);

      await electronAPI.openExternalLink('https://example.com');

      expect(mockedOpenExternal).toHaveBeenCalledWith('https://example.com');
    });

    it('should return a Promise that resolves', async () => {
      mockedOpenExternal.mockResolvedValue(undefined);

      await expect(electronAPI.openExternalLink('https://example.com')).resolves.toBeUndefined();
    });
  });

  describe('showContextMenu', () => {
    it('should call ipcRenderer.send with SHOW_CONTEXT_MENU and payload', () => {
      const payload = {href: 'https://example.com'};
      electronAPI.showContextMenu(payload);

      expect(mockedSend).toHaveBeenCalledWith('SHOW_CONTEXT_MENU', payload);
    });

    it('should handle null href in payload', () => {
      const payload: {href: string | null} = {href: null};
      electronAPI.showContextMenu(payload);

      expect(mockedSend).toHaveBeenCalledWith('SHOW_CONTEXT_MENU', {href: null});
    });
  });
});
