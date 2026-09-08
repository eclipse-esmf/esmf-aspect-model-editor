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

import {BaseWindow, BrowserWindow, MenuItem, MenuItemConstructorOptions} from 'electron';
import * as path from 'path';
import {icons} from '../const/icons';
import {paths} from '../const/paths';
import {EVENTS} from '../events/events';
import {getFileInfo, openFile} from '../utils/file-utils';
import {getIcon} from '../utils/icon-utils';
import {Translation} from './app';

const FILE_TYPE_FILTERS: Record<string, Electron.FileFilter[]> = {
  ZIP: [{name: 'ZIP Files', extensions: ['zip']}],
  TTL: [{name: 'Turtle Files', extensions: ['ttl']}],
};

export function file(translation: Translation): MenuItemConstructorOptions[] {
  return [
    {
      id: 'MENU_NEW',
      label: translation.new.label,
      icon: getIcon(icons.MENU_NEW.enabled),
      submenu: [
        {
          id: 'NEW_EMPTY_MODEL',
          label: translation.new.submenu.emptyModel,
          enabled: false,
          icon: getIcon(icons.NEW_WINDOW.enabled),
          click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
            const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
            bw?.webContents.send(EVENTS.SIGNAL.NEW_EMPTY_MODEL);
          },
        },
        {
          id: 'LOAD_FILE',
          label: translation.new.submenu.loadFile,
          icon: getIcon(icons.LOAD_FILE.enabled),
          click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
            const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
            openFile(FILE_TYPE_FILTERS.TTL)
              .then(fileInfo => bw?.webContents.send(EVENTS.SIGNAL.LOAD_FILE, fileInfo))
              .catch(error => console.error(error));
          },
        },
        {
          id: 'LOAD_FROM_TEXT',
          label: translation.new.submenu.copyPaste,
          icon: getIcon(icons.LOAD_FROM_TEXT.enabled),
          click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
            const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
            bw?.webContents.send(EVENTS.SIGNAL.LOAD_FROM_TEXT);
          },
        },
        {
          type: 'separator',
        },
        {
          label: translation.new.submenu.examples,
          enabled: false,
        },
        {
          id: 'LOAD_DEFAULT_EXAMPLE',
          label: 'SimpleAspect.ttl',
          icon: getIcon(icons.LOAD_DEFAULT_EXAMPLE.enabled),
          click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
            const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
            getFileInfo(path.join(paths.models, 'SimpleAspect.ttl'))
              .then(fileInfo => bw?.webContents.send(EVENTS.SIGNAL.LOAD_SPECIFIC_FILE, fileInfo))
              .catch(error => console.error(error));
          },
        },
        {
          id: 'LOAD_MOVEMENT_EXAMPLE',
          label: 'Movement.ttl',
          icon: getIcon(icons.LOAD_MOVEMENT_EXAMPLE.enabled),
          click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
            const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
            getFileInfo(path.join(paths.models, 'Movement.ttl'))
              .then(fileInfo => bw?.webContents.send(EVENTS.SIGNAL.LOAD_SPECIFIC_FILE, fileInfo))
              .catch(error => console.error(error));
          },
        },
      ],
    },
    {
      id: 'NEW_WINDOW',
      label: translation.newWindow,
      icon: getIcon(icons.NEW_WINDOW.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.NEW_WINDOW);
      },
    },
    {
      id: 'IMPORT_MODEL',
      label: translation.importModel,
      icon: getIcon(icons.IMPORT_MODEL.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        openFile(FILE_TYPE_FILTERS.TTL)
          .then(fileInfo => bw?.webContents.send(EVENTS.SIGNAL.IMPORT_TO_WORKSPACE, fileInfo))
          .catch(error => console.error(error));
      },
    },
    {
      id: 'IMPORT_PACKAGE',
      label: translation.importPackage,
      icon: getIcon(icons.IMPORT_PACKAGE.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        openFile(FILE_TYPE_FILTERS.ZIP)
          .then(fileInfo => bw?.webContents.send(EVENTS.SIGNAL.IMPORT_NAMESPACES, fileInfo))
          .catch(error => console.error(error));
      },
    },
    {
      type: 'separator',
    },
    {
      id: 'COPY_TO_CLIPBOARD',
      label: translation.copyToClipboard,
      enabled: false,
      icon: getIcon(icons.COPY_TO_CLIPBOARD.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.COPY_TO_CLIPBOARD);
      },
    },
    {
      id: 'SAVE_TO_WORKSPACE',
      label: translation.saveToWorkspace,
      enabled: false,
      icon: getIcon(icons.SAVE_TO_WORKSPACE.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.SAVE_TO_WORKSPACE);
      },
    },
    {
      id: 'EXPORT_MODEL',
      label: translation.exportModel,
      enabled: false,
      icon: getIcon(icons.EXPORT_MODEL.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.EXPORT_MODEL);
      },
    },
    {
      id: 'EXPORT_PACKAGE',
      label: translation.exportPackage,
      icon: getIcon(icons.EXPORT_PACKAGE.enabled),
      click: (_menuItem: MenuItem, window: BaseWindow | undefined) => {
        const bw = window instanceof BrowserWindow ? window : BrowserWindow.getFocusedWindow();
        bw?.webContents.send(EVENTS.SIGNAL.EXPORT_NAMESPACES);
      },
    },
  ];
}

export default {fileSubmenu: file};
