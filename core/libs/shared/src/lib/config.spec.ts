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

import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from 'vitest';
import {APP_CONFIG, config} from './config';

describe('Config', () => {
  it('should have default config values', () => {
    expect(config.environment).toBe('dev');
    expect(config.defaultPort).toBe('9090');
    expect(config.minSammVersion).toBe('2.0.0');
    expect(config.currentSammVersion).toBe('2.2.0');
    expect(config.sdkVersion).toBe('2.16.0');
    expect(config.api.models).toBe('/ame/api/models');
    expect(config.api.generate).toBe('/ame/api/generate');
    expect(config.api.package).toBe('/ame/api/package');
    expect(config.api.fileHandling).toBe('/ame/api/file-handling');
  });

  it('should provide APP_CONFIG via DI token factory', () => {
    const injectedConfig = TestBed.inject(APP_CONFIG);
    expect(injectedConfig).toEqual(config);
  });
});
