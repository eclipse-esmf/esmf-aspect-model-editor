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

import * as fs from 'fs';
import * as pathOs from 'path';
import {dialog} from 'electron';
import {describe, it, expect, beforeEach, jest} from '@jest/globals';
import {openFile, getFileInfo} from './file-utils';

jest.mock('electron', () => ({
  dialog: {
    showOpenDialog: jest.fn(),
  },
}));

jest.mock('fs');

const mockedShowOpenDialog = dialog.showOpenDialog as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedReadFile = fs.readFile as unknown as jest.MockedFunction<(...args: any[]) => any>;

describe('file-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFileInfo', () => {
    it('should return path, content and name for a given file path', async () => {
      const fakePath = '/some/dir/model.ttl';
      const fakeContent = Buffer.from('fake content');

      mockedReadFile.mockImplementation((_path: any, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => {
        callback(null, fakeContent);
      });

      const result = await getFileInfo(fakePath);

      expect(result.path).toBe(fakePath);
      expect(result.content).toEqual(fakeContent);
      expect(result.name).toBe(pathOs.basename(fakePath));
    });

    it('should throw if readFile fails', async () => {
      const fakePath = '/some/dir/model.ttl';

      mockedReadFile.mockImplementation((_path: any, callback: (err: NodeJS.ErrnoException | null, data: Buffer | null) => void) => {
        callback(new Error('Read error'), null);
      });

      await expect(getFileInfo(fakePath)).rejects.toThrow('Read error');
    });
  });

  describe('openFile', () => {
    const filters: Electron.FileFilter[] = [{name: 'TTL Files', extensions: ['ttl']}];

    it('should return file info when dialog returns object result with filePaths', async () => {
      const fakePath = '/some/dir/model.ttl';
      const fakeContent = Buffer.from('fake content');

      mockedShowOpenDialog.mockResolvedValue({canceled: false, filePaths: [fakePath]});

      mockedReadFile.mockImplementation((_path: any, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => {
        callback(null, fakeContent);
      });

      const result = await openFile(filters);

      expect(result.path).toBe(fakePath);
      expect(result.content).toEqual(fakeContent);
      expect(result.name).toBe('model.ttl');
    });

    it('should throw when dialog returns canceled: true', async () => {
      mockedShowOpenDialog.mockResolvedValue({canceled: true, filePaths: []});

      await expect(openFile(filters)).rejects.toThrow('No file selected');
    });

    it('should throw when dialog returns empty filePaths', async () => {
      mockedShowOpenDialog.mockResolvedValue({canceled: false, filePaths: []});

      await expect(openFile(filters)).rejects.toThrow('No file selected');
    });

    it('should return file info when dialog returns array result (legacy)', async () => {
      const fakePath = '/some/dir/model.ttl';
      const fakeContent = Buffer.from('fake content');

      mockedShowOpenDialog.mockResolvedValue([fakePath]);

      mockedReadFile.mockImplementation((_path: any, callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void) => {
        callback(null, fakeContent);
      });

      const result = await openFile(filters);

      expect(result.path).toBe(fakePath);
      expect(result.name).toBe('model.ttl');
    });

    it('should throw when dialog returns empty array (legacy)', async () => {
      mockedShowOpenDialog.mockResolvedValue([]);

      await expect(openFile(filters)).rejects.toThrow('No file selected');
    });
  });
});
