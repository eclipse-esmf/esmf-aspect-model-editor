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
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {pipe, tap} from 'rxjs';
import {setFulfilled, setPending, setRejected, withRequestStatus} from '../features/with-request-status';

export interface WorkspaceValidationErrorModel {
  code: number;
  message: string;
  path: string;
}

export interface ModelValidationState {
  isValidating: boolean;
  isValid: boolean;
  workspaceError: WorkspaceValidationErrorModel | null;
  notificationsCount: number;
}

const initialState: ModelValidationState = {
  isValidating: false,
  isValid: true,
  workspaceError: null,
  notificationsCount: 0,
};

export const ModelValidationStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withRequestStatus(),
  withComputed(store => ({
    hasWorkspaceError: computed(() => store.workspaceError() !== null),
    hasErrorsOrNotifications: computed(() => store.workspaceError() !== null || store.notificationsCount() > 0),
  })),
  withMethods(store => ({
    setValidating(isValidating: boolean) {
      patchState(store, {isValidating}, isValidating ? setPending() : setFulfilled());
    },
    setValidationStatus(isValid: boolean) {
      patchState(store, {isValid, isValidating: false}, setFulfilled());
    },
    setWorkspaceError(error: WorkspaceValidationErrorModel | null) {
      patchState(
        store,
        {
          workspaceError: error,
          isValid: error === null,
          isValidating: false,
        },
        error ? setRejected(error.message) : setFulfilled(),
      );
    },
    clearWorkspaceError() {
      patchState(store, {workspaceError: null}, setFulfilled());
    },
    setNotificationsCount(count: number) {
      patchState(store, {notificationsCount: Math.max(0, count)});
    },
    incrementNotificationsCount() {
      patchState(store, {notificationsCount: store.notificationsCount() + 1});
    },
    clearNotifications() {
      patchState(store, {notificationsCount: 0});
    },
    reset() {
      patchState(store, initialState, setFulfilled());
    },
    handleError: rxMethod<WorkspaceValidationErrorModel | null>(
      pipe(
        tap(error => {
          patchState(
            store,
            {
              workspaceError: error,
              isValid: error === null,
              isValidating: false,
            },
            error ? setRejected(error.message) : setFulfilled(),
          );
        }),
      ),
    ),
  })),
);
