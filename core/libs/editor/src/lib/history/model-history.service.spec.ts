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

import {LoadedFilesService, ModelService, RdfPort} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {LanguageTranslationService, NotificationsService} from '@ame/shared';
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {GeometryChange, InternalEvent} from '@maxgraph/core';
import {BehaviorSubject, of, Subject, throwError} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ShapeSettingsStateService} from '../editor-dialog/services/shape-settings-state.service';
import {ModelLoaderService} from '../model-loader.service';
import {ModelRendererService} from '../model-renderer.service';
import {TabStateService} from '../tabs/tab-state.service';
import {GraphViewState, GraphViewStateService} from './graph-view-state.service';
import {HISTORY_COMMIT_DELAY_MS, HISTORY_LIMIT, ModelHistoryService} from './model-history.service';

const view = (x: number): GraphViewState => ({collapsed: false, shapes: {a: [{x, y: 0}]}, edges: {}, selection: [], scroll: {x: 0, y: 0}});

describe('ModelHistoryService', () => {
  let service: ModelHistoryService;
  let content: string;
  let position: number;
  let graphListener: (sender: unknown, event: {getProperty: (name: string) => unknown}) => void;
  let activeTabId: ReturnType<typeof signal<string>>;
  let tabs: ReturnType<typeof signal<{id: string}[]>>;
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
    activeTabId = signal('tab-1');
    tabs = signal([{id: 'tab-1'}, {id: 'tab-2'}]);
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
        {provide: TabStateService, useValue: {activeTabId, tabs}},
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

    activeTabId.set('tab-2');
    service.reset('tab-2');
    expect(service.canUndo()).toBe(false);

    activeTabId.set('tab-1');
    expect(service.canUndo()).toBe(true);
  });

  it('starts a new history with reset and drops the histories of closed tabs', () => {
    change('v1');
    service.flush();
    service.reset();
    expect(service.canUndo()).toBe(false);

    activeTabId.set('tab-2');
    change('v2');
    service.flush();
    tabs.set([{id: 'tab-1'}]);
    service.reset('tab-1');
    activeTabId.set('tab-2');
    expect(service.canUndo()).toBe(false);
  });

  it('removes the history of a closed tab', () => {
    change('v1');
    service.flush();
    service.clear('tab-1');
    expect(service.canUndo()).toBe(false);
  });

  it('keeps the history when the tab gets another id', () => {
    change('v1');
    service.flush();

    service.renameTab('tab-1', 'workspace:file.ttl');
    activeTabId.set('workspace:file.ttl');
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
