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

import {describe, it, expect, jest} from '@jest/globals';

function loadPlatform(platform: NodeJS.Platform) {
  let mod: typeof import('./platform');
  jest.isolateModules(() => {
    Object.defineProperty(process, 'platform', {value: platform, configurable: true});
    mod = require('./platform');
  });
  return mod!;
}

describe('platform', () => {
  describe('on Windows (win32)', () => {
    it('should set isWin to true', () => {
      const {isWin} = loadPlatform('win32');
      expect(isWin).toBe(true);
    });

    it('should set isMac to false', () => {
      const {isMac} = loadPlatform('win32');
      expect(isMac).toBe(false);
    });

    it('should set isLinux to false', () => {
      const {isLinux} = loadPlatform('win32');
      expect(isLinux).toBe(false);
    });

    it('should set extension to win.exe', () => {
      const {extension} = loadPlatform('win32');
      expect(extension).toBe('win.exe');
    });

    it('should set os to win32', () => {
      const {os} = loadPlatform('win32');
      expect(os).toBe('win32');
    });
  });

  describe('on macOS (darwin)', () => {
    it('should set isMac to true', () => {
      const {isMac} = loadPlatform('darwin');
      expect(isMac).toBe(true);
    });

    it('should set isWin to false', () => {
      const {isWin} = loadPlatform('darwin');
      expect(isWin).toBe(false);
    });

    it('should set isLinux to false', () => {
      const {isLinux} = loadPlatform('darwin');
      expect(isLinux).toBe(false);
    });

    it('should set extension to mac', () => {
      const {extension} = loadPlatform('darwin');
      expect(extension).toBe('mac');
    });

    it('should set os to darwin', () => {
      const {os} = loadPlatform('darwin');
      expect(os).toBe('darwin');
    });
  });

  describe('on Linux', () => {
    it('should set isLinux to true', () => {
      const {isLinux} = loadPlatform('linux');
      expect(isLinux).toBe(true);
    });

    it('should set isWin to false', () => {
      const {isWin} = loadPlatform('linux');
      expect(isWin).toBe(false);
    });

    it('should set isMac to false', () => {
      const {isMac} = loadPlatform('linux');
      expect(isMac).toBe(false);
    });

    it('should set extension to linux', () => {
      const {extension} = loadPlatform('linux');
      expect(extension).toBe('linux');
    });

    it('should set os to linux', () => {
      const {os} = loadPlatform('linux');
      expect(os).toBe('linux');
    });
  });

  describe('default export', () => {
    it('should expose os, extension, isWin, isMac, isLinux', () => {
      const mod = loadPlatform('darwin');
      const def = mod.default;

      expect(def).toHaveProperty('os');
      expect(def).toHaveProperty('extension');
      expect(def).toHaveProperty('isWin');
      expect(def).toHaveProperty('isMac');
      expect(def).toHaveProperty('isLinux');
    });

    it('default export values should match named exports', () => {
      const mod = loadPlatform('linux');

      expect(mod.default.os).toBe(mod.os);
      expect(mod.default.extension).toBe(mod.extension);
      expect(mod.default.isWin).toBe(mod.isWin);
      expect(mod.default.isMac).toBe(mod.isMac);
      expect(mod.default.isLinux).toBe(mod.isLinux);
    });
  });
});
