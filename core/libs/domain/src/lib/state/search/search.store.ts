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

import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {computed} from '@angular/core';

export interface SearchStateModel {
  elementsSearchOpened: boolean;
  filesSearchOpened: boolean;
}

const initialState: SearchStateModel = {
  elementsSearchOpened: false,
  filesSearchOpened: false,
};

export const SearchStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withComputed(store => ({
    isAnySearchOpened: computed(() => store.elementsSearchOpened() || store.filesSearchOpened()),
  })),
  withMethods(store => ({
    openElementsSearch() {
      patchState(store, {
        elementsSearchOpened: true,
        filesSearchOpened: false,
      });
    },
    closeElementsSearch() {
      patchState(store, {elementsSearchOpened: false});
    },
    toggleElementsSearch() {
      if (store.elementsSearchOpened()) {
        patchState(store, {elementsSearchOpened: false});
      } else {
        patchState(store, {
          elementsSearchOpened: true,
          filesSearchOpened: false,
        });
      }
    },
    openFilesSearch() {
      patchState(store, {
        filesSearchOpened: true,
        elementsSearchOpened: false,
      });
    },
    closeFilesSearch() {
      patchState(store, {filesSearchOpened: false});
    },
    toggleFilesSearch() {
      if (store.filesSearchOpened()) {
        patchState(store, {filesSearchOpened: false});
      } else {
        patchState(store, {
          filesSearchOpened: true,
          elementsSearchOpened: false,
        });
      }
    },
    closeAll() {
      patchState(store, {
        elementsSearchOpened: false,
        filesSearchOpened: false,
      });
    },
  })),
);
