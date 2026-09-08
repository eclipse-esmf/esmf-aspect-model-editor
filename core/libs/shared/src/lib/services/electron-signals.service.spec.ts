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

import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ElectronSignalsService} from './electron-signals.service';

describe('ElectronSignalsService', () => {
  let service: ElectronSignalsService;

  beforeEach(() => {
    service = new ElectronSignalsService();
  });

  it('should add listener and execute it on call', () => {
    const callback = vi.fn(payload => of(payload));
    service.addListener('updateWindowInfo', callback);

    const payload: any = {namespace: 'org.test', file: 'model.ttl', aspectModelUrn: 'urn:test'};
    service.call('updateWindowInfo', payload);

    expect(callback).toHaveBeenCalledWith(payload);
  });

  it('should throw error when callback is not a function', () => {
    expect(() => service.addListener('updateWindowInfo', null as any)).toThrow('callback parameter should be of type Function');
  });

  it('should return null and log error when calling unregistered action', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = service.call('isFirstWindow' as any);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No listener registered'));
    consoleSpy.mockRestore();
  });

  it('should remove listener', () => {
    const callback = vi.fn();
    service.addListener('updateWindowInfo', callback);
    service.removeListener('updateWindowInfo');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = service.call('updateWindowInfo', {namespace: '', file: ''});

    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });
});
