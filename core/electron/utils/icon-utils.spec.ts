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

import {nativeImage} from 'electron';
import {describe, it, expect, beforeEach, jest} from '@jest/globals';
import {getIcon} from './icon-utils';

jest.mock('electron', () => ({
  nativeImage: {
    createFromPath: jest.fn(),
  },
}));

const mockedCreateFromPath = nativeImage.createFromPath as unknown as jest.MockedFunction<(...args: any[]) => any>;

const mockResize = jest.fn();
const mockNativeImage = {resize: mockResize};

describe('icon-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateFromPath.mockReturnValue(mockNativeImage);
  });

  describe('getIcon', () => {
    it('should throw if iconPath is empty string', () => {
      expect(() => getIcon('')).toThrow('iconPath is required');
    });

    it('should call nativeImage.createFromPath with the given path', () => {
      mockResize.mockReturnValue(mockNativeImage);

      getIcon('/some/path/icon.png');

      expect(mockedCreateFromPath).toHaveBeenCalledWith('/some/path/icon.png');
    });

    it('should resize image with default size when no options provided', () => {
      mockResize.mockReturnValue(mockNativeImage);

      getIcon('/some/path/icon.png');

      expect(mockResize).toHaveBeenCalledWith({width: 20, height: 20, quality: 'best'});
    });

    it('should resize image with custom options when provided', () => {
      const customOptions: Electron.ResizeOptions = {width: 32, height: 32, quality: 'good'};
      mockResize.mockReturnValue(mockNativeImage);

      getIcon('/some/path/icon.png', customOptions);

      expect(mockResize).toHaveBeenCalledWith(customOptions);
    });

    it('should return the resized NativeImage', () => {
      const resizedImage = {resize: jest.fn()};
      mockResize.mockReturnValue(resizedImage);

      const result = getIcon('/some/path/icon.png');

      expect(result).toBe(resizedImage);
    });

    it('should use default size even when options is undefined', () => {
      mockResize.mockReturnValue(mockNativeImage);

      getIcon('/some/path/icon.png', undefined);

      expect(mockResize).toHaveBeenCalledWith({width: 20, height: 20, quality: 'best'});
    });
  });
});
