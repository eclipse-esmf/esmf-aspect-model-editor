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

import {describe, it, expect, beforeEach, afterEach} from '@jest/globals';
import {inDevMode, inProdMode} from './mode';

describe('mode', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    process.argv = [...originalArgv];
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('inDevMode', () => {
    it('should return true when --dev flag is present', () => {
      process.argv = ['node', 'main.js', '--dev'];

      expect(inDevMode()).toBe(true);
    });

    it('should return false when --dev flag is not present', () => {
      process.argv = ['node', 'main.js'];

      expect(inDevMode()).toBe(false);
    });

    it('should return false when process.argv is empty', () => {
      process.argv = [];

      expect(inDevMode()).toBe(false);
    });

    it('should return false when other flags are present but not --dev', () => {
      process.argv = ['node', 'main.js', '--prod', '--verbose'];

      expect(inDevMode()).toBe(false);
    });
  });

  describe('inProdMode', () => {
    it('should return true when --dev flag is not present', () => {
      process.argv = ['node', 'main.js'];

      expect(inProdMode()).toBe(true);
    });

    it('should return false when --dev flag is present', () => {
      process.argv = ['node', 'main.js', '--dev'];

      expect(inProdMode()).toBe(false);
    });

    it('should return true when process.argv is empty', () => {
      process.argv = [];

      expect(inProdMode()).toBe(true);
    });

    it('should be the inverse of inDevMode', () => {
      process.argv = ['node', 'main.js', '--dev'];
      expect(inProdMode()).toBe(!inDevMode());

      process.argv = ['node', 'main.js'];
      expect(inProdMode()).toBe(!inDevMode());
    });
  });
});
