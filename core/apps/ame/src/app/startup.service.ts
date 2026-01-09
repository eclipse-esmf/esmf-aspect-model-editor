/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {FileHandlingService, ModelLoaderService} from '@ame/editor';
import {MxGraphService} from '@ame/mx-graph';
import {ElectronSignalsService, ElectronTunnelService, LoadingScreenService, ModelSavingTrackerService, StartupPayload} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {inject, Injectable, NgZone} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {from, Observable, sample, switchMap, tap} from 'rxjs';
import {filter} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class StartupService {
  private mxGraphService = inject(MxGraphService);
  private electronSignalsService = inject(ElectronSignalsService);
  private electronTunnelService = inject(ElectronTunnelService);
  private modelLoaderService = inject(ModelLoaderService);
  private modelSaveTrackerService = inject(ModelSavingTrackerService);
  private fileHandlingService = inject(FileHandlingService);
  private loadingScreenService = inject(LoadingScreenService);
  private sidebarStateService = inject(SidebarStateService);
  private translate = inject(LanguageTranslationService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  listenForLoading() {
    return this.router.events.pipe(
      filter(ev => ev instanceof NavigationEnd && ev.url.includes('/editor')),
      switchMap(() => this.electronTunnelService.startUpData$.asObservable()),
      sample(this.mxGraphService.graphInitialized$.pipe(filter(Boolean))),
      switchMap(data =>
        data?.model
          ? this.loadModel(data.model).pipe(
              tap(() => this.sidebarStateService.workspace.refresh()),
              switchMap(() => from(this.router.navigate([]))),
            )
          : this.fileHandlingService.loadEmptyModel(),
      ),
    );
  }

  private loadModel(model: string): Observable<any> {
    let options: StartupPayload;
    this.ngZone.run(() =>
      this.loadingScreenService.open({
        title: this.translate.language.LOADING_SCREEN_DIALOG.MODEL_LOADING,
        content: this.translate.language.LOADING_SCREEN_DIALOG.MODEL_LOADING_WAIT,
      }),
    );

    return this.electronSignalsService.call('requestWindowData').pipe(
      tap(data => {
        options = data.options;
      }),
      switchMap(() =>
        this.ngZone.run(() =>
          model
            ? this.modelLoaderService.renderModel({
                rdfAspectModel: model,
                namespaceFileName: options ? `${options.namespace}:${options.file}` : '',
                fromWorkspace: options?.fromWorkspace,
                editElementUrn: options?.editElement,
              })
            : this.fileHandlingService.loadEmptyModel(),
        ),
      ),
      tap(() => {
        this.modelSaveTrackerService.updateSavedModel();
        this.loadingScreenService.close();
      }),
    );
  }
}
