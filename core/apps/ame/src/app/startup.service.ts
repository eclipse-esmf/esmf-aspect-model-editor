/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {EditorService} from '@ame/editor';
import {MigratorService} from '@ame/migrator';
import {ElectronTunnelService, LoadingScreenService, ModelSavingTrackerService, SidebarService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Observable, filter, of, switchMap, take, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class StartupService {
  constructor(
    private migratorService: MigratorService,
    private sidebarService: SidebarService,
    private router: Router,
    private editorService: EditorService,
    private modelSaveTracker: ModelSavingTrackerService,
    private electronTunnelService: ElectronTunnelService,
    private loadingScreenService: LoadingScreenService
  ) {}

  listenForLoading() {
    this.router.events
      .pipe(
        filter(ev => ev instanceof NavigationEnd && ev.url.includes('/editor')),
        switchMap(() => this.electronTunnelService.startUpData$.asObservable()),
        filter(Boolean),
        take(1),
        switchMap(({isFirstWindow, model}) =>
          (isFirstWindow ? this.migratorService.startMigrating() : of(null)).pipe(switchMap(() => this.loadModel(model)))
        )
      )
      .subscribe(() => {
        this.sidebarService.refreshSidebarNamespaces();
        this.router.navigate([{outlets: {migrator: null, 'export-namespaces': null, 'import-namespaces': null}}]);
      });
  }

  loadModel(model: string): Observable<any> {
    const options = this.electronTunnelService.windowInfo?.options;

    this.loadingScreenService.open({title: 'Loading model', content: 'Please wait until the model is loaded!'});
    return this.editorService.loadNewAspectModel(model, options ? `${options.namespace}:${options.file}` : '').pipe(
      tap(() => {
        this.modelSaveTracker.updateSavedModel();
        this.loadingScreenService.close();
      })
    );
  }
}
