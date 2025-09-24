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
import {ElectronSignals, ElectronSignalsService, LoadingScreenService, ModelSavingTrackerService, StartupPayload} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Injectable, NgZone, inject} from '@angular/core';
import {Observable, of, switchMap, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class StartupService {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  constructor(
    private modelSaveTracker: ModelSavingTrackerService,
    private loadingScreenService: LoadingScreenService,
    private fileHandlingService: FileHandlingService,
    private translate: LanguageTranslationService,
    private ngZone: NgZone,
    private modelLoaderService: ModelLoaderService,
  ) {}

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
