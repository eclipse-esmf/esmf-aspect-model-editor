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

import {lastValueFrom} from 'rxjs';
import {describe, expect, it, vi} from 'vitest';
import {createFile, decodeText, readFile} from './file.utils';

describe('file.utils', () => {
  describe('readFile', () => {
    it('should return parsed file content', async () => {
      const fileContent = 'foo';
      const file = new File([fileContent], 'test.txt');
      const result = await lastValueFrom(readFile(file));
      expect(result).toEqual(fileContent);
    });

    it('should complete the stream after first emit', () => {
      const fileContent = 'foo';
      const file = new File([fileContent], 'test.txt');
      const nextMock = vi.fn();
      const errorMock = vi.fn();

      return new Promise<void>(resolve => {
        readFile(file).subscribe({
          next: nextMock,
          error: errorMock,
          complete: () => {
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith(fileContent);
            expect(errorMock).not.toHaveBeenCalled();
            resolve();
          },
        });
      });
    });

    it('should emit error when file is invalid', () => {
      const invalidFile = null;
      const nextMock = vi.fn();
      const errorMock = vi.fn();

      return new Promise<void>(resolve => {
        readFile(invalidFile).subscribe({
          next: nextMock,
          error: err => {
            errorMock(err);
            expect(nextMock).not.toHaveBeenCalled();
            expect(errorMock).toHaveBeenCalledTimes(1);
            resolve();
          },
        });
      });
    });
  });

  describe('createFile', () => {
    it('should create File instance with string content', () => {
      const file = createFile('hello world', 'test.txt');
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test.txt');
      expect(file.type).toBe('text/plain');
    });

    it('should create File instance with number array content', () => {
      const bytes = [104, 101, 108, 108, 111];
      const file = createFile(bytes, 'binary.bin', 'application/octet-stream');
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('binary.bin');
      expect(file.type).toBe('application/octet-stream');
    });
  });

  describe('decodeText', () => {
    it('should return string unchanged if already string', () => {
      expect(decodeText('already string')).toBe('already string');
    });

    it('should decode number array to string', () => {
      const bytes = [104, 101, 108, 108, 111];
      expect(decodeText(bytes)).toBe('hello');
    });
  });
});
