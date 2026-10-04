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

import {WorkspaceFacade} from '@ame/domain';
import {
  IPC_RENDERER,
  LanguageTranslationService,
  LoadingScreenService,
  NotificationsService,
  SessionModelInfo,
  TAURI_EVENTS,
  WindowSession,
} from '@ame/shared';
import {inject, Injectable, Injector} from '@angular/core';
import {catchError, concatMap, finalize, first, forkJoin, from, map, Observable, of, switchMap, tap, toArray} from 'rxjs';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelLoaderService} from '../model-loader.service';
import {TabStateService} from '../tabs/tab-state.service';

export type SessionModelStatus = 'loaded' | 'missing' | 'failed';

export interface SessionRestoreResult {
  loaded: SessionModelInfo[];
  missing: SessionModelInfo[];
  failed: SessionModelInfo[];
}

export interface SessionRestoreOptions {
  /** Label of the window; only additional windows are closed when none of their models can be opened. */
  windowId?: string;
}

const MAIN_WINDOW = 'main';

function isNotFound(error: any): boolean {
  return error?.status === 404 || error?.error?.error?.code === 404;
}

/**
 * Reopens the models of a window from the last session. Models which no longer exist are skipped and reported.
 */
@Injectable({providedIn: 'root'})
export class SessionRestoreService {
  private readonly workspaceFacade = inject(WorkspaceFacade);
  private readonly loadingScreenService = inject(LoadingScreenService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly tabStateService = inject(TabStateService);
  private readonly ipcRenderer = inject(IPC_RENDERER, {optional: true});
  private readonly injector = inject(Injector);

  // Lazy on purpose: real DI cycles through ModelLoader/FileHandling -> TabState
  private get modelLoaderService(): ModelLoaderService {
    return this.injector.get(ModelLoaderService);
  }

  private get fileHandlingService(): FileHandlingService {
    return this.injector.get(FileHandlingService);
  }

  restore(session: WindowSession, options: SessionRestoreOptions = {}): Observable<SessionRestoreResult> {
    const result: SessionRestoreResult = {loaded: [], missing: [], failed: []};
    const models = session?.models ?? [];

    this.loadingScreenService.open({
      title: this.translate.language.loadingScreenDialog.modelLoading,
      content: this.translate.language.loadingScreenDialog.modelLoadingWait,
    });

    return from(models).pipe(
      concatMap(model => this.restoreModel(model, result.loaded.length > 0).pipe(tap(status => result[status].push(model)))),
      toArray(),
      switchMap(() => this.activate(session, result)),
      switchMap(() => this.reportProblems(result)),
      switchMap(() => this.handleNothingRestored(result, options)),
      map(() => result),
      finalize(() => this.loadingScreenService.close()),
    );
  }

  private restoreModel(model: SessionModelInfo, inNewTab: boolean): Observable<SessionModelStatus> {
    return this.workspaceFacade.fetchAspectMetaModel(model.aspectModelUrn).pipe(
      switchMap(response => {
        if (inNewTab) {
          this.tabStateService.saveActiveTabSnapshot();
        }
        return this.modelLoaderService.renderModel({
          aspectModelUri: response.sourceLocation ?? '',
          rdfAspectModel: response.content,
          aspectModelUrn: model.aspectModelUrn,
          namespaceFileName: `${model.namespace}:${model.file}`,
          fromWorkspace: true,
        });
      }),
      first(),
      map((): SessionModelStatus => 'loaded'),
      catchError(error => {
        console.error(`Unable to restore ${model.namespace}:${model.file}`, error);
        return of<SessionModelStatus>(isNotFound(error) ? 'missing' : 'failed');
      }),
    );
  }

  private activate(session: WindowSession, result: SessionRestoreResult): Observable<unknown> {
    const active = session.models[session.activeIndex];
    if (!active || !result.loaded.includes(active)) return of(true);

    const tab = this.tabStateService.findTab(active.namespace, active.file);
    return tab ? this.tabStateService.switchToTab(tab.id).pipe(first()) : of(true);
  }

  /** Waits for the translations, which may still be loading when the restore fails fast at startup. */
  private reportProblems(result: SessionRestoreResult): Observable<unknown> {
    const problems = [
      ...result.missing.map(model => ({model, key: 'session.modelNotFound', notify: this.notificationsService.warning})),
      ...result.failed.map(model => ({model, key: 'session.modelNotRestored', notify: this.notificationsService.error})),
    ];
    if (!problems.length) return of(true);

    const translateService = this.translate.translateService;
    return forkJoin(
      problems.map(({model, key, notify}) =>
        translateService.selectTranslate(key, {name: model.file}).pipe(
          first(),
          tap(title => notify.call(this.notificationsService, {title, message: `${model.namespace}:${model.file}`, timeout: 10000})),
        ),
      ),
    );
  }

  private handleNothingRestored(result: SessionRestoreResult, options: SessionRestoreOptions): Observable<unknown> {
    if (result.loaded.length > 0) return of(true);

    if (options.windowId && options.windowId !== MAIN_WINDOW && this.ipcRenderer) {
      this.ipcRenderer.send(TAURI_EVENTS.REQUEST.CLOSE_WINDOW, options.windowId);
      return of(true);
    }

    return this.fileHandlingService.loadEmptyModel().pipe(first());
  }
}
