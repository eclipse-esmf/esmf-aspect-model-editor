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
import {KnownVersion, SammVersion} from './known-version';

describe('KnownVersion', () => {
  it('should return known SAMM version enum from string', () => {
    expect(KnownVersion.fromVersionString('2.0.0')).toBe(SammVersion.SAMM_2_0_0);
    expect(KnownVersion.fromVersionString('2.1.0')).toBe(SammVersion.SAMM_2_1_0);
    expect(KnownVersion.fromVersionString('2.2.0')).toBe(SammVersion.SAMM_2_2_0);
  });

  it('should return undefined for unknown version string', () => {
    expect(KnownVersion.fromVersionString('0.9.0')).toBeUndefined();
    expect(KnownVersion.fromVersionString('3.0.0')).toBeUndefined();
    expect(KnownVersion.fromVersionString('')).toBeUndefined();
  });

  it('should check if version is supported', () => {
    expect(KnownVersion.isVersionSupported(SammVersion.SAMM_2_0_0)).toBe(true);
    expect(KnownVersion.isVersionSupported(SammVersion.SAMM_2_1_0)).toBe(true);
    expect(KnownVersion.isVersionSupported(SammVersion.SAMM_2_2_0)).toBe(true);
    expect(KnownVersion.isVersionSupported('3.0.0' as any)).toBe(false);
  });

  it('should list all supported versions', () => {
    const versions = KnownVersion.getSupportedVersions();
    expect(versions).toContain(SammVersion.SAMM_2_0_0);
    expect(versions).toContain(SammVersion.SAMM_2_1_0);
    expect(versions).toContain(SammVersion.SAMM_2_2_0);
  });
});
