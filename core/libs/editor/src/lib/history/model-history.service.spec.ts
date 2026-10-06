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

import {GraphViewState, HISTORY_LIMIT, LoadedFilesService, ModelHistoryStore, ModelService, RdfPort, TabsStore} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {LanguageTranslationService, NotificationsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {GeometryChange, InternalEvent} from '@maxgraph/core';
import {BehaviorSubject, of, Subject, throwError} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ShapeSettingsStateService} from '../editor-dialog/services/shape-settings-state.service';
import {ModelLoaderService} from '../model-loader.service';
import {ModelRendererService} from '../model-renderer.service';
import {GraphViewStateService} from './graph-view-state.service';
import {HISTORY_COMMIT_DELAY_MS, ModelHistoryService} from './model-history.service';

const view = (x: number): GraphViewState => ({collapsed: false, shapes: {a: [{x, y: 0}]}, edges: {}, selection: [], scroll: {x: 0, y: 0}});

describe('ModelHistoryService', () => {
  let service: ModelHistoryService;
  let content: string;
  let position: number;
  let graphListener: (sender: unknown, event: {getProperty: (name: string) => unknown}) => void;
  let tabsStore: InstanceType<typeof TabsStore>;
  let store: InstanceType<typeof ModelHistoryStore>;
  const activate = (tabId: string) => tabsStore.setActiveTabId(tabId);
  let loader: {restoreModel: ReturnType<typeof vi.fn>};
  let renderer: {renderAgain: ReturnType<typeof vi.fn>};
  let viewState: {capture: ReturnType<typeof vi.fn>; apply: ReturnType<typeof vi.fn>};
  let shapeSettings: {closeShapeSettings: ReturnType<typeof vi.fn>; setSelectedShapeForUpdate: ReturnType<typeof vi.fn>};
  let notifications: {error: ReturnType<typeof vi.fn>};

  /** Simulates a change of the graph; `contentChange` false is a movement of a shape. */
  const change = (newContent?: string) => {
    if (newContent !== undefined) content = newContent;
    const changes = newContent === undefined ? [Object.create(GeometryChange.prototype)] : [{}];
    graphListener(null, {getProperty: () => changes});
  };

  /** Simulates the restore of the loader: the loaded content becomes the current content. */
  const restoredContent = () => {
    const calls = loader.restoreModel.mock.calls;
    return calls[calls.length - 1]?.[0];
  };

  beforeEach(() => {
    content = 'v0';
    position = 0;
    loader = {
      restoreModel: vi.fn((rdf: string) => {
        content = rdf;
        return of({});
      }),
    };
    renderer = {renderAgain: vi.fn(() => of(true))};
    viewState = {capture: vi.fn(() => view(position)), apply: vi.fn()};
    shapeSettings = {closeShapeSettings: vi.fn(), setSelectedShapeForUpdate: vi.fn()};
    notifications = {error: vi.fn()};

    const graph = {
      model: {
        addListener: vi.fn((name: string, listener: typeof graphListener) => {
          if (name === InternalEvent.CHANGE) graphListener = listener;
        }),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        ModelHistoryService,
        {
          provide: LoadedFilesService,
          useValue: {currentLoadedFile: {rdfModel: {serializationMetadata: {exportState: () => ({order: content})}}}},
        },
        {provide: ModelService, useValue: {synchronizeModelToRdf: vi.fn(() => of(true))}},
        {provide: RdfPort, useValue: {serializeModel: () => content}},
        {provide: MaxGraphService, useValue: {graph, graphInitialized$: new BehaviorSubject(true)}},
        {provide: GraphViewStateService, useValue: viewState},
        {provide: ShapeSettingsStateService, useValue: shapeSettings},
        {provide: NotificationsService, useValue: notifications},
        {provide: LanguageTranslationService, useValue: {language: {toolbar: {historyFailed: 'failed'}}}},
        {provide: ModelLoaderService, useValue: loader},
        {provide: ModelRendererService, useValue: renderer},
      ],
    });

    tabsStore = TestBed.inject(TabsStore);
    store = TestBed.inject(ModelHistoryStore);
    tabsStore.setTabs([
      {id: 'tab-1', file: 'a.ttl', namespace: 'ns'},
      {id: 'tab-2', file: 'b.ttl', namespace: 'ns'},
    ]);
    activate('tab-1');
    service = TestBed.inject(ModelHistoryService);
    service.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('cannot undo or redo after a reset', () => {
    expect(service.canUndo()).toBe(false);
    expect(service.canRedo()).toBe(false);
  });

  it('records a change of the model as one step which can be undone and redone', () => {
    change('v1');
    service.flush();
    expect(service.canUndo()).toBe(true);

    service.undo();
    expect(restoredContent()).toBe('v0');
    expect(service.canUndo()).toBe(false);
    expect(service.canRedo()).toBe(true);

    service.redo();
    expect(restoredContent()).toBe('v1');
    expect(service.canUndo()).toBe(true);
    expect(service.canRedo()).toBe(false);
  });

  it('restores the content, renders it again and applies the view of the snapshot', () => {
    position = 10;
    service.reset();
    position = 20;
    change('v1');
    service.flush();

    service.undo();
    expect(loader.restoreModel).toHaveBeenCalledWith('v0', {order: 'v0'});
    expect(renderer.renderAgain).toHaveBeenCalled();
    expect(viewState.apply).toHaveBeenCalledWith(view(10));
  });

  it('closes the edit dialog before restoring', () => {
    change('v1');
    service.undo();
    expect(shapeSettings.closeShapeSettings).toHaveBeenCalled();
    expect(shapeSettings.setSelectedShapeForUpdate).toHaveBeenCalledWith(null);
  });

  it('merges changes within the commit delay into one step', () => {
    vi.useFakeTimers();
    change('v1');
    vi.advanceTimersByTime(HISTORY_COMMIT_DELAY_MS / 2);
    change('v2');
    vi.advanceTimersByTime(HISTORY_COMMIT_DELAY_MS);

    service.undo();
    expect(restoredContent()).toBe('v0');
    expect(service.canUndo()).toBe(false);
  });

  it('commits the changes after the commit delay', () => {
    vi.useFakeTimers();
    change('v1');
    vi.advanceTimersByTime(HISTORY_COMMIT_DELAY_MS);
    change('v2');
    vi.advanceTimersByTime(HISTORY_COMMIT_DELAY_MS);

    service.undo();
    expect(restoredContent()).toBe('v1');
    expect(service.canUndo()).toBe(true);
  });

  it('can undo a change which is not committed yet', () => {
    change('v1');
    expect(service.canUndo()).toBe(true);

    service.undo();
    expect(restoredContent()).toBe('v0');
  });

  it('does not record a change which leaves the model as it is', () => {
    change('v0');
    service.flush();
    expect(service.canUndo()).toBe(false);
  });

  it('does not record moving shapes as step, but keeps the new positions', () => {
    position = 50;
    change();
    service.flush();
    expect(service.canUndo()).toBe(false);

    change('v1');
    service.flush();
    service.undo();
    expect(viewState.apply).toHaveBeenCalledWith(view(50));
  });

  it('keeps the view of the left state for redo', () => {
    change('v1');
    service.flush();
    position = 70;
    service.undo();

    service.redo();
    expect(viewState.apply).toHaveBeenLastCalledWith(view(70));
  });

  it('removes the steps which could be redone with a new change', () => {
    change('v1');
    service.flush();
    service.undo();
    expect(service.canRedo()).toBe(true);

    change('v2');
    service.flush();
    expect(service.canRedo()).toBe(false);
  });

  it(`keeps at most ${HISTORY_LIMIT} steps`, () => {
    for (let i = 1; i <= HISTORY_LIMIT + 2; i++) {
      change(`v${i}`);
      service.flush();
    }

    for (let i = 0; i < HISTORY_LIMIT; i++) {
      expect(service.canUndo()).toBe(true);
      service.undo();
    }
    expect(service.canUndo()).toBe(false);
    expect(restoredContent()).toBe('v2');
  });

  it('keeps a history per tab', () => {
    change('v1');
    service.flush();

    activate('tab-2');
    service.reset('tab-2');
    expect(service.canUndo()).toBe(false);

    activate('tab-1');
    expect(service.canUndo()).toBe(true);
  });

  it('starts a new history with reset and drops the histories of closed tabs', () => {
    change('v1');
    service.flush();
    service.reset();
    expect(service.canUndo()).toBe(false);

    activate('tab-2');
    service.reset();
    change('v2');
    service.flush();
    expect(Object.keys(store.histories()).sort()).toEqual(['tab-1', 'tab-2']);

    tabsStore.removeTab('tab-2');
    service.reset('tab-1');
    expect(Object.keys(store.histories())).toEqual(['tab-1']);
  });

  it('removes the history of a closed tab', () => {
    change('v1');
    service.flush();
    service.clear('tab-1');
    expect(service.canUndo()).toBe(false);
    expect(store.histories()['tab-1']).toBeUndefined();
  });

  it('keeps the history when the tab gets another id', () => {
    change('v1');
    service.flush();

    service.renameTab('tab-1', 'workspace:file.ttl');
    tabsStore.addOrUpdateTab({id: 'workspace:file.ttl', file: 'file.ttl', namespace: 'workspace'});
    activate('workspace:file.ttl');
    expect(store.histories()['tab-1']).toBeUndefined();
    expect(service.canUndo()).toBe(true);
  });

  it('keeps the history after saving, because saving does not change the graph', () => {
    change('v1');
    service.flush();
    // saving only synchronizes the model and writes it
    TestBed.inject(ModelService).synchronizeModelToRdf().subscribe();
    expect(service.canUndo()).toBe(true);
  });

  it('does not record changes while suspended, e.g. while a model is loaded', () => {
    service.suspend();
    change('v1');
    service.flush();
    expect(service.canUndo()).toBe(false);

    service.resume();
    change('v2');
    service.flush();
    expect(service.canUndo()).toBe(true);
  });

  it('needs a resume for every suspend', () => {
    service.suspend();
    service.suspend();
    service.resume();
    change('v1');
    service.flush();
    expect(service.canUndo()).toBe(false);
  });

  it('does not record the changes of the restore itself', () => {
    const rendered = new Subject<boolean>();
    renderer.renderAgain.mockReturnValue(rendered);
    change('v1');
    service.flush();

    service.undo();
    expect(service.isRestoring()).toBe(true);
    expect(service.canUndo()).toBe(false);
    change('v5');
    service.flush();
    rendered.next(true);

    expect(service.isRestoring()).toBe(false);
    expect(service.canUndo()).toBe(false);
    expect(service.canRedo()).toBe(true);
  });

  it('keeps the steps and informs the user when the restore fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    change('v1');
    service.flush();
    loader.restoreModel.mockReturnValueOnce(throwError(() => new Error('broken')));

    service.undo();
    expect(notifications.error).toHaveBeenCalledWith({title: 'failed'});
    expect(service.canUndo()).toBe(true);
    expect(service.canRedo()).toBe(false);
    expect(service.isRestoring()).toBe(false);
  });

  it('does nothing without steps', () => {
    service.undo();
    service.redo();
    expect(loader.restoreModel).not.toHaveBeenCalled();
  });

  it('keeps the state in the ModelHistoryStore', () => {
    change('v1');
    expect(store.pendingChange()).toBe(true);
    service.flush();
    expect(store.pendingChange()).toBe(false);
    expect(store.undoCount()).toBe(1);
    expect(store.activeHistory().current?.rdf).toBe('v1');
  });

  it('undoes the steps of the active tab only', () => {
    change('a1');
    service.flush();
    activate('tab-2');
    content = 'b0';
    service.reset();
    change('b1');
    service.flush();

    service.undo();
    expect(restoredContent()).toBe('b0');
    expect(store.histories()['tab-1'].undo.map(step => step.rdf)).toEqual(['v0']);
  });

  it('ignores undo and redo while an earlier version is restored', () => {
    renderer.renderAgain.mockReturnValue(new Subject<boolean>());
    change('v1');
    service.flush();
    change('v2');
    service.flush();

    service.undo();
    service.undo();
    service.redo();
    expect(loader.restoreModel).toHaveBeenCalledTimes(1);
  });

  it('undoes several steps one after another and redoes them again', () => {
    for (const version of ['v1', 'v2', 'v3']) {
      change(version);
      service.flush();
    }
    const undone = [1, 2, 3].map(() => (service.undo(), restoredContent()));
    expect(undone).toEqual(['v2', 'v1', 'v0']);
    const redone = [1, 2, 3].map(() => (service.redo(), restoredContent()));
    expect(redone).toEqual(['v1', 'v2', 'v3']);
  });

  it('does not record anything without a loaded model', () => {
    (TestBed.inject(LoadedFilesService) as {currentLoadedFile: unknown}).currentLoadedFile = null;
    change('v1');
    service.flush();
    expect(store.undoCount()).toBe(0);
  });

  it('does not record anything when the model cannot be synchronized', () => {
    vi.mocked(TestBed.inject(ModelService).synchronizeModelToRdf).mockReturnValue(throwError(() => new Error('broken')));
    change('v1');
    service.flush();
    expect(store.undoCount()).toBe(0);
  });

  it('does not record anything without an active tab', () => {
    tabsStore.setActiveTabId(null);
    change('v1');
    service.flush();
    service.reset();
    expect(Object.keys(store.histories())).toEqual(['tab-1']);
    expect(store.histories()['tab-1'].undo).toEqual([]);
  });

  describe('keyboard', () => {
    const key = (init: KeyboardEventInit, target?: HTMLElement) => {
      const event = new KeyboardEvent('keydown', {cancelable: true, ...init});
      if (target) Object.defineProperty(event, 'target', {value: target});
      return event;
    };
    const undoKey = () =>
      /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? {key: 'z', metaKey: true} : {key: 'z', ctrlKey: true};

    beforeEach(() => {
      change('v1');
      service.flush();
    });

    it('undoes with the shortcut and prevents the default action', () => {
      const event = key(undoKey());
      service.handleKeydown(event);
      expect(event.defaultPrevented).toBe(true);
      expect(restoredContent()).toBe('v0');
    });

    it('ignores the shortcut in text fields', () => {
      const event = key(undoKey(), document.createElement('input'));
      service.handleKeydown(event);
      expect(event.defaultPrevented).toBe(false);
      expect(loader.restoreModel).not.toHaveBeenCalled();
    });

    it('ignores the shortcut while a dialog is open', () => {
      const container = document.createElement('div');
      container.className = 'cdk-overlay-container';
      container.innerHTML = '<div class="mat-mdc-dialog-container"></div>';
      document.body.appendChild(container);
      try {
        service.handleKeydown(key(undoKey()));
        expect(loader.restoreModel).not.toHaveBeenCalled();
      } finally {
        container.remove();
      }
    });

    it('ignores other keys', () => {
      service.handleKeydown(key({key: 'a', ctrlKey: true, metaKey: true}));
      expect(loader.restoreModel).not.toHaveBeenCalled();
    });
  });
});
