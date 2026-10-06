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

import {computed} from '@angular/core';
import {signalStoreFeature, withComputed, withState} from '@ngrx/signals';

export type RequestStatus = 'idle' | 'loading' | 'success' | {error: string};

export interface RequestStatusState {
  requestStatus: RequestStatus;
}

export function withRequestStatus() {
  return signalStoreFeature(
    withState<RequestStatusState>({requestStatus: 'idle'}),
    withComputed(({requestStatus}) => ({
      isLoading: computed(() => requestStatus() === 'loading'),
      isSuccess: computed(() => requestStatus() === 'success'),
      isIdle: computed(() => requestStatus() === 'idle'),
      requestError: computed(() => {
        const status = requestStatus();
        return typeof status === 'object' && 'error' in status ? status.error : null;
      }),
    })),
  );
}

export function setPending(): {requestStatus: RequestStatus} {
  return {requestStatus: 'loading'};
}

export function setFulfilled(): {requestStatus: RequestStatus} {
  return {requestStatus: 'success'};
}

export function setRejected(error: string): {requestStatus: RequestStatus} {
  return {requestStatus: {error}};
}
