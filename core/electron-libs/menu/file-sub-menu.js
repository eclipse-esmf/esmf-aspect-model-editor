/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

const {icons, paths} = require('../consts');
const {
  SIGNAL_COPY_TO_CLIPBOARD,
  SIGNAL_EXPORT_MODEL,
  SIGNAL_EXPORT_NAMESPACES,
  SIGNAL_IMPORT_NAMESPACES,
  SIGNAL_IMPORT_TO_WORKSPACE,
  SIGNAL_LOAD_FILE,
  SIGNAL_LOAD_FROM_TEXT,
  SIGNAL_LOAD_SPECIFIC_FILE,
  SIGNAL_NEW_EMPTY_MODEL,
  SIGNAL_NEW_WINDOW,
  SIGNAL_SAVE_TO_WORKSPACE,
} = require('../events');
const {getIcon, getFileInfo, openFile} = require('./utils');
const path = require('path');

function fileSubmenu(translation) {
  return [
    {
      id: 'MENU_NEW',
      label: translation.NEW.LABEL,
      icon: getIcon(icons.MENU_NEW.enabled),
      submenu: [
        {
          id: 'NEW_EMPTY_MODEL',
          label: translation.NEW.SUBMENU.EMPTY_MODEL,
          icon: getIcon(icons.NEW_WINDOW.enabled),
          click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_NEW_EMPTY_MODEL),
        },
        {
          id: 'LOAD_FILE',
          label: translation.NEW.SUBMENU.LOAD_FILE,
          icon: getIcon(icons.LOAD_FILE.enabled),
          click: (menuItem, browserWindow, _) =>
            openFile(FILE_TYPE_FILTERS.TTL)
              .then(fileInfo => browserWindow.webContents.send(SIGNAL_LOAD_FILE, fileInfo))
              .catch(error => console.error(error)),
        },
        {
          id: 'LOAD_FROM_TEXT',
          label: translation.NEW.SUBMENU.COPY_PASTE,
          icon: getIcon(icons.LOAD_FROM_TEXT.enabled),
          click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_LOAD_FROM_TEXT),
        },
        {
          type: 'separator',
        },
        {
          label: translation.NEW.SUBMENU.EXAMPLES,
          enabled: false,
        },
        {
          id: 'LOAD_DEFAULT_EXAMPLE',
          label: 'SimpleAspect.ttl',
          icon: getIcon(icons.LOAD_DEFAULT_EXAMPLE.enabled),
          click: (menuItem, browserWindow, _) => {
            return getFileInfo(path.join(paths.models, 'SimpleAspect.ttl'))
              .then(fileInfo => browserWindow.webContents.send(SIGNAL_LOAD_SPECIFIC_FILE, fileInfo))
              .catch(error => console.error(error));
          },
        },
        {
          id: 'LOAD_MOVEMENT_EXAMPLE',
          label: 'Movement.ttl',
          icon: getIcon(icons.LOAD_MOVEMENT_EXAMPLE.enabled),
          click: (menuItem, browserWindow, _) => {
            return getFileInfo(path.join(paths.models, 'Movement.ttl'))
              .then(fileInfo => browserWindow.webContents.send(SIGNAL_LOAD_SPECIFIC_FILE, fileInfo))
              .catch(error => console.error(error));
          },
        },
      ],
    },
    {
      id: 'NEW_WINDOW',
      label: translation.NEW_WINDOW,
      icon: getIcon(icons.NEW_WINDOW.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_NEW_WINDOW),
    },
    {
      id: 'IMPORT_MODEL',
      label: translation.IMPORT_MODEL,
      icon: getIcon(icons.IMPORT_MODEL.enabled),
      click: (menuItem, browserWindow, _) =>
        openFile(FILE_TYPE_FILTERS.TTL)
          .then(fileInfo => browserWindow.webContents.send(SIGNAL_IMPORT_TO_WORKSPACE, fileInfo))
          .catch(error => console.error(error)),
    },
    {
      id: 'IMPORT_PACKAGE',
      label: translation.IMPORT_PACKAGE,
      icon: getIcon(icons.IMPORT_PACKAGE.enabled),
      click: (menuItem, browserWindow, _) =>
        openFile(FILE_TYPE_FILTERS.ZIP)
          .then(fileInfo => browserWindow.webContents.send(SIGNAL_IMPORT_NAMESPACES, fileInfo))
          .catch(error => console.error(error)),
    },
    {
      type: 'separator',
    },
    {
      id: 'COPY_TO_CLIPBOARD',
      label: translation.COPY_TO_CLIPBOARD,
      icon: getIcon(icons.COPY_TO_CLIPBOARD.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_COPY_TO_CLIPBOARD),
    },
    {
      id: 'SAVE_TO_WORKSPACE',
      label: translation.SAVE_TO_WORKSPACE,
      icon: getIcon(icons.SAVE_TO_WORKSPACE.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SAVE_TO_WORKSPACE),
    },
    {
      id: 'EXPORT_MODEL',
      label: translation.EXPORT_MODEL,
      icon: getIcon(icons.EXPORT_MODEL.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_EXPORT_MODEL),
    },
    {
      id: 'EXPORT_PACKAGE',
      label: translation.EXPORT_PACKAGE,
      icon: getIcon(icons.EXPORT_PACKAGE.enabled),
      click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_EXPORT_NAMESPACES),
    },
  ];
}

const FILE_TYPE_FILTERS = {
  ZIP: [{name: 'ZIP Files', extensions: ['zip']}],
  TTL: [{name: 'Turtle Files', extensions: ['ttl']}],
};

module.exports = {fileSubmenu};
