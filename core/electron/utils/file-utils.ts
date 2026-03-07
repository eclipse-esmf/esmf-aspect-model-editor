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

import {dialog} from 'electron';
import * as fs from 'fs';
import * as pathOs from 'path';
import {promisify} from 'util';

export const readFile = promisify(fs.readFile);

type OpenDialogResult = {canceled: boolean; filePaths: string[]} | string[];

export async function openFile(filters: Electron.FileFilter[]): Promise<{path: string; content: Buffer; name: string}> {
  const result = (await dialog.showOpenDialog({properties: ['openFile'], filters})) as OpenDialogResult;
  if (Array.isArray(result)) {
    if (!result.length) throw new Error('No file selected');
    return await getFileInfo(result[0]);
  } else {
    if (result.canceled || !result.filePaths.length) throw new Error('No file selected');
    return await getFileInfo(result.filePaths[0]);
  }
}

export async function getFileInfo(filePath: string): Promise<{path: string; content: Buffer; name: string}> {
  return {
    path: filePath,
    content: await readFile(filePath),
    name: pathOs.basename(filePath),
  };
}
