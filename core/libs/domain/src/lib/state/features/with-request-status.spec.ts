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

import {patchState, signalStore} from '@ngrx/signals';
import {unprotected} from '@ngrx/signals/testing';
import {describe, expect, it} from 'vitest';
import {setFulfilled, setPending, setRejected, withRequestStatus} from './with-request-status';

const TestStore = signalStore(withRequestStatus());

describe('withRequestStatus', () => {
  it('should initialize with idle state', () => {
    const store = new TestStore();

    expect(store.requestStatus()).toBe('idle');
    expect(store.isIdle()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.isSuccess()).toBe(false);
    expect(store.requestError()).toBeNull();
  });

  it('should update to loading state with setPending', () => {
    const store = new TestStore();
    patchState(unprotected(store), setPending());

    expect(store.requestStatus()).toBe('loading');
    expect(store.isLoading()).toBe(true);
    expect(store.isIdle()).toBe(false);
    expect(store.isSuccess()).toBe(false);
  });

  it('should update to success state with setFulfilled', () => {
    const store = new TestStore();
    patchState(unprotected(store), setFulfilled());

    expect(store.requestStatus()).toBe('success');
    expect(store.isSuccess()).toBe(true);
    expect(store.isLoading()).toBe(false);
  });

  it('should update to error state with setRejected', () => {
    const store = new TestStore();
    patchState(unprotected(store), setRejected('Network error'));

    expect(store.requestStatus()).toEqual({error: 'Network error'});
    expect(store.isLoading()).toBe(false);
    expect(store.requestError()).toBe('Network error');
  });
});
