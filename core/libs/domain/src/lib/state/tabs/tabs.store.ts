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
import {addEntity, removeEntity, setAllEntities, updateEntity, withEntities} from '@ngrx/signals/entities';
import {EditorTabItem} from './tabs.models';

export interface TabsState {
  activeTabId: string | null;
}

const initialState: TabsState = {
  activeTabId: null,
};

export const TabsStore = signalStore(
  {providedIn: 'root'},
  withEntities<EditorTabItem>(),
  withState(initialState),
  withComputed(store => ({
    activeTab: computed(() => {
      const activeId = store.activeTabId();
      if (!activeId) return null;
      return store.entities().find(t => t.id === activeId) ?? null;
    }),
    hasMultipleTabs: computed(() => store.ids().length > 1),
    dirtyTabs: computed(() => store.entities().filter(t => !!t.isDirty)),
    hasDirtyTabs: computed(() => store.entities().some(t => !!t.isDirty)),
  })),
  withMethods(store => ({
    setActiveTabId(id: string | null) {
      patchState(store, {activeTabId: id});
    },
    addOrUpdateTab(tab: EditorTabItem) {
      const exists = store.ids().includes(tab.id);
      if (exists) {
        patchState(store, updateEntity({id: tab.id, changes: tab}));
      } else {
        patchState(store, addEntity(tab));
      }
    },
    removeTab(id: string) {
      const currentIds = store.ids() as string[];
      const removeIndex = currentIds.indexOf(id);
      const wasActive = store.activeTabId() === id;

      patchState(store, removeEntity(id));

      if (wasActive) {
        const remainingIds = (store.ids() as string[]).filter(tabId => tabId !== id);
        if (remainingIds.length === 0) {
          patchState(store, {activeTabId: null});
        } else {
          const nextIndex = Math.min(removeIndex, remainingIds.length - 1);
          patchState(store, {activeTabId: remainingIds[nextIndex]});
        }
      }
    },
    /** Replaces a tab's id in place, preserving tab order and active selection. */
    renameTab(oldId: string, tab: EditorTabItem) {
      if (!store.ids().includes(oldId)) return;
      const tabs = store.entities().map(t => (t.id === oldId ? tab : t));
      patchState(store, setAllEntities(tabs));
      if (store.activeTabId() === oldId) {
        patchState(store, {activeTabId: tab.id});
      }
    },
    setTabDirty(id: string, isDirty: boolean) {
      if (store.ids().includes(id)) {
        patchState(store, updateEntity({id, changes: {isDirty}}));
      }
    },
    setTabs(tabs: EditorTabItem[]) {
      patchState(store, setAllEntities(tabs));
    },
    clearTabs() {
      patchState(store, setAllEntities([]), {activeTabId: null});
    },
  })),
);
