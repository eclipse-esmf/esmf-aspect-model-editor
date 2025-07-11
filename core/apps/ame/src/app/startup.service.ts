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

import {EditorService, FileHandlingService, ModelLoaderService} from '@ame/editor';
import {MigratorService} from '@ame/migrator';
import {MxGraphService} from '@ame/mx-graph';
import {
  ElectronSignals,
  ElectronSignalsService,
  ElectronTunnelService,
  LoadingScreenService,
  ModelSavingTrackerService,
  StartupPayload,
} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {LanguageTranslationService} from '@ame/translation';
import {Injectable, NgZone, inject} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Observable, filter, of, sample, switchMap, take, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class StartupService {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  constructor(
    private migratorService: MigratorService,
    private sidebarService: SidebarStateService,
    private router: Router,
    private editorService: EditorService,
    private modelSaveTracker: ModelSavingTrackerService,
    private electronTunnelService: ElectronTunnelService,
    private loadingScreenService: LoadingScreenService,
    private fileHandlingService: FileHandlingService,
    private mxGraphService: MxGraphService,
    private translate: LanguageTranslationService,
    private ngZone: NgZone,
    private modelLoaderService: ModelLoaderService,
  ) {}

  listenForLoading() {
    this.router.events
      .pipe(
        filter(ev => ev instanceof NavigationEnd && ev.url.includes('/editor')),
        switchMap(() => this.electronTunnelService.startUpData$.asObservable()),
        sample(this.mxGraphService.graphInitialized$.pipe(filter(Boolean))),
        filter(data => {
          if (data?.model) {
            return true;
          } else {
            this.fileHandlingService.createEmptyModel();
            return false;
          }
        }),
        take(1),
        switchMap(({isFirstWindow, model}) =>
          (isFirstWindow ? this.migratorService.startMigrating() : of(null)).pipe(switchMap(() => this.loadModel(model))),
        ),
      )
      .subscribe(() => {
        this.sidebarService.workspace.refresh();
        this.router.navigate([{outlets: {migrator: null, 'export-namespaces': null, 'import-namespaces': null}}]);
      });
  }

  loadModel(model: string): Observable<any> {
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
            : of(this.fileHandlingService.createEmptyModel()),
        ),
      ),
      tap(() => {
        this.modelSaveTracker.updateSavedModel();
        this.loadingScreenService.close();
      }),
    );
  }
}
