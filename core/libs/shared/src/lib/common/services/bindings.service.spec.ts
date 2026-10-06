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
import {BindingsService} from './bindings.service';

describe('BindingsService', () => {
  it('should register and fire actions with arguments', () => {
    const service = new BindingsService();
    const actionSpy = vi.fn();

    service.registerAction('save', actionSpy);
    service.fireAction('save', 'arg1', 42);

    expect(actionSpy).toHaveBeenCalledWith('arg1', 42);
  });
});
