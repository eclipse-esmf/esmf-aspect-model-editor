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

import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withProps, withState} from '@ngrx/signals';
import {TabsStore} from '../tabs/tabs.store';
import {GraphViewState, HISTORY_LIMIT, HistoryDirection, ModelSnapshot, TabHistory} from './model-history.models';

export interface ModelHistoryState {
  /** The undo/redo history of every open tab by tab id. */
  histories: Record<string, TabHistory>;
  /** An earlier version of the model is being loaded. */
  restoring: boolean;
  /** The graph changed, but the change is not recorded yet (changes are merged for a short moment). */
  pendingChange: boolean;
}

const initialState: ModelHistoryState = {
  histories: {},
  restoring: false,
  pendingChange: false,
};

const EMPTY_HISTORY: TabHistory = {undo: [], redo: [], current: null};

/** Adds a snapshot to a stack and drops the oldest ones beyond the limit. */
const pushLimited = (stack: ModelSnapshot[], snapshot: ModelSnapshot): ModelSnapshot[] => [...stack, snapshot].slice(-HISTORY_LIMIT);

/**
 * State of undo/redo: the snapshots of the model per tab. The store only keeps the state;
 * recording and restoring snapshots of the graph is done by the ModelHistoryService of the editor.
 */
export const ModelHistoryStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withProps(() => ({_tabsStore: inject(TabsStore)})),
  withComputed(store => {
    const activeHistory = computed(() => {
      const tabId = store._tabsStore.activeTabId();
      return (tabId && store.histories()[tabId]) || EMPTY_HISTORY;
    });
    const undoCount = computed(() => activeHistory().undo.length);
    const redoCount = computed(() => activeHistory().redo.length);
    return {
      activeHistory,
      undoCount,
      redoCount,
      // a pending change can already be undone, it is recorded first
      canUndo: computed(() => !store.restoring() && (store.pendingChange() || undoCount() > 0)),
      canRedo: computed(() => !store.restoring() && redoCount() > 0),
    };
  }),
  withMethods(store => {
    const historyOf = (tabId: string): TabHistory => store.histories()[tabId] ?? EMPTY_HISTORY;
    const setHistory = (tabId: string, history: TabHistory) =>
      patchState(store, state => ({histories: {...state.histories, [tabId]: history}}));

    return {
      /** Starts a new history for a tab and drops the histories of tabs which are not open anymore. */
      start(tabId: string, current: ModelSnapshot | null, openTabIds: string[] = [...(store._tabsStore.ids() as string[]), tabId]) {
        const open = new Set(openTabIds);
        const kept = Object.fromEntries(Object.entries(store.histories()).filter(([id]) => open.has(id) && id !== tabId));
        patchState(store, {histories: {...kept, [tabId]: {undo: [], redo: [], current}}, pendingChange: false});
      },

      /**
       * Records the state after a change. A previous state with another content becomes a step which can be undone
       * and the steps which could be redone are dropped. Returns whether a step was added.
       */
      record(tabId: string, snapshot: ModelSnapshot): boolean {
        const history = historyOf(tabId);
        const isStep = !!history.current && history.current.rdf !== snapshot.rdf;
        setHistory(
          tabId,
          isStep ? {undo: pushLimited(history.undo, history.current), redo: [], current: snapshot} : {...history, current: snapshot},
        );
        return isStep;
      },

      /** Moving shapes is no step of its own, but undo and redo keep the new positions. */
      updateView(tabId: string, view: GraphViewState) {
        const history = store.histories()[tabId];
        if (history?.current) setHistory(tabId, {...history, current: {...history.current, view}});
      },

      /**
       * Takes the snapshot to restore for undo or redo. The current state (with the given view) moves to the opposite stack.
       * Returns null if there is nothing to undo or redo.
       */
      takeStep(tabId: string, direction: HistoryDirection, currentView: GraphViewState): ModelSnapshot | null {
        const history = historyOf(tabId);
        const source = history[direction];
        if (!history.current || !source.length) return null;

        const target = source[source.length - 1];
        const previous = {...history.current, view: currentView};
        const opposite: HistoryDirection = direction === 'undo' ? 'redo' : 'undo';
        setHistory(tabId, {
          ...history,
          [direction]: source.slice(0, -1),
          [opposite]: pushLimited(history[opposite], previous),
        });
        return target;
      },

      /** The restored state becomes the current state of the tab. */
      completeStep(tabId: string, current: ModelSnapshot) {
        const history = store.histories()[tabId];
        if (history) setHistory(tabId, {...history, current});
      },

      /** Reverts `takeStep` when the snapshot could not be restored. */
      revertStep(tabId: string, direction: HistoryDirection, target: ModelSnapshot) {
        const history = store.histories()[tabId];
        if (!history) return;
        const opposite: HistoryDirection = direction === 'undo' ? 'redo' : 'undo';
        setHistory(tabId, {
          ...history,
          [direction]: pushLimited(history[direction], target),
          [opposite]: history[opposite].slice(0, -1),
        });
      },

      /** Removes the history of a closed tab. */
      remove(tabId: string) {
        if (!(tabId in store.histories())) return;
        patchState(store, state => ({histories: Object.fromEntries(Object.entries(state.histories).filter(([id]) => id !== tabId))}));
      },

      /** Keeps the history when the id of a tab changes, e.g. when a new model is saved the first time. */
      renameTab(oldTabId: string, newTabId: string) {
        const history = store.histories()[oldTabId];
        if (!history || oldTabId === newTabId) return;
        patchState(store, state => ({
          histories: {...Object.fromEntries(Object.entries(state.histories).filter(([id]) => id !== oldTabId)), [newTabId]: history},
        }));
      },

      setRestoring(restoring: boolean) {
        patchState(store, {restoring});
      },

      setPendingChange(pendingChange: boolean) {
        patchState(store, {pendingChange});
      },
    };
  }),
);
