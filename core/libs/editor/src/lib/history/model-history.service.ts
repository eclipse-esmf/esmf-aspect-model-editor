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

import {HistoryDirection, LoadedFilesService, ModelHistoryStore, ModelService, ModelSnapshot, RdfPort, TabsStore} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {LanguageTranslationService, NotificationsService} from '@ame/shared';
import {inject, Injectable, Injector} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
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
import {GraphViewStateService} from './graph-view-state.service';
import {historyActionOf, isEditableTarget, isMacPlatform} from './history-shortcuts';

/** Changes of the graph which happen within this time are recorded as one step. */
export const HISTORY_COMMIT_DELAY_MS = 250;

/** Graph changes which only change the view, but not the Aspect Model. */
const VIEW_ONLY_CHANGES = [GeometryChange, StyleChange, CollapseChange, VisibleChange, SelectionChange];

/**
 * Undo/redo for the changes of the Aspect Model in the graph (snapshot approach).
 *
 * The state (the snapshots per tab) is kept in the ModelHistoryStore. This service records the snapshots:
 * every change of the graph which is more than a movement of shapes is recorded as a snapshot of the model.
 * Undo and redo load such a snapshot again and render it with the previous positions of the shapes.
 * The history is kept per tab and starts again when a model is loaded.
 */
@Injectable({providedIn: 'root'})
export class ModelHistoryService {
  private readonly injector = inject(Injector);
  private readonly store = inject(ModelHistoryStore);
  private readonly tabsStore = inject(TabsStore);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly modelService = inject(ModelService);
  private readonly rdfService = inject(RdfPort);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly viewStateService = inject(GraphViewStateService);
  private readonly shapeSettingsStateService = inject(ShapeSettingsStateService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);

  private suspended = 0;
  private pendingCommit: ReturnType<typeof setTimeout> | null = null;
  private observedGraph: Graph | null = null;

  public readonly isRestoring = this.store.restoring;
  public readonly canUndo = this.store.canUndo;
  public readonly canRedo = this.store.canRedo;

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
  reset(tabId: string | null = this.tabsStore.activeTabId()): void {
    this.cancelPendingCommit();
    if (!tabId) return;
    this.store.start(tabId, this.capture());
  }

  clear(tabId: string): void {
    this.store.remove(tabId);
  }

  /** Keeps the history when the id of a tab changes, e.g. when a new model is saved the first time. */
  renameTab(oldTabId: string, newTabId: string): void {
    this.store.renameTab(oldTabId, newTabId);
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

    const contentChanged = this.store.pendingChange();
    this.cancelPendingCommit();
    if (this.suspended || this.store.restoring()) return;

    const tabId = this.tabsStore.activeTabId();
    if (!tabId) return;

    if (!contentChanged) {
      // moving shapes is not a step of its own, but undo and redo keep the new positions
      this.store.updateView(tabId, this.viewStateService.capture());
      return;
    }

    const snapshot = this.capture();
    if (snapshot) this.store.record(tabId, snapshot);
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

  private step(direction: HistoryDirection): void {
    if (this.store.restoring()) return;
    this.flush();

    const tabId = this.tabsStore.activeTabId();
    const target = tabId ? this.store.takeStep(tabId, direction, this.viewStateService.capture()) : null;
    if (!target) return;

    this.restore(target).subscribe({
      next: () => this.store.completeStep(tabId, this.capture() ?? target),
      error: error => {
        console.error(error);
        this.store.revertStep(tabId, direction, target);
        this.notificationsService.error({title: this.translate.language?.toolbar?.historyFailed ?? 'The change could not be undone'});
      },
    });
  }

  private restore(snapshot: ModelSnapshot): Observable<void> {
    this.store.setRestoring(true);
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
        this.store.setRestoring(false);
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
    if (this.suspended || this.store.restoring()) return;

    if ((changes ?? []).some(change => !VIEW_ONLY_CHANGES.some(type => change instanceof type))) {
      this.store.setPendingChange(true);
    }
    if (this.pendingCommit) clearTimeout(this.pendingCommit);
    this.pendingCommit = setTimeout(() => this.flush(), HISTORY_COMMIT_DELAY_MS);
  }

  private cancelPendingCommit(): void {
    if (this.pendingCommit) clearTimeout(this.pendingCommit);
    this.pendingCommit = null;
    this.store.setPendingChange(false);
  }

  private isDialogOpen(): boolean {
    return typeof document !== 'undefined' && !!document.querySelector('.cdk-overlay-container .mat-mdc-dialog-container');
  }
}
