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
import {computed, inject, Injectable, Injector, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SerializationMetadataState} from '@esmf/aspect-model-loader';
import {
  CollapseChange,
  EventObject,
  GeometryChange,
  Graph,
  InternalEvent,
  SelectionChange,
  StyleChange,
  VisibleChange,
} from '@maxgraph/core';
import {environment} from 'environments/environment';
import {catchError, EMPTY, filter, finalize, map, Observable, switchMap, take, tap} from 'rxjs';
import {ShapeSettingsStateService} from '../editor-dialog/services/shape-settings-state.service';
import {ModelLoaderService} from '../model-loader.service';
import {ModelRendererService} from '../model-renderer.service';
import {TabStateService} from '../tabs/tab-state.service';
import {GraphViewState, GraphViewStateService} from './graph-view-state.service';
import {historyActionOf, isEditableTarget, isMacPlatform} from './history-shortcuts';

/** Number of steps which can be undone per tab. */
export const HISTORY_LIMIT = 25;

/** Changes of the graph which happen within this time are recorded as one step. */
export const HISTORY_COMMIT_DELAY_MS = 250;

/** Graph changes which only change the view, but not the Aspect Model. */
const VIEW_ONLY_CHANGES = [GeometryChange, StyleChange, CollapseChange, VisibleChange, SelectionChange];

/** Everything needed to show a model again as it was: its content, its file layout and its view. */
export interface ModelSnapshot {
  rdf: string;
  metadata: SerializationMetadataState;
  view: GraphViewState;
}

interface TabHistory {
  undo: ModelSnapshot[];
  redo: ModelSnapshot[];
  /** The state after the last recorded step, which is the state to go back to with the next undo. */
  current: ModelSnapshot | null;
}

/**
 * Undo/redo for the changes of the Aspect Model in the graph (snapshot approach).
 *
 * Every change of the graph which is more than a movement of shapes is recorded as a snapshot of the model.
 * Undo and redo load such a snapshot again and render it with the previous positions of the shapes.
 * The history is kept per tab and starts again when a model is loaded.
 */
@Injectable({providedIn: 'root'})
export class ModelHistoryService {
  private readonly injector = inject(Injector);
  private readonly tabStateService = inject(TabStateService);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly modelService = inject(ModelService);
  private readonly rdfService = inject(RdfPort);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly viewStateService = inject(GraphViewStateService);
  private readonly shapeSettingsStateService = inject(ShapeSettingsStateService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);

  private readonly histories = new Map<string, TabHistory>();
  private readonly revision = signal(0);
  private readonly restoring = signal(false);
  private suspended = 0;
  private pendingCommit: ReturnType<typeof setTimeout> | null = null;
  /** A change of the model which is not recorded yet; undo records it first, so it can already be undone. */
  private readonly pendingContentChange = signal(false);
  private observedGraph: Graph | null = null;

  public readonly isRestoring = this.restoring.asReadonly();
  public readonly canUndo = computed(() => !this.restoring() && (this.pendingContentChange() || this.stackSize('undo') > 0));
  public readonly canRedo = computed(() => !this.restoring() && this.stackSize('redo') > 0);

  // Lazy on purpose: ModelLoaderService records the start of the history after loading a model.
  private get modelLoader(): ModelLoaderService {
    return this.injector.get(ModelLoaderService);
  }

  private get modelRenderer(): ModelRendererService {
    return this.injector.get(ModelRendererService);
  }

  constructor() {
    if (!environment.production && typeof window !== 'undefined') {
      window['angular.modelHistoryService'] = this;
    }

    this.maxgraphService.graphInitialized$
      .pipe(filter(Boolean), takeUntilDestroyed())
      .subscribe(() => this.observeGraph(this.maxgraphService.graph));
  }

  undo(): void {
    this.step('undo');
  }

  redo(): void {
    this.step('redo');
  }

  /** Starts a new history for the tab with the current state of the model, e.g. after loading a model. */
  reset(tabId: string | null = this.tabStateService.activeTabId()): void {
    this.cancelPendingCommit();
    if (!tabId) return;

    const openTabs = new Set(this.tabStateService.tabs().map(tab => tab.id));
    [...this.histories.keys()].filter(id => !openTabs.has(id)).forEach(id => this.histories.delete(id));

    this.histories.set(tabId, {undo: [], redo: [], current: this.capture()});
    this.revision.update(value => value + 1);
  }

  clear(tabId: string): void {
    if (this.histories.delete(tabId)) {
      this.revision.update(value => value + 1);
    }
  }

  /** Keeps the history when the id of a tab changes, e.g. when a new model is saved the first time. */
  renameTab(oldTabId: string, newTabId: string): void {
    const history = this.histories.get(oldTabId);
    if (!history || oldTabId === newTabId) return;

    this.histories.delete(oldTabId);
    this.histories.set(newTabId, history);
    this.revision.update(value => value + 1);
  }

  /** Stops recording, e.g. while a model is loaded. Every call needs a matching `resume`. */
  suspend(): void {
    this.cancelPendingCommit();
    this.suspended++;
  }

  resume(): void {
    this.suspended = Math.max(0, this.suspended - 1);
  }

