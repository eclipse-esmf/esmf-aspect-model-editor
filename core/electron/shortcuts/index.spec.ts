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

import {globalShortcut} from 'electron';
import {beforeEach, describe, expect, it, MockedFunction, vi} from 'vitest';
import {registerGlobalShortcuts, unregisterGlobalShortcuts} from './index';

vi.mock('electron', () => ({
  globalShortcut: {
    unregisterAll: vi.fn(),
  },
}));

vi.mock('./common', () => ({
  registerCommonShortcuts: vi.fn(),
}));

vi.mock('./mac', () => ({
  registerMacShortcuts: vi.fn(),
}));

vi.mock('./windows-linux', () => ({
  registerWindowsLinuxShortcuts: vi.fn(),
}));

vi.mock('../platform/platform', () => ({
  default: {
    isMac: false,
    isWin: false,
    isLinux: false,
  },
}));

import platformData from '../platform/platform';
import {registerCommonShortcuts} from './common';
import {registerMacShortcuts} from './mac';
import {registerWindowsLinuxShortcuts} from './windows-linux';

const mockedUnregisterAll = globalShortcut.unregisterAll as unknown as MockedFunction<(...args: any[]) => any>;
const mockedRegisterCommon = registerCommonShortcuts as unknown as MockedFunction<(...args: any[]) => any>;
const mockedRegisterMac = registerMacShortcuts as unknown as MockedFunction<(...args: any[]) => any>;
const mockedRegisterWindowsLinux = registerWindowsLinuxShortcuts as unknown as MockedFunction<(...args: any[]) => any>;
const mockedPlatform = platformData as {isMac: boolean; isWin: boolean; isLinux: boolean};

describe('shortcuts/index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPlatform.isMac = false;
    mockedPlatform.isWin = false;
    mockedPlatform.isLinux = false;
  });

  describe('registerGlobalShortcuts', () => {
    it('should always call registerCommonShortcuts', () => {
      registerGlobalShortcuts();

      expect(mockedRegisterCommon).toHaveBeenCalledTimes(1);
    });

    it('should call registerMacShortcuts when platform is Mac', () => {
      mockedPlatform.isMac = true;

      registerGlobalShortcuts();

      expect(mockedRegisterMac).toHaveBeenCalledTimes(1);
      expect(mockedRegisterWindowsLinux).not.toHaveBeenCalled();
    });

    it('should call registerWindowsLinuxShortcuts when platform is Windows', () => {
      mockedPlatform.isWin = true;

      registerGlobalShortcuts();

      expect(mockedRegisterWindowsLinux).toHaveBeenCalledTimes(1);
      expect(mockedRegisterMac).not.toHaveBeenCalled();
    });

    it('should call registerWindowsLinuxShortcuts when platform is Linux', () => {
      mockedPlatform.isLinux = true;

      registerGlobalShortcuts();

      expect(mockedRegisterWindowsLinux).toHaveBeenCalledTimes(1);
      expect(mockedRegisterMac).not.toHaveBeenCalled();
    });

    it('should not call registerMacShortcuts or registerWindowsLinuxShortcuts when platform is unknown', () => {
      registerGlobalShortcuts();

      expect(mockedRegisterMac).not.toHaveBeenCalled();
      expect(mockedRegisterWindowsLinux).not.toHaveBeenCalled();
    });

    it('should not call registerWindowsLinuxShortcuts when platform is Mac', () => {
      mockedPlatform.isMac = true;

      registerGlobalShortcuts();

      expect(mockedRegisterWindowsLinux).not.toHaveBeenCalled();
    });

    it('should not call registerMacShortcuts when platform is Windows', () => {
      mockedPlatform.isWin = true;

      registerGlobalShortcuts();

      expect(mockedRegisterMac).not.toHaveBeenCalled();
    });
  });

  describe('unregisterGlobalShortcuts', () => {
    it('should call globalShortcut.unregisterAll', () => {
      unregisterGlobalShortcuts();

      expect(mockedUnregisterAll).toHaveBeenCalledTimes(1);
    });

    it('should not call registerCommonShortcuts when unregistering', () => {
      unregisterGlobalShortcuts();

      expect(mockedRegisterCommon).not.toHaveBeenCalled();
    });
  });
});
