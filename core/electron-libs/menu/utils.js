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

const {nativeImage, dialog} = require('electron');
const {promisify} = require('util');
const fs = require('fs');
const pathOs = require('path');

function getIcon(iconPath, options = {width: 20, height: 20, quality: 'best'}) {
  return nativeImage.createFromPath(iconPath).resize(options);
}

async function openFile(filters) {
  const selection = await dialog.showOpenDialog({properties: ['openFile'], filters});
  if (selection.canceled || !selection.filePaths?.length) throw new Error('No file selected');

  return await getFileInfo(selection.filePaths[0]);
}

async function getFileInfo(path) {
  return {
    path,
    content: await readFile(path),
    name: path.split(pathOs.sep).pop()
  };
}

const readFile = promisify(fs.readFile);

module.exports = {getIcon, openFile, getFileInfo};
