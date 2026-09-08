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

const {
  mockIpcMainOn,
  mockIpcMainHandle,
  mockIpcMainEmit,
  mockMenuSetApplicationMenu,
  mockMenuBuildFromTemplate,
  mockMenuPopup,
  mockShellOpenExternal,
  mockClipboardWriteText,
  makeMockWindow,
  state,
} = vi.hoisted(() => {
  const makeMockWindow = () => ({
    webContents: {
      id: Math.floor(Math.random() * 1000) + 1,
      send: vi.fn(),
      openDevTools: vi.fn(),
      setWindowOpenHandler: vi.fn(),
    },
    show: vi.fn(),
    focus: vi.fn(),
    destroy: vi.fn(),
    maximize: vi.fn(),
    removeMenu: vi.fn(),
    loadURL: (vi.fn() as any).mockResolvedValue(undefined),
    loadFile: (vi.fn() as any).mockResolvedValue(undefined),
    on: vi.fn(),
  });

  return {
    mockIpcMainOn: vi.fn(),
    mockIpcMainHandle: vi.fn(),
    mockIpcMainEmit: vi.fn(),
    mockMenuSetApplicationMenu: vi.fn(),
    mockMenuBuildFromTemplate: vi.fn(),
    mockMenuPopup: vi.fn(),
    mockShellOpenExternal: vi.fn(),
    mockClipboardWriteText: vi.fn(),
    makeMockWindow,
    state: {mockWindowInstance: makeMockWindow()},
  };
});

let mockWindowInstance = state.mockWindowInstance;

vi.mock('electron', () => ({
  BrowserWindow: Object.assign(
    vi.fn().mockImplementation(function () {
      return state.mockWindowInstance;
    }),
    {fromWebContents: vi.fn()},
  ),
  ipcMain: {
    on: mockIpcMainOn,
    handle: mockIpcMainHandle,
    emit: mockIpcMainEmit,
  },
  Menu: {
    setApplicationMenu: mockMenuSetApplicationMenu,
    buildFromTemplate: mockMenuBuildFromTemplate.mockReturnValue({items: [], popup: mockMenuPopup}),
  },
  MenuItem: vi.fn(),
  shell: {openExternal: mockShellOpenExternal},
  clipboard: {writeText: mockClipboardWriteText},
}));

vi.mock('./const/icons', () => ({
  icons: new Proxy({}, {get: () => ({enabled: 'icon-on', disabled: 'icon-off'})}),
}));

vi.mock('./events/events', () => ({
  EVENTS: {
    REQUEST: {
      CREATE_WINDOW: 'CREATE_WINDOW',
      UPDATE_DATA: 'UPDATE_DATA',
      MAXIMIZE_WINDOW: 'MAXIMIZE_WINDOW',
      IS_FIRST_WINDOW: 'IS_FIRST_WINDOW',
      CLOSE_WINDOW: 'CLOSE_WINDOW',
      WINDOW_DATA: 'WINDOW_DATA',
      IS_FILE_SAVED: 'IS_FILE_SAVED',
      EDIT_ELEMENT: 'EDIT_ELEMENT',
      SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
      REFRESH_WORKSPACE: 'REFRESH_WORKSPACE',
    },
    RESPONSE: {
      IS_FIRST_WINDOW: 'IS_FIRST_WINDOW',
      WINDOW_DATA: 'WINDOW_DATA',
    },
    SIGNAL: {
      REFRESH_WORKSPACE: 'REFRESH_WORKSPACE',
      WINDOW_FOCUS: 'WINDOW_FOCUS',
      UPDATE_MENU_ITEM: 'UPDATE_MENU_ITEM',
      TRANSLATE_MENU_ITEMS: 'TRANSLATE_MENU_ITEMS',
      OPEN_PRINT_WINDOW: 'OPEN_PRINT_WINDOW',
      WRITE_PRINT_FILE: 'WRITE_PRINT_FILE',
      SHOW_CONTEXT_MENU: 'SHOW_CONTEXT_MENU',
    },
  },
}));

vi.mock('./menu/app', () => ({
  appMenuTemplate: vi.fn().mockReturnValue([]),
}));

vi.mock('./utils/icon-utils', () => ({
  getIcon: vi.fn().mockReturnValue('mock-icon'),
}));

vi.mock('./utils/mode', () => ({
  inDevMode: vi.fn().mockReturnValue(true),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  promises: {writeFile: (vi.fn() as unknown as MockedFunction<(...args: any[]) => any>).mockResolvedValue(undefined)},
}));

vi.mock('os', () => ({homedir: vi.fn().mockReturnValue('/home/user')}));

import {BrowserWindow} from 'electron';
import {EVENTS} from './events/events';
import {inDevMode} from './utils/mode';
import {windowsManager} from './windows-manager';

