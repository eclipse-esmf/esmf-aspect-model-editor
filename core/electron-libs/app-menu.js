/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

const {nativeImage, dialog} = require('electron');
const {promisify} = require('util');
const fs = require('fs');
const pathOs = require('path');
const {
  SIGNAL_NEW_EMPTY_MODEL,
  SIGNAL_LOAD_FILE,
  SIGNAL_LOAD_SPECIFIC_FILE,
  SIGNAL_NEW_WINDOW,
  SIGNAL_IMPORT_TO_WORKSPACE,
  SIGNAL_IMPORT_NAMESPACES,
  SIGNAL_COPY_TO_CLIPBOARD,
  SIGNAL_SAVE_TO_WORKSPACE,
  SIGNAL_EXPORT_MODEL,
  SIGNAL_EXPORT_NAMESPACES,
  SIGNAL_SHOW_HIDE_TOOLBAR,
  SIGNAL_SHOW_HIDE_MINIMAP,
  SIGNAL_FILTER_MODEL_BY,
  SIGNAL_OPEN_SELECTED_ELEMENT,
  SIGNAL_REMOVE_SELECTED_ELEMENT,
  SIGNAL_COLLAPSE_EXPAND_MODEL,
  SIGNAL_FORMAT_MODEL,
  SIGNAL_CONNECT_ELEMENTS,
  SIGNAL_VALIDATE_MODEL,
  SIGNAL_GENERATE_HTML_DOCUMENTATION,
  SIGNAL_GENERATE_OPEN_API_SPECIFICATION,
  SIGNAL_GENERATE_AASX_XML,
  SIGNAL_GENERATE_JSON_PAYLOAD,
  SIGNAL_GENERATE_JSON_SCHEMA,
  SIGNAL_ZOOM_TO_FIT,
  SIGNAL_ZOOM_TO_ACTUAL,
  SIGNAL_SEARCH_ELEMENTS,
  SIGNAL_SEARCH_FILES,
  SIGNAL_ZOOM_IN,
  SIGNAL_ZOOM_OUT,
  SIGNAL_LOAD_FROM_TEXT,
} = require('./events');
const {icons} = require('./consts');
const {isMac} = require('./os-checker');

const readFile = promisify(fs.readFile);

const FILE_TYPE_FILTERS = {
  ZIP: [{name: 'ZIP Files', extensions: ['zip']}],
  TTL: [{name: 'Turtle Files', extensions: ['ttl']}],
};

function getIcon(iconPath, options = {width: 20, height: 20, quality: 'best'}) {
  return nativeImage.createFromPath(iconPath).resize(options);
}

async function getFileInfo(path) {
  return {
    path,
    content: await readFile(path),
    name: path.split(pathOs.sep).pop(),
  };
}

async function openFile(filters) {
  const selection = await dialog.showOpenDialog({properties: ['openFile'], filters});
  if (selection.canceled || !selection.filePaths?.length) throw new Error('No file selected');

  return await getFileInfo(selection.filePaths[0]);
}

