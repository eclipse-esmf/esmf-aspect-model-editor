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

import {GraphNavigatorPort, WorkspaceStore} from '@ame/domain';
import {FileHandlingService, ModelLoaderService, ModelSavingTrackerService} from '@ame/editor';
import {LanguageTranslationService, LoadingScreenService, TauriSignalsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {StartupService} from './startup.service';
import {TauriTunnelService} from './tauri-tunnel.service';

describe('StartupService', () => {
  let service: StartupService;

  let events$: Subject<any>;
  let startUpData$: BehaviorSubject<any>;
  let graphInitialized$: BehaviorSubject<boolean>;

  let router: {events: Subject<any>; navigate: ReturnType<typeof vi.fn>};
  let maxgraphService: {graphInitialized$: BehaviorSubject<boolean>};
  let tauriSignalsService: {call: ReturnType<typeof vi.fn>};
  let tauriTunnelService: {startUpData$: BehaviorSubject<any>};
  let modelLoaderService: {renderModel: ReturnType<typeof vi.fn>};
  let modelSaveTrackerService: {updateSavedModel: ReturnType<typeof vi.fn>};
  let fileHandlingService: {loadEmptyModel: ReturnType<typeof vi.fn>};
  let loadingScreenService: {open: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn>};
  let workspaceStore: {triggerRefresh: ReturnType<typeof vi.fn>};
  let translate: {language: {loadingScreenDialog: {modelLoading: string; modelLoadingWait: string}}};

  beforeEach(() => {
    events$ = new Subject();
    startUpData$ = new BehaviorSubject<any>(null);
    graphInitialized$ = new BehaviorSubject<boolean>(false);

    router = {events: events$, navigate: vi.fn(() => Promise.resolve(true))};
    maxgraphService = {graphInitialized$};
    tauriSignalsService = {call: vi.fn(() => of({options: {namespace: 'ns', file: 'file.ttl'}}))};
    tauriTunnelService = {startUpData$};
    modelLoaderService = {renderModel: vi.fn(() => of(undefined))};
    modelSaveTrackerService = {updateSavedModel: vi.fn()};
    fileHandlingService = {loadEmptyModel: vi.fn(() => of(undefined))};
    loadingScreenService = {open: vi.fn(), close: vi.fn()};
    workspaceStore = {triggerRefresh: vi.fn()};
    translate = {language: {loadingScreenDialog: {modelLoading: 'Loading model', modelLoadingWait: 'Please wait'}}};

    TestBed.configureTestingModule({
      providers: [
        StartupService,
        {provide: GraphNavigatorPort, useValue: maxgraphService},
        {provide: TauriSignalsService, useValue: tauriSignalsService},
        {provide: TauriTunnelService, useValue: tauriTunnelService},
        {provide: ModelLoaderService, useValue: modelLoaderService},
        {provide: ModelSavingTrackerService, useValue: modelSaveTrackerService},
        {provide: FileHandlingService, useValue: fileHandlingService},
        {provide: LoadingScreenService, useValue: loadingScreenService},
        {provide: WorkspaceStore, useValue: workspaceStore},
        {provide: LanguageTranslationService, useValue: translate},
        {provide: Router, useValue: router},
      ],
    });

    service = TestBed.inject(StartupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load a model when startup data contains one and the graph is initialized', () => {
    const next = vi.fn();
    service.listenForLoading().subscribe(next);

    events$.next(new NavigationEnd(1, '/editor', '/editor'));
    startUpData$.next({isFirstWindow: true, model: '<ttl content>'});
    graphInitialized$.next(true);

    expect(loadingScreenService.open).toHaveBeenCalledWith({
      title: 'Loading model',
      content: 'Please wait',
    });
    expect(modelLoaderService.renderModel).toHaveBeenCalledWith(
      expect.objectContaining({
        aspectModelUri: '',
        rdfAspectModel: '<ttl content>',
        namespaceFileName: 'ns:file.ttl',
      }),
    );
    expect(modelSaveTrackerService.updateSavedModel).toHaveBeenCalled();
    expect(loadingScreenService.close).toHaveBeenCalled();
    expect(workspaceStore.triggerRefresh).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith([]);
  });

  it('should load an empty model when there is no model in the startup data', () => {
    const next = vi.fn();
    service.listenForLoading().subscribe(next);

    events$.next(new NavigationEnd(1, '/editor', '/editor'));
    startUpData$.next({isFirstWindow: true, model: null});
    graphInitialized$.next(true);

    expect(fileHandlingService.loadEmptyModel).toHaveBeenCalled();
    expect(modelLoaderService.renderModel).not.toHaveBeenCalled();
  });

  it('should ignore navigation events that are not the editor route', () => {
    const next = vi.fn();
    service.listenForLoading().subscribe(next);

    events$.next(new NavigationEnd(1, '/loading', '/loading'));
    startUpData$.next({isFirstWindow: true, model: null});
    graphInitialized$.next(true);

    expect(fileHandlingService.loadEmptyModel).not.toHaveBeenCalled();
  });
});
