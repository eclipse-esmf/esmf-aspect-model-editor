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

const mockExecAsyncFn = jest.fn();
const mockExecAsync = mockExecAsyncFn as unknown as jest.MockedFunction<(...args: any[]) => any>;

jest.mock('util', () => ({
  promisify: jest.fn(() => mockExecAsyncFn),
}));

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

import {execPromise} from './promisify';

describe('promisify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('execPromise', () => {
    it('should return stdout and stderr on success', async () => {
      mockExecAsync.mockResolvedValue({stdout: 'hello output', stderr: ''});

      const result = await execPromise('echo hello');

      expect(result.stdout).toBe('hello output');
      expect(result.stderr).toBe('');
    });

    it('should return stderr alongside stdout when both are present', async () => {
      mockExecAsync.mockResolvedValue({stdout: 'some output', stderr: 'some warning'});

      const result = await execPromise('some-command');

      expect(result.stdout).toBe('some output');
      expect(result.stderr).toBe('some warning');
    });

    it('should throw when exec returns an error', async () => {
      mockExecAsync.mockRejectedValue(new Error('command failed'));

      await expect(execPromise('bad-command')).rejects.toThrow('command failed');
    });

    it('should call exec with the given command', async () => {
      mockExecAsync.mockResolvedValue({stdout: '', stderr: ''});

      await execPromise('ls -la');

      expect(mockExecAsync).toHaveBeenCalledWith('ls -la');
    });

    it('should return empty stdout and stderr for commands with no output', async () => {
      mockExecAsync.mockResolvedValue({stdout: '', stderr: ''});

      const result = await execPromise('touch file.txt');

      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');
    });
  });

  describe('default export', () => {
    it('should expose exec as execPromise', async () => {
      const defaultExport = (await import('./promisify')).default;

      expect(defaultExport.exec).toBe(execPromise);
    });
  });
});