const fileSubmenu = [
  {
    id: 'MENU_NEW',
    label: 'New...',
    icon: getIcon(icons.MENU_NEW.enabled),
    submenu: [
      {
        id: 'NEW_EMPTY_MODEL',
        label: 'Empty model',
        icon: getIcon(icons.NEW_WINDOW.enabled),
        click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_NEW_EMPTY_MODEL),
      },
      {
        id: 'LOAD_FILE',
        label: 'Load File...',
        icon: getIcon(icons.LOAD_FILE.enabled),
        click: (menuItem, browserWindow, _) =>
          openFile(FILE_TYPE_FILTERS.TTL)
            .then(fileInfo => browserWindow.webContents.send(SIGNAL_LOAD_FILE, fileInfo))
            .catch(error => console.error(error)),
      },
      {
        id: 'LOAD_FROM_TEXT',
        label: 'Copy Paste',
        icon: getIcon(icons.LOAD_FROM_TEXT.enabled),
        click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_LOAD_FROM_TEXT),
      },
      {
        type: 'separator',
      },
      {
        label: 'Examples',
        enabled: false,
      },
      {
        id: 'LOAD_DEFAULT_EXAMPLE',
        label: 'SimpleAspect.ttl',
        icon: getIcon(icons.LOAD_DEFAULT_EXAMPLE.enabled),
        click: (menuItem, browserWindow, _) =>
          getFileInfo('./apps/ame/src/assets/aspect-models/org.eclipse.examples/1.0.0/SimpleAspect.ttl')
            .then(fileInfo => browserWindow.webContents.send(SIGNAL_LOAD_SPECIFIC_FILE, fileInfo))
            .catch(error => console.error(error)),
      },
      {
        id: 'LOAD_MOVEMENT_EXAMPLE',
        label: 'Movement.ttl',
        icon: getIcon(icons.LOAD_MOVEMENT_EXAMPLE.enabled),
        click: (menuItem, browserWindow, _) =>
          getFileInfo('./apps/ame/src/assets/aspect-models/org.eclipse.examples/1.0.0/Movement.ttl')
            .then(fileInfo => browserWindow.webContents.send(SIGNAL_LOAD_SPECIFIC_FILE, fileInfo))
            .catch(error => console.error(error)),
      },
    ],
  },
  {
    id: 'NEW_WINDOW',
    label: 'New Window',
    icon: getIcon(icons.NEW_WINDOW.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_NEW_WINDOW),
  },
  {
    id: 'IMPORT_TO_WORKSPACE',
    label: 'Import to Workspace',
    icon: getIcon(icons.IMPORT_TO_WORKSPACE.enabled),
    click: (menuItem, browserWindow, _) =>
      openFile(FILE_TYPE_FILTERS.TTL)
        .then(fileInfo => browserWindow.webContents.send(SIGNAL_IMPORT_TO_WORKSPACE, fileInfo))
        .catch(error => console.error(error)),
  },
  {
    id: 'IMPORT_NAMESPACES',
    label: 'Import Namespaces',
    icon: getIcon(icons.IMPORT_NAMESPACES.enabled),
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
    label: 'Copy to Clipboard',
    icon: getIcon(icons.COPY_TO_CLIPBOARD.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_COPY_TO_CLIPBOARD),
  },
  {
    id: 'SAVE_TO_WORKSPACE',
    label: 'Save to Workspace',
    icon: getIcon(icons.SAVE_TO_WORKSPACE.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SAVE_TO_WORKSPACE),
  },
  {
    id: 'EXPORT_MODEL',
    label: 'Export Model',
    icon: getIcon(icons.EXPORT_MODEL.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_EXPORT_MODEL),
  },
  {
    id: 'EXPORT_NAMESPACES',
    label: 'Export Namespaces',
    icon: getIcon(icons.EXPORT_NAMESPACES.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_EXPORT_NAMESPACES),
  },
];

const viewSubmenu = [
  {
    id: 'SHOW_HIDE_TOOLBAR',
    label: 'Toggle Toolbar',
    icon: getIcon(icons.SHOW_HIDE_TOOLBAR.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SHOW_HIDE_TOOLBAR),
  },
  {
    id: 'SHOW_HIDE_MINIMAP',
    label: 'Toggle Minimap',
    icon: getIcon(icons.SHOW_HIDE_MINIMAP.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SHOW_HIDE_MINIMAP),
  },
  {
    id: 'MENU_FILTER_MODEL_BY',
    label: 'Filter Model by...',
    icon: getIcon(icons.MENU_FILTER_MODEL_BY.enabled),
    submenu: [
      {
        id: 'FILTER_MODEL_BY_NONE',
        label: 'None',
        icon: getIcon(icons.FILTER_MODEL_BY_NONE.enabled),
        // Value must match "ModelFilter.DEFAULT" enum item
        click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_FILTER_MODEL_BY, 'default'),
      },
      {
        id: 'FILTER_MODEL_BY_PROPERTIES',
        label: 'Properties',
        icon: getIcon(icons.FILTER_MODEL_BY_PROPERTIES.enabled),
        // Value must match "ModelFilter.PROPERTIES" enum item
        click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_FILTER_MODEL_BY, 'properties'),
      },
    ],
  },
  {
    type: 'separator',
  },
  {
    id: 'ZOOM_IN',
    label: 'Zoom in',
    icon: getIcon(icons.ZOOM_IN.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_ZOOM_IN),
  },
  {
    id: 'ZOOM_OUT',
    label: 'Zoom out',
    icon: getIcon(icons.ZOOM_OUT.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_ZOOM_OUT),
  },
  {
    id: 'ZOOM_TO_FIT',
    label: 'Zoom to Fit',
    icon: getIcon(icons.ZOOM_TO_FIT.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_ZOOM_TO_FIT),
  },
  {
    id: 'ZOOM_TO_ACTUAL',
    label: 'Zoom to 100%',
    icon: getIcon(icons.ZOOM_TO_ACTUAL.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_ZOOM_TO_ACTUAL),
  },
];

