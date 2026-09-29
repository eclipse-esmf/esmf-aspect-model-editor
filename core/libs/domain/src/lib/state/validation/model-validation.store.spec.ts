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
import {beforeEach, describe, expect, it} from 'vitest';
import {ModelValidationStore} from './model-validation.store';

describe('ModelValidationStore', () => {
  let store: InstanceType<typeof ModelValidationStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModelValidationStore],
    });
    store = TestBed.inject(ModelValidationStore);
  });

  it('should initialize with default states', () => {
    expect(store.isValidating()).toBe(false);
    expect(store.isValid()).toBe(true);
    expect(store.workspaceError()).toBeNull();
    expect(store.hasWorkspaceError()).toBe(false);
    expect(store.notificationsCount()).toBe(0);
  });

  it('should track workspace errors', () => {
    store.setWorkspaceError({
      code: 400,
      message: 'Syntax error in model',
      path: '/path/to/model.ttl',
    });

    expect(store.hasWorkspaceError()).toBe(true);
    expect(store.isValid()).toBe(false);
    expect(store.workspaceError()?.message).toBe('Syntax error in model');

    store.clearWorkspaceError();
    expect(store.hasWorkspaceError()).toBe(false);
  });

  it('should track notifications count', () => {
    store.incrementNotificationsCount();
    expect(store.notificationsCount()).toBe(1);
    expect(store.hasErrorsOrNotifications()).toBe(true);

    store.clearNotifications();
    expect(store.notificationsCount()).toBe(0);
  });

  it('should handle errors via rxMethod handleError and update requestStatus', () => {
    store.handleError({
      code: 500,
      message: 'Failed to parse workspace',
      path: '/path/test',
    });
    expect(store.hasWorkspaceError()).toBe(true);
    expect(store.requestError()).toBe('Failed to parse workspace');

    store.handleError(null);
    expect(store.hasWorkspaceError()).toBe(false);
    expect(store.isSuccess()).toBe(true);
  });
});