  /** Records pending changes immediately instead of waiting for the next quiet moment, e.g. before switching the tab. */
  flush(): void {
    if (!this.pendingCommit) return;

    const contentChanged = this.pendingContentChange();
    this.cancelPendingCommit();
    if (this.suspended || this.restoring()) return;

    const tabId = this.tabStateService.activeTabId();
    if (!tabId) return;
    const history = this.histories.get(tabId) ?? {undo: [], redo: [], current: null};
    this.histories.set(tabId, history);

    if (!contentChanged) {
      // moving shapes is not a step of its own, but undo and redo keep the new positions
      if (history.current) history.current = {...history.current, view: this.viewStateService.capture()};
      return;
    }

    const snapshot = this.capture();
    if (!snapshot) return;

    if (history.current && history.current.rdf !== snapshot.rdf) {
      this.push(history.undo, history.current);
      history.redo = [];
    }
    history.current = snapshot;
    this.revision.update(value => value + 1);
  }

  /** Undo with Cmd/Ctrl+Z, redo with Cmd/Ctrl+Shift+Z (and Ctrl+Y on Windows/Linux). Text fields keep their own undo. */
  handleKeydown(event: KeyboardEvent): void {
    const action = historyActionOf(event, isMacPlatform());
    if (!action || isEditableTarget(event.target) || this.isDialogOpen()) return;

    event.preventDefault();
    if (action === 'undo') {
      this.undo();
    } else {
      this.redo();
    }
  }

  private step(direction: 'undo' | 'redo'): void {
    if (this.restoring()) return;
    this.flush();

    const history = this.histories.get(this.tabStateService.activeTabId());
    const source = direction === 'undo' ? history?.undo : history?.redo;
    if (!history?.current || !source?.length) return;

    const target = source.pop();
    const opposite = direction === 'undo' ? history.redo : history.undo;
    const previous = {...history.current, view: this.viewStateService.capture()};
    this.push(opposite, previous);
    this.revision.update(value => value + 1);

    this.restore(target).subscribe({
      next: () => (history.current = this.capture() ?? target),
      error: error => {
        console.error(error);
        opposite.pop();
        source.push(target);
        this.revision.update(value => value + 1);
        this.notificationsService.error({title: this.translate.language?.toolbar?.historyFailed ?? 'The change could not be undone'});
      },
    });
  }

  private restore(snapshot: ModelSnapshot): Observable<void> {
    this.restoring.set(true);
    this.cancelPendingCommit();
    // the edit dialog shows an element of the replaced model
    this.shapeSettingsStateService.closeShapeSettings();
    this.shapeSettingsStateService.setSelectedShapeForUpdate(null);

    return this.modelLoader.restoreModel(snapshot.rdf, snapshot.metadata).pipe(
      switchMap(() => this.modelRenderer.renderAgain()),
      tap(() => this.viewStateService.apply(snapshot.view)),
      map(() => undefined),
      take(1),
      finalize(() => {
        this.cancelPendingCommit();
        this.restoring.set(false);
        this.revision.update(value => value + 1);
      }),
    );
  }

  private capture(): ModelSnapshot | null {
    const rdfModel = this.loadedFilesService.currentLoadedFile?.rdfModel;
    if (!rdfModel) return null;

    // the RDF store only contains the changes of the graph after a synchronization (which happens synchronously)
    let synchronized = false;
    this.modelService
      .synchronizeModelToRdf()
      .pipe(
        take(1),
        catchError(() => EMPTY),
      )
      .subscribe(() => (synchronized = true));
    if (!synchronized) return null;

    return {
      rdf: this.rdfService.serializeModel(rdfModel),
      metadata: rdfModel.serializationMetadata.exportState(),
      view: this.viewStateService.capture(),
    };
  }

  private observeGraph(graph: Graph | null): void {
    if (!graph || graph === this.observedGraph) return;
    this.observedGraph = graph;
    graph.model.addListener(InternalEvent.CHANGE, (_sender: unknown, event: EventObject) =>
      this.onGraphChange(event?.getProperty('changes')),
    );
  }

  private onGraphChange(changes: unknown[] | undefined): void {
    if (this.suspended || this.restoring()) return;

    if ((changes ?? []).some(change => !VIEW_ONLY_CHANGES.some(type => change instanceof type))) {
      this.pendingContentChange.set(true);
    }
    if (this.pendingCommit) clearTimeout(this.pendingCommit);
    this.pendingCommit = setTimeout(() => this.flush(), HISTORY_COMMIT_DELAY_MS);
  }

  private cancelPendingCommit(): void {
    if (this.pendingCommit) clearTimeout(this.pendingCommit);
    this.pendingCommit = null;
    this.pendingContentChange.set(false);
  }

  private push(stack: ModelSnapshot[], snapshot: ModelSnapshot): void {
    stack.push(snapshot);
    if (stack.length > HISTORY_LIMIT) stack.splice(0, stack.length - HISTORY_LIMIT);
  }

  private stackSize(stack: 'undo' | 'redo'): number {
    this.revision();
    return this.histories.get(this.tabStateService.activeTabId())?.[stack].length ?? 0;
  }

  private isDialogOpen(): boolean {
    return typeof document !== 'undefined' && !!document.querySelector('.cdk-overlay-container .mat-mdc-dialog-container');
  }
}
