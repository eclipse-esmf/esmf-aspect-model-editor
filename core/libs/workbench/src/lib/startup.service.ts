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

import {WorkspaceStore} from '@ame/domain';
import {FileHandlingService, ModelLoaderService, ModelSavingTrackerService} from '@ame/editor';
import {MaxGraphService} from '@ame/graph';
import {LanguageTranslationService, LoadingScreenService, StartupPayload, TauriSignalsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {from, Observable, sample, switchMap, tap} from 'rxjs';
import {filter} from 'rxjs/operators';
import {TauriTunnelService} from './tauri-tunnel.service';

@Injectable({providedIn: 'root'})
export class StartupService {
  private maxgraphService = inject(MaxGraphService);
  private tauriSignalsService = inject(TauriSignalsService);
  private tauriTunnelService = inject(TauriTunnelService);
  private modelLoaderService = inject(ModelLoaderService);
  private modelSaveTrackerService = inject(ModelSavingTrackerService);
  private fileHandlingService = inject(FileHandlingService);
  private loadingScreenService = inject(LoadingScreenService);
  private workspaceStore = inject(WorkspaceStore);
  private translate = inject(LanguageTranslationService);
  private router = inject(Router);

  listenForLoading() {
    return this.router.events.pipe(
      filter(ev => ev instanceof NavigationEnd && ev.url.includes('/editor')),
      switchMap(() => this.tauriTunnelService.startUpData$.asObservable()),
      sample(this.maxgraphService.graphInitialized$.pipe(filter(Boolean))),
      switchMap(data =>
        data?.model
          ? this.loadModel(data.model).pipe(
              tap(() => this.workspaceStore.triggerRefresh()),
              switchMap(() => from(this.router.navigate([]))),
            )
          : this.fileHandlingService.loadEmptyModel(),
      ),
    );
  }

  private loadModel(model: string): Observable<any> {
    let options: StartupPayload;
    this.loadingScreenService.open({
      title: this.translate.language.loadingScreenDialog.modelLoading,
      content: this.translate.language.loadingScreenDialog.modelLoadingWait,
    });

    return this.tauriSignalsService.call('requestWindowData').pipe(
      tap(data => {
        options = data.options;
      }),
      switchMap(() =>
        model
          ? this.modelLoaderService.renderModel({
              aspectModelUri: '',
              rdfAspectModel: model,
              namespaceFileName: options ? `${options.namespace}:${options.file}` : '',
              fromWorkspace: options?.fromWorkspace,
              editElementUrn: options?.editElement,
            })
          : this.fileHandlingService.loadEmptyModel(),
      ),
      tap(() => {
        this.modelSaveTrackerService.updateSavedModel();
        this.loadingScreenService.close();
      }),
    );
  }
}
