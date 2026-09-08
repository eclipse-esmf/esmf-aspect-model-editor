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

import {afterEach, describe, expect, it} from 'vitest';
import {BrowserService} from './browser.service';

describe('BrowserService', () => {
  const service = new BrowserService();
  const originalProcess = (window as any).process;

  afterEach(() => {
    (window as any).process = originalProcess;
  });

  it('should detect when running in electron renderer process', () => {
    (window as any).process = {type: 'renderer'};
    expect(service.isStartedAsElectronApp()).toBe(true);
    expect(service.getAssetBasePath()).toBe('./assets');
  });

  it('should detect when not running in electron', () => {
    (window as any).process = undefined;
    const isElectron = service.isStartedAsElectronApp();
    const basePath = service.getAssetBasePath();

    if (isElectron) {
      expect(basePath).toBe('./assets');
    } else {
      expect(basePath).toBe('../../../assets');
    }
  });
});
