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
  TAURI_EVENTS,
  WindowSession,
} from '@ame/shared';
import {provideZonelessChangeDetection} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BehaviorSubject, firstValueFrom, map, Observable, of, Subject, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelLoaderService} from '../model-loader.service';
import {TabStateService} from '../tabs/tab-state.service';
import {SessionRestoreService} from './session-restore.service';

const model = (name: string) => ({
  namespace: 'org.example:1.0.0',
  file: `${name}.ttl`,
  aspectModelUrn: `urn:samm:org.example:1.0.0#${name}`,
});

describe('SessionRestoreService', () => {
  let service: SessionRestoreService;
  let fetchAspectMetaModel: ReturnType<typeof vi.fn>;
  let renderModel: ReturnType<typeof vi.fn>;
  let loadEmptyModel: ReturnType<typeof vi.fn>;
  let tabState: {saveActiveTabSnapshot: ReturnType<typeof vi.fn>; findTab: ReturnType<typeof vi.fn>; switchToTab: ReturnType<typeof vi.fn>};
  let notifications: {warning: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>};
  let loadingScreen: {open: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn>};
  let ipc: {send: ReturnType<typeof vi.fn>};
  let existing: Set<string>;
  /** Emits once the translations are loaded. */
  let translations$: Observable<boolean>;

  beforeEach(() => {
    existing = new Set(['A', 'C']);
    fetchAspectMetaModel = vi.fn((urn: string) => {
      const name = urn.split('#')[1];
      return existing.has(name)
        ? of({content: `ttl ${name}`, sourceLocation: `file:/ws/${name}.ttl`})
        : throwError(() => ({status: 404, error: {error: {code: 404, message: 'File does not exist'}}}));
    });
    renderModel = vi.fn(() => of(true));
    loadEmptyModel = vi.fn(() => of(undefined));
    tabState = {
      saveActiveTabSnapshot: vi.fn(),
      findTab: vi.fn((namespace: string, file: string) => ({id: `${namespace}:${file}`})),
      switchToTab: vi.fn(() => of(true)),
    };
    notifications = {warning: vi.fn(), error: vi.fn()};
    translations$ = new BehaviorSubject<boolean>(true);
    loadingScreen = {open: vi.fn(), close: vi.fn()};
    ipc = {send: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {provide: WorkspaceFacade, useValue: {fetchAspectMetaModel}},
        {provide: LoadingScreenService, useValue: loadingScreen},
        {provide: NotificationsService, useValue: notifications},
        {
          provide: LanguageTranslationService,
          useValue: {
            language: {loadingScreenDialog: {modelLoading: 'Loading', modelLoadingWait: 'Wait'}},
            translateService: {selectTranslate: (key: string, params: any) => translations$.pipe(map(() => `${key}:${params.name}`))},
          },
        },
        {provide: TabStateService, useValue: tabState},
        {provide: IPC_RENDERER, useValue: ipc},
        {provide: ModelLoaderService, useValue: {renderModel}},
        {provide: FileHandlingService, useValue: {loadEmptyModel}},
      ],
    });
    service = TestBed.inject(SessionRestoreService);
  });

  it('should reopen existing models as tabs, skip missing ones and inform the user', async () => {
    const session: WindowSession = {models: [model('A'), model('B'), model('C')], activeIndex: 2};

    const result = await firstValueFrom(service.restore(session, {windowId: 'main'}));

    expect(result.loaded.map(m => m.file)).toEqual(['A.ttl', 'C.ttl']);
    expect(result.missing.map(m => m.file)).toEqual(['B.ttl']);
    expect(renderModel).toHaveBeenCalledTimes(2);
    expect(renderModel).toHaveBeenCalledWith(
      expect.objectContaining({
        rdfAspectModel: 'ttl A',
        aspectModelUri: 'file:/ws/A.ttl',
        aspectModelUrn: 'urn:samm:org.example:1.0.0#A',
        namespaceFileName: 'org.example:1.0.0:A.ttl',
        fromWorkspace: true,
      }),
    );
    // The first model replaces the empty tab, every further model is opened in a new tab.
    expect(tabState.saveActiveTabSnapshot).toHaveBeenCalledTimes(1);
    expect(tabState.switchToTab).toHaveBeenCalledWith('org.example:1.0.0:C.ttl');
    expect(notifications.warning).toHaveBeenCalledWith(expect.objectContaining({title: 'session.modelNotFound:B.ttl'}));
    expect(loadingScreen.open).toHaveBeenCalled();
    expect(loadingScreen.close).toHaveBeenCalled();
    expect(loadEmptyModel).not.toHaveBeenCalled();
  });

  it('should report models which fail for other reasons as errors', async () => {
    fetchAspectMetaModel.mockReturnValueOnce(throwError(() => ({status: 500})));

    const result = await firstValueFrom(service.restore({models: [model('A')], activeIndex: 0}));

    expect(result.failed.map(m => m.file)).toEqual(['A.ttl']);
    expect(notifications.error).toHaveBeenCalledWith(expect.objectContaining({title: 'session.modelNotRestored:A.ttl'}));
  });

  it('should not switch tabs when the active model is missing', async () => {
    await firstValueFrom(service.restore({models: [model('A'), model('B')], activeIndex: 1}));

    expect(tabState.switchToTab).not.toHaveBeenCalled();
  });

  it('should load an empty model in the main window when nothing could be restored', async () => {
    existing.clear();

    await firstValueFrom(service.restore({models: [model('B')], activeIndex: 0}, {windowId: 'main'}));

    expect(loadEmptyModel).toHaveBeenCalled();
    expect(ipc.send).not.toHaveBeenCalled();
  });

  it('should close an additional window when nothing could be restored', async () => {
    existing.clear();

    await firstValueFrom(service.restore({models: [model('B')], activeIndex: 0}, {windowId: 'win-1-1'}));

    expect(ipc.send).toHaveBeenCalledWith(TAURI_EVENTS.REQUEST.CLOSE_WINDOW, 'win-1-1');
    expect(loadEmptyModel).not.toHaveBeenCalled();
  });

  it('should wait for the translations before informing about missing models', async () => {
    const loaded$ = new Subject<boolean>();
    translations$ = loaded$;
    fetchAspectMetaModel.mockReturnValue(throwError(() => ({status: 404})));

    let done = false;
    service.restore({models: [model('A')], activeIndex: 0}, {windowId: 'main'}).subscribe(() => (done = true));

    expect(notifications.warning).not.toHaveBeenCalled();
    expect(done).toBe(false);

    loaded$.next(true);

    expect(notifications.warning).toHaveBeenCalledWith(expect.objectContaining({title: 'session.modelNotFound:A.ttl'}));
    expect(done).toBe(true);
  });
});
