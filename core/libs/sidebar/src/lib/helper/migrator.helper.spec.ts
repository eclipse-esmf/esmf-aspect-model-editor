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

import {describe, expect, it} from 'vitest';
import {ExporterHelper} from './migrator.helper';

describe('ExporterHelper', () => {
  describe('isVersionOutdated', () => {
    it('should return false if fileVersion or currentSammVersion is missing', () => {
      expect(ExporterHelper.isVersionOutdated('', '2.1.0')).toBe(false);
      expect(ExporterHelper.isVersionOutdated('1.0.0', '')).toBe(false);
      expect(ExporterHelper.isVersionOutdated(undefined, '2.1.0')).toBe(false);
      expect(ExporterHelper.isVersionOutdated('1.0.0', undefined)).toBe(false);
    });

    it('should return true when major version of file is lower than current', () => {
      expect(ExporterHelper.isVersionOutdated('1.0.0', '2.0.0')).toBe(true);
      expect(ExporterHelper.isVersionOutdated('1.9.9', '2.0.0')).toBe(true);
    });

    it('should return false when major version of file is higher than current', () => {
      expect(ExporterHelper.isVersionOutdated('2.0.0', '1.9.9')).toBe(false);
      expect(ExporterHelper.isVersionOutdated('3.0.0', '2.1.0')).toBe(false);
    });

    it('should return true when minor version of file is lower than current', () => {
      expect(ExporterHelper.isVersionOutdated('2.0.0', '2.1.0')).toBe(true);
      expect(ExporterHelper.isVersionOutdated('2.1.5', '2.2.0')).toBe(true);
    });

    it('should return false when minor version of file is higher than current', () => {
      expect(ExporterHelper.isVersionOutdated('2.2.0', '2.1.0')).toBe(false);
    });

    it('should return true when patch version of file is lower than current', () => {
      expect(ExporterHelper.isVersionOutdated('2.1.0', '2.1.1')).toBe(true);
    });

    it('should return false when patch version of file is higher or equal to current', () => {
      expect(ExporterHelper.isVersionOutdated('2.1.1', '2.1.0')).toBe(false);
      expect(ExporterHelper.isVersionOutdated('2.1.0', '2.1.0')).toBe(false);
    });

    it('should handle partial version strings gracefully', () => {
      expect(ExporterHelper.isVersionOutdated('2.0', '2.1.0')).toBe(true);
      expect(ExporterHelper.isVersionOutdated('2.1', '2.1.0')).toBe(false);
    });
  });
});
