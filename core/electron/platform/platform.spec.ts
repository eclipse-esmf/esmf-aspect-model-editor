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

import {describe, expect, it, vi} from 'vitest';

async function loadPlatform(platform: NodeJS.Platform) {
  vi.resetModules();
  Object.defineProperty(process, 'platform', {value: platform, configurable: true});
  const mod: typeof import('./platform') = await import('./platform');
  return mod;
}

describe('platform', () => {
  describe('on Windows (win32)', () => {
    it('should set isWin to true', async () => {
      const {isWin} = await loadPlatform('win32');
      expect(isWin).toBe(true);
    });

    it('should set isMac to false', async () => {
      const {isMac} = await loadPlatform('win32');
      expect(isMac).toBe(false);
    });

    it('should set isLinux to false', async () => {
      const {isLinux} = await loadPlatform('win32');
      expect(isLinux).toBe(false);
    });

    it('should set extension to win.exe', async () => {
      const {extension} = await loadPlatform('win32');
      expect(extension).toBe('win.exe');
    });

    it('should set os to win32', async () => {
      const {os} = await loadPlatform('win32');
      expect(os).toBe('win32');
    });
  });

  describe('on macOS (darwin)', () => {
    it('should set isMac to true', async () => {
      const {isMac} = await loadPlatform('darwin');
      expect(isMac).toBe(true);
    });

    it('should set isWin to false', async () => {
      const {isWin} = await loadPlatform('darwin');
      expect(isWin).toBe(false);
    });

    it('should set isLinux to false', async () => {
      const {isLinux} = await loadPlatform('darwin');
      expect(isLinux).toBe(false);
    });

    it('should set extension to mac', async () => {
      const {extension} = await loadPlatform('darwin');
      expect(extension).toBe('mac');
    });

    it('should set os to darwin', async () => {
      const {os} = await loadPlatform('darwin');
      expect(os).toBe('darwin');
    });
  });

  describe('on Linux', () => {
    it('should set isLinux to true', async () => {
      const {isLinux} = await loadPlatform('linux');
      expect(isLinux).toBe(true);
    });

    it('should set isWin to false', async () => {
      const {isWin} = await loadPlatform('linux');
      expect(isWin).toBe(false);
    });

    it('should set isMac to false', async () => {
      const {isMac} = await loadPlatform('linux');
      expect(isMac).toBe(false);
    });

    it('should set extension to linux', async () => {
      const {extension} = await loadPlatform('linux');
      expect(extension).toBe('linux');
    });

    it('should set os to linux', async () => {
      const {os} = await loadPlatform('linux');
      expect(os).toBe('linux');
    });
  });

  describe('default export', () => {
    it('should expose os, extension, isWin, isMac, isLinux', async () => {
      const mod = await loadPlatform('darwin');
      const def = mod.default;

      expect(def).toHaveProperty('os');
      expect(def).toHaveProperty('extension');
      expect(def).toHaveProperty('isWin');
      expect(def).toHaveProperty('isMac');
      expect(def).toHaveProperty('isLinux');
    });

    it('default export values should match named exports', async () => {
      const mod = await loadPlatform('linux');

      expect(mod.default.os).toBe(mod.os);
      expect(mod.default.extension).toBe(mod.extension);
      expect(mod.default.isWin).toBe(mod.isWin);
      expect(mod.default.isMac).toBe(mod.isMac);
      expect(mod.default.isLinux).toBe(mod.isLinux);
    });
  });
});
