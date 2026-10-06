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
import {TabsStore} from '../tabs/tabs.store';
import {GraphViewState, HISTORY_LIMIT, ModelSnapshot} from './model-history.models';
import {ModelHistoryStore} from './model-history.store';

const view = (x = 0): GraphViewState => ({collapsed: false, shapes: {a: [{x, y: 0}]}, edges: {}, selection: [], scroll: {x: 0, y: 0}});
const snapshot = (rdf: string, x = 0): ModelSnapshot => ({
  rdf,
  metadata: {headerComments: null, explicitPrefixes: [], subjectOrder: []},
  view: view(x),
});

describe('ModelHistoryStore', () => {
  let store: InstanceType<typeof ModelHistoryStore>;
  let tabsStore: InstanceType<typeof TabsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [ModelHistoryStore, TabsStore]});
    tabsStore = TestBed.inject(TabsStore);
    store = TestBed.inject(ModelHistoryStore);
    tabsStore.setTabs([
      {id: 'tab-1', file: 'a.ttl', namespace: 'ns'},
      {id: 'tab-2', file: 'b.ttl', namespace: 'ns'},
    ]);
    tabsStore.setActiveTabId('tab-1');
  });

  it('starts empty', () => {
    expect(store.histories()).toEqual({});
    expect(store.canUndo()).toBe(false);
    expect(store.canRedo()).toBe(false);
    expect(store.undoCount()).toBe(0);
    expect(store.redoCount()).toBe(0);
    expect(store.restoring()).toBe(false);
    expect(store.pendingChange()).toBe(false);
  });

  describe('start', () => {
    it('starts an empty history with the current state', () => {
      store.start('tab-1', snapshot('v0'));
      expect(store.activeHistory()).toEqual({undo: [], redo: [], current: snapshot('v0')});
    });

    it('replaces an existing history of the tab and clears a pending change', () => {
      store.start('tab-1', snapshot('v0'));
      store.record('tab-1', snapshot('v1'));
      store.setPendingChange(true);

      store.start('tab-1', snapshot('v5'));
      expect(store.activeHistory()).toEqual({undo: [], redo: [], current: snapshot('v5')});
      expect(store.pendingChange()).toBe(false);
    });

    it('keeps the histories of other open tabs and drops those of closed tabs', () => {
      store.start('tab-2', snapshot('b'));
      store.start('closed', snapshot('c'), ['closed', 'tab-2']);
      expect(Object.keys(store.histories()).sort()).toEqual(['closed', 'tab-2']);
      store.start('tab-1', snapshot('a'));
      expect(Object.keys(store.histories()).sort()).toEqual(['tab-1', 'tab-2']);
    });

    it('can start a history with an unknown state', () => {
      store.start('tab-1', null);
      store.record('tab-1', snapshot('v1'));
      expect(store.undoCount()).toBe(0);
      expect(store.activeHistory().current).toEqual(snapshot('v1'));
    });
  });

  describe('record', () => {
    beforeEach(() => store.start('tab-1', snapshot('v0')));

    it('adds the previous state as step and returns true', () => {
      expect(store.record('tab-1', snapshot('v1'))).toBe(true);
      expect(store.activeHistory().undo).toEqual([snapshot('v0')]);
      expect(store.activeHistory().current).toEqual(snapshot('v1'));
      expect(store.canUndo()).toBe(true);
    });

    it('adds no step when the content did not change, but takes the new state', () => {
      expect(store.record('tab-1', snapshot('v0', 30))).toBe(false);
      expect(store.undoCount()).toBe(0);
      expect(store.activeHistory().current?.view).toEqual(view(30));
    });

    it('drops the steps which could be redone', () => {
      store.record('tab-1', snapshot('v1'));
      store.takeStep('tab-1', 'undo', view());
      store.completeStep('tab-1', snapshot('v0'));
      expect(store.canRedo()).toBe(true);

      store.record('tab-1', snapshot('v2'));
      expect(store.canRedo()).toBe(false);
    });

    it('creates a history for a tab without one', () => {
      expect(store.record('tab-2', snapshot('b'))).toBe(false);
      expect(store.histories()['tab-2'].current).toEqual(snapshot('b'));
    });

    it(`keeps at most ${HISTORY_LIMIT} steps and drops the oldest`, () => {
      for (let i = 1; i <= HISTORY_LIMIT + 5; i++) store.record('tab-1', snapshot(`v${i}`));
      const undo = store.activeHistory().undo;
      expect(undo.length).toBe(HISTORY_LIMIT);
      expect(undo[0].rdf).toBe('v5');
      expect(undo[undo.length - 1].rdf).toBe(`v${HISTORY_LIMIT + 4}`);
    });
  });

  describe('updateView', () => {
    it('changes only the view of the current state', () => {
      store.start('tab-1', snapshot('v0'));
      store.updateView('tab-1', view(99));
      expect(store.activeHistory().current).toEqual({...snapshot('v0'), view: view(99)});
      expect(store.undoCount()).toBe(0);
    });

    it('ignores tabs without current state', () => {
      store.updateView('tab-2', view(99));
      store.start('tab-1', null);
      store.updateView('tab-1', view(99));
      expect(store.histories()['tab-2']).toBeUndefined();
      expect(store.activeHistory().current).toBeNull();
    });
  });

  describe('takeStep / completeStep / revertStep', () => {
    beforeEach(() => {
      store.start('tab-1', snapshot('v0'));
      store.record('tab-1', snapshot('v1'));
      store.record('tab-1', snapshot('v2'));
    });

    it('undo returns the last state and moves the current state with its view to redo', () => {
      const target = store.takeStep('tab-1', 'undo', view(7));
      expect(target).toEqual(snapshot('v1'));
      expect(store.activeHistory().undo).toEqual([snapshot('v0')]);
      expect(store.activeHistory().redo).toEqual([{...snapshot('v2'), view: view(7)}]);
    });

    it('redo returns the undone state and moves the current state to undo', () => {
      store.completeStep('tab-1', store.takeStep('tab-1', 'undo', view()));
      const target = store.takeStep('tab-1', 'redo', view(3));
      expect(target).toEqual(snapshot('v2'));
      expect(store.activeHistory().redo).toEqual([]);
      expect(store.activeHistory().undo).toEqual([snapshot('v0'), {...snapshot('v1'), view: view(3)}]);
    });

    it('completeStep makes the restored state the current state', () => {
      const target = store.takeStep('tab-1', 'undo', view());
      store.completeStep('tab-1', target);
      expect(store.activeHistory().current).toEqual(snapshot('v1'));
    });

    it('revertStep restores the stacks of a failed step', () => {
      const before = store.activeHistory();
      const target = store.takeStep('tab-1', 'undo', view(7));
      store.revertStep('tab-1', 'undo', target);
      expect(store.activeHistory()).toEqual(before);
    });

    it('undo and redo through all steps', () => {
      const undone: string[] = [];
      let target: ModelSnapshot | null;
      while ((target = store.takeStep('tab-1', 'undo', view()))) {
        undone.push(target.rdf);
        store.completeStep('tab-1', target);
      }
      expect(undone).toEqual(['v1', 'v0']);

      const redone: string[] = [];
      while ((target = store.takeStep('tab-1', 'redo', view()))) {
        redone.push(target.rdf);
        store.completeStep('tab-1', target);
      }
      expect(redone).toEqual(['v1', 'v2']);
    });

    it('returns null without steps or history', () => {
      expect(store.takeStep('tab-1', 'redo', view())).toBeNull();
      expect(store.takeStep('tab-2', 'undo', view())).toBeNull();
    });

    it('ignores completeStep and revertStep for tabs without history', () => {
      store.completeStep('tab-2', snapshot('x'));
      store.revertStep('tab-2', 'undo', snapshot('x'));
      expect(store.histories()['tab-2']).toBeUndefined();
    });
  });

  describe('tabs', () => {
    it('shows the counters of the active tab', () => {
      store.start('tab-1', snapshot('a0'));
      store.record('tab-1', snapshot('a1'));
      store.start('tab-2', snapshot('b0'));

      expect(store.canUndo()).toBe(true);
      tabsStore.setActiveTabId('tab-2');
      expect(store.canUndo()).toBe(false);
      tabsStore.setActiveTabId(null);
      expect(store.canUndo()).toBe(false);
    });

    it('removes the history of a tab', () => {
      store.start('tab-1', snapshot('a0'));
      store.remove('tab-1');
      store.remove('unknown');
      expect(store.histories()).toEqual({});
    });

    it('moves the history to the new id of a renamed tab', () => {
      store.start('tab-1', snapshot('a0'));
      store.record('tab-1', snapshot('a1'));
      store.renameTab('tab-1', 'ns:Renamed.ttl');
      store.renameTab('unknown', 'other');
      store.renameTab('ns:Renamed.ttl', 'ns:Renamed.ttl');

      expect(Object.keys(store.histories())).toEqual(['ns:Renamed.ttl']);
      expect(store.histories()['ns:Renamed.ttl'].undo).toEqual([snapshot('a0')]);
    });
  });

  describe('flags', () => {
    beforeEach(() => store.start('tab-1', snapshot('v0')));

    it('a pending change can already be undone', () => {
      store.setPendingChange(true);
      expect(store.canUndo()).toBe(true);
      store.setPendingChange(false);
      expect(store.canUndo()).toBe(false);
    });

    it('nothing can be undone or redone while restoring', () => {
      store.record('tab-1', snapshot('v1'));
      store.completeStep('tab-1', store.takeStep('tab-1', 'undo', view()));
      store.record('tab-1', snapshot('v2'));
      store.completeStep('tab-1', store.takeStep('tab-1', 'undo', view()));
      store.setPendingChange(true);

      store.setRestoring(true);
      expect(store.canUndo()).toBe(false);
      expect(store.canRedo()).toBe(false);
      store.setRestoring(false);
      expect(store.canUndo()).toBe(true);
      expect(store.canRedo()).toBe(true);
    });
  });
});
