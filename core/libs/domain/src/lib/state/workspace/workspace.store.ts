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
import {addEntities, removeEntity, setAllEntities, updateEntity, withEntities} from '@ngrx/signals/entities';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {pipe, tap} from 'rxjs';
import {setFulfilled, setPending, withRequestStatus} from '../features/with-request-status';
import {WorkspaceFileItem, WorkspaceSelection} from './workspace.models';

export interface WorkspaceState {
  currentNamespace: string | null;
  selectedFile: WorkspaceSelection | null;
  refreshTick: number;
}

const initialState: WorkspaceState = {
  currentNamespace: null,
  selectedFile: null,
  refreshTick: 0,
};

export const WorkspaceStore = signalStore(
  {providedIn: 'root'},
  withEntities<WorkspaceFileItem>(),
  withState(initialState),
  withRequestStatus(),
  withComputed(store => ({
    namespaces: computed(() => {
      const all = store.entities();
      const map: Record<string, WorkspaceFileItem[]> = {};
      for (const item of all) {
        if (!map[item.namespace]) {
          map[item.namespace] = [];
        }
        map[item.namespace].push(item);
      }
      return map;
    }),
    namespaceKeys: computed(() => {
      const all = store.entities();
      const keys = new Set<string>();
      for (const item of all) {
        keys.add(item.namespace);
      }
      return Array.from(keys);
    }),
    hasOutdatedFiles: computed(() => store.entities().some(f => f.outdated)),
    hasErroredFiles: computed(() => store.entities().some(f => f.errored)),
  })),
  withMethods(store => ({
    setFiles(files: WorkspaceFileItem[]) {
      patchState(store, setAllEntities(files), setFulfilled());
    },
    addFiles(files: WorkspaceFileItem[]) {
      patchState(store, addEntities(files));
    },
    updateFile(id: string, changes: Partial<WorkspaceFileItem>) {
      patchState(store, updateEntity({id, changes}));
    },
    removeFile(id: string) {
      patchState(store, removeEntity(id));
    },
    selectFile(selection: WorkspaceSelection | null) {
      patchState(store, {selectedFile: selection});
    },
    setCurrentNamespace(ns: string | null) {
      patchState(store, {currentNamespace: ns});
    },
    triggerRefresh() {
      patchState(store, {refreshTick: (store.refreshTick() + 1) % 100});
    },
    clear() {
      patchState(store, setAllEntities([]), {selectedFile: null, currentNamespace: null});
    },
    loadFiles: rxMethod<WorkspaceFileItem[]>(
      pipe(
        tap(() => patchState(store, setPending())),
        tap(files => patchState(store, setAllEntities(files), setFulfilled())),
      ),
    ),
  })),
);
