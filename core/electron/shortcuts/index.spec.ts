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
import {globalShortcut} from 'electron';
import {registerGlobalShortcuts, unregisterGlobalShortcuts} from './index';

jest.mock('electron', () => ({
  globalShortcut: {
    unregisterAll: jest.fn(),
  },
}));

jest.mock('./common', () => ({
  registerCommonShortcuts: jest.fn(),
}));

jest.mock('./mac', () => ({
  registerMacShortcuts: jest.fn(),
}));

jest.mock('./windows-linux', () => ({
  registerWindowsLinuxShortcuts: jest.fn(),
}));

jest.mock('../platform/platform', () => ({
  default: {
    isMac: false,
    isWin: false,
    isLinux: false,
  },
}));

import {registerCommonShortcuts} from './common';
import {registerMacShortcuts} from './mac';
import {registerWindowsLinuxShortcuts} from './windows-linux';
import platformData from '../platform/platform';

const mockedUnregisterAll = globalShortcut.unregisterAll as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedRegisterCommon = registerCommonShortcuts as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedRegisterMac = registerMacShortcuts as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedRegisterWindowsLinux = registerWindowsLinuxShortcuts as unknown as jest.MockedFunction<(...args: any[]) => any>;
const mockedPlatform = platformData as {isMac: boolean; isWin: boolean; isLinux: boolean};

describe('shortcuts/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