const editSubmenu = [
  {
    id: 'OPEN_SELECTED_ELEMENT',
    label: 'Open Selected Element',
    enabled: false,
    icon: getIcon(icons.OPEN_SELECTED_ELEMENT.disabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_OPEN_SELECTED_ELEMENT),
  },
  {
    id: 'REMOVE_SELECTED_ELEMENT',
    label: 'Remove Selected Element',
    enabled: false,
    icon: getIcon(icons.REMOVE_SELECTED_ELEMENT.disabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_REMOVE_SELECTED_ELEMENT),
  },
  {
    id: 'COLLAPSE_EXPAND_MODEL',
    label: 'Collapse/Expand Model',
    icon: getIcon(icons.COLLAPSE_EXPAND_MODEL.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_COLLAPSE_EXPAND_MODEL),
  },
  {
    id: 'FORMAT_MODEL',
    label: 'Format Model',
    // TODO: Rotate icon
    icon: getIcon(icons.FORMAT_MODEL.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_FORMAT_MODEL),
  },
  {
    id: 'CONNECT_ELEMENTS',
    label: 'Connect Selected Elements',
    enabled: false,
    icon: getIcon(icons.CONNECT_ELEMENTS.disabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_CONNECT_ELEMENTS),
  },
];

const validateSubmenu = [
  {
    id: 'VALIDATE_MODEL',
    label: 'Current Model',
    icon: getIcon(icons.VALIDATE_MODEL.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_VALIDATE_MODEL),
  },
];

const generateSubmenu = [
  {
    id: 'GENERATE_HTML_DOCUMENTATION',
    label: 'HTML Documentation',
    icon: getIcon(icons.GENERATE_HTML_DOCUMENTATION.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_HTML_DOCUMENTATION),
  },
  {
    id: 'GENERATE_OPEN_API_SPECIFICATION',
    label: 'OpenAPI Specification',
    icon: getIcon(icons.GENERATE_OPEN_API_SPECIFICATION.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_OPEN_API_SPECIFICATION),
  },
  {
    id: 'GENERATE_AASX_XML',
    label: 'AASX / XML',
    icon: getIcon(icons.GENERATE_AASX_XML.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_AASX_XML),
  },
  {
    type: 'separator',
  },
  {
    id: 'GENERATE_JSON_PAYLOAD',
    label: 'Sample JSON Payload',
    icon: getIcon(icons.GENERATE_JSON_PAYLOAD.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_JSON_PAYLOAD),
  },
  {
    id: 'GENERATE_JSON_SCHEMA',
    label: 'JSON Schema',
    icon: getIcon(icons.GENERATE_JSON_SCHEMA.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_GENERATE_JSON_SCHEMA),
  },
];

const searchSubmenu = [
  {
    id: 'SEARCH_ELEMENTS',
    label: 'Elements',
    icon: getIcon(icons.SEARCH_ELEMENTS.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SEARCH_ELEMENTS),
  },
  {
    id: 'SEARCH_FILES',
    label: 'Files',
    icon: getIcon(icons.SEARCH_FILES.enabled),
    click: (menuItem, browserWindow, _) => browserWindow.webContents.send(SIGNAL_SEARCH_FILES),
  },
];

/** @type {Electron.MenuItem[]} */
const APP_MENU_TEMPLATE = [
  ...(isMac
    ? [
        {
          role: 'appMenu',
        },
      ]
    : []),
  {
    id: 'MENU_FILE',
    label: 'File',
    submenu: fileSubmenu,
  },
  {
    id: 'MENU_VIEW',
    label: 'View',
    submenu: viewSubmenu,
  },
  {
    id: 'MENU_EDIT',
    label: 'Edit\u200B', // Add an invisible character to avoid recognition of the menu as a default OS menu
    submenu: editSubmenu,
  },
  {
    id: 'MENU_VALIDATE',
    label: 'Validate',
    submenu: validateSubmenu,
  },
  {
    id: 'MENU_GENERATE',
    label: 'Generate',
    submenu: generateSubmenu,
  },
  {
    id: 'MENU_SEARCH',
    label: 'Search',
    submenu: searchSubmenu,
  },
];

exports.APP_MENU_TEMPLATE = APP_MENU_TEMPLATE;
exports.getIcon = getIcon;