const mockedInDevMode = inDevMode as unknown as MockedFunction<(...args: any[]) => any>;
const mockedBrowserWindow = BrowserWindow as unknown as MockedFunction<(...args: any[]) => any>;
const mockedFromWebContents = BrowserWindow.fromWebContents as unknown as MockedFunction<(...args: any[]) => any>;

function getIpcHandler(event: string): (...args: any[]) => any {
  const call = mockIpcMainOn.mock.calls.find((c: any[]) => c[0] === event);
  return call?.[1] as (...args: any[]) => any;
}

function getIpcHandleHandler(event: string): (...args: any[]) => any {
  const call = mockIpcMainHandle.mock.calls.find((c: any[]) => c[0] === event);
  return call?.[1] as (...args: any[]) => any;
}

describe('WindowsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowInstance = makeMockWindow();
    mockedBrowserWindow.mockImplementation(function () {
      return mockWindowInstance;
    });
    mockMenuBuildFromTemplate.mockReturnValue({items: [], popup: mockMenuPopup});
  });

  describe('activateCommunicationProtocol', () => {
    it('should register all required IPC event handlers', () => {
      windowsManager.activateCommunicationProtocol();

      const registeredEvents = mockIpcMainOn.mock.calls.map((c: any[]) => c[0]);

      expect(registeredEvents).toContain(EVENTS.REQUEST.CREATE_WINDOW);
      expect(registeredEvents).toContain(EVENTS.REQUEST.UPDATE_DATA);
      expect(registeredEvents).toContain(EVENTS.REQUEST.MAXIMIZE_WINDOW);
      expect(registeredEvents).toContain(EVENTS.REQUEST.IS_FIRST_WINDOW);
      expect(registeredEvents).toContain(EVENTS.REQUEST.CLOSE_WINDOW);
      expect(registeredEvents).toContain(EVENTS.SIGNAL.REFRESH_WORKSPACE);
      expect(registeredEvents).toContain(EVENTS.SIGNAL.WINDOW_FOCUS);
      expect(registeredEvents).toContain(EVENTS.SIGNAL.UPDATE_MENU_ITEM);
      expect(registeredEvents).toContain(EVENTS.SIGNAL.TRANSLATE_MENU_ITEMS);
      expect(registeredEvents).toContain(EVENTS.SIGNAL.SHOW_CONTEXT_MENU);
    });

    it('should register IPC handle handlers for OPEN_PRINT_WINDOW and WRITE_PRINT_FILE', () => {
      windowsManager.activateCommunicationProtocol();

      const handleEvents = mockIpcMainHandle.mock.calls.map((c: any[]) => c[0]);

      expect(handleEvents).toContain(EVENTS.SIGNAL.OPEN_PRINT_WINDOW);
      expect(handleEvents).toContain(EVENTS.SIGNAL.WRITE_PRINT_FILE);
    });
  });

  describe('createNewWindow', () => {
    it('should create a new BrowserWindow', () => {
      windowsManager.createNewWindow();

      expect(mockedBrowserWindow).toHaveBeenCalled();
    });

    it('should call show() on the new window', () => {
      windowsManager.createNewWindow();

      expect(mockWindowInstance.show).toHaveBeenCalled();
    });

    it('should call removeMenu() on the new window', () => {
      windowsManager.createNewWindow();

      expect(mockWindowInstance.removeMenu).toHaveBeenCalled();
    });

    it('should call setWindowOpenHandler on webContents', () => {
      windowsManager.createNewWindow();

      expect(mockWindowInstance.webContents.setWindowOpenHandler).toHaveBeenCalled();
    });

    it('should load dev URL in dev mode', async () => {
      mockedInDevMode.mockReturnValue(true);

      windowsManager.createNewWindow();
      await Promise.resolve();

      expect(mockWindowInstance.loadURL).toHaveBeenCalledWith('http://localhost:4200');
    });

    it('should load production file in prod mode', async () => {
      mockedInDevMode.mockReturnValue(false);

      windowsManager.createNewWindow();
      await Promise.resolve();

      expect(mockWindowInstance.loadFile).toHaveBeenCalledWith('./dist/apps/ame/index.html');
    });

    it('should return the BrowserWindow instance', () => {
      const result = windowsManager.createNewWindow();

      expect(result).toBe(mockWindowInstance);
    });
  });

  describe('createWindow', () => {
    it('should show and focus the existing window', () => {
      const activeWindow = {
        id: 1,
        window: mockWindowInstance as any,
        options: {namespace: 'ns', file: 'file.ttl'},
        menu: null as any,
      };

      windowsManager.createWindow(activeWindow, {namespace: 'ns', file: 'file.ttl'});

      expect(mockWindowInstance.show).toHaveBeenCalled();
      expect(mockWindowInstance.focus).toHaveBeenCalled();
    });

    it('should send EDIT_ELEMENT event when editElement is provided', () => {
      const activeWindow = {
        id: 1,
        window: mockWindowInstance as any,
        options: {namespace: 'ns', file: 'file.ttl'},
        menu: null as any,
      };

      windowsManager.createWindow(activeWindow, {namespace: 'ns', file: 'file.ttl', editElement: 'MyElement'});

      expect(mockWindowInstance.webContents.send).toHaveBeenCalledWith(EVENTS.REQUEST.EDIT_ELEMENT, 'MyElement');
    });

    it('should send SHOW_NOTIFICATION when no editElement is provided', () => {
      const activeWindow = {
        id: 1,
        window: mockWindowInstance as any,
        options: {namespace: 'ns', file: 'file.ttl'},
        menu: null as any,
      };

      windowsManager.createWindow(activeWindow, {namespace: 'ns', file: 'file.ttl'});

      expect(mockWindowInstance.webContents.send).toHaveBeenCalledWith(EVENTS.REQUEST.SHOW_NOTIFICATION, 'Model already loaded');
    });
  });

  describe('IPC handlers', () => {
    beforeEach(() => {
      windowsManager.activateCommunicationProtocol();
    });

    describe('IS_FIRST_WINDOW', () => {
      it('should respond with boolean indicating if only one window is active', () => {
        const mockSend = vi.fn();
        const event = {sender: {id: mockWindowInstance.webContents.id, send: mockSend}};

        const handler = getIpcHandler(EVENTS.REQUEST.IS_FIRST_WINDOW);
        handler(event);

        expect(mockSend).toHaveBeenCalledWith(EVENTS.RESPONSE.IS_FIRST_WINDOW, expect.any(Boolean));
      });
    });

    describe('MAXIMIZE_WINDOW', () => {
      it('should maximize the window that sent the request', () => {
        windowsManager.createNewWindow();
        const event = {sender: {id: mockWindowInstance.webContents.id}};

        const handler = getIpcHandler(EVENTS.REQUEST.MAXIMIZE_WINDOW);
        handler(event);

        expect(mockWindowInstance.maximize).toHaveBeenCalled();
      });
    });

    describe('WRITE_PRINT_FILE', () => {
      it('should write print file and return path', async () => {
        const handler = getIpcHandleHandler(EVENTS.SIGNAL.WRITE_PRINT_FILE);
        const result = await handler({}, '<html>content</html>');

        expect(result).toContain('print.html');
      });
    });

    describe('SHOW_CONTEXT_MENU', () => {
      it('should show context menu with open-in-browser item for http links', () => {
        const mockWin = makeMockWindow();
        mockedFromWebContents.mockReturnValue(mockWin);

        const handler = getIpcHandler(EVENTS.SIGNAL.SHOW_CONTEXT_MENU);
        handler({sender: {}}, {href: 'https://example.com'});

        expect(mockMenuBuildFromTemplate).toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({label: 'Open in browser'})]),
        );
      });

      it('should show context menu with send-email item for mailto links', () => {
        const mockWin = makeMockWindow();
        mockedFromWebContents.mockReturnValue(mockWin);

        const handler = getIpcHandler(EVENTS.SIGNAL.SHOW_CONTEXT_MENU);
        handler({sender: {}}, {href: 'mailto:test@example.com'});

        expect(mockMenuBuildFromTemplate).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({label: 'Send email'})]));
      });

      it('should show empty context menu when href is null', () => {
        const mockWin = makeMockWindow();
        mockedFromWebContents.mockReturnValue(mockWin);

        const handler = getIpcHandler(EVENTS.SIGNAL.SHOW_CONTEXT_MENU);
        handler({sender: {}}, {href: null});

        expect(mockMenuBuildFromTemplate).toHaveBeenCalledWith([]);
      });

      it('should not show menu when no window is found', () => {
        mockedFromWebContents.mockReturnValue(null);

        const handler = getIpcHandler(EVENTS.SIGNAL.SHOW_CONTEXT_MENU);
        handler({sender: {}}, {href: 'https://example.com'});

        expect(mockMenuPopup).not.toHaveBeenCalled();
      });
    });

    describe('CLOSE_WINDOW', () => {
      it('should remove window from active windows and destroy it', () => {
        windowsManager.createNewWindow();
        const windowId = mockWindowInstance.webContents.id;
        const event = {sender: {id: windowId}};

        const handler = getIpcHandler(EVENTS.REQUEST.CLOSE_WINDOW);
        handler(event);

        expect(mockWindowInstance.destroy).toHaveBeenCalled();
      });
    });

    describe('WINDOW_DATA', () => {
      it('should send window data back to requesting window', () => {
        windowsManager.createNewWindow();
        const mockSend = vi.fn();
        const event = {sender: {id: mockWindowInstance.webContents.id, send: mockSend}};

        const handler = getIpcHandler(EVENTS.REQUEST.WINDOW_DATA);
        handler(event);

        expect(mockSend).toHaveBeenCalledWith(
          EVENTS.RESPONSE.WINDOW_DATA,
          expect.objectContaining({id: mockWindowInstance.webContents.id}),
        );
      });
    });
  });
});
