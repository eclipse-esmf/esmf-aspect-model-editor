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

import {RdfModel} from '@ame/rdf/utils';
import {map, Observable, of, switchMap} from 'rxjs';
import {Injectable} from '@angular/core';
import {RdfService} from '@ame/rdf/services';
import {LoadAspectModelService} from './load-aspect-model.service';
import {LanguageTranslationService} from '@ame/translation';
import {ConfirmDialogService} from '@ame/editor';
import {ConfirmDialogEnum} from '../models/confirm-dialog.enum';

@Injectable({
  providedIn: 'root',
})
export class HandleConflictService {
  constructor(
    private rdfService: RdfService,
    private loadAspectModelService: LoadAspectModelService,
    private confirmDialogService: ConfirmDialogService,
    private translate: LanguageTranslationService,
  ) {}

  handleFileVersionConflicts(fileName: string, fileContent: string): Observable<RdfModel> {
    const currentModel = this.rdfService.currentRdfModel;

    if (!currentModel.loadedFromWorkspace || !currentModel.isSameFile(fileName)) return of(this.rdfService.currentRdfModel);

    return this.rdfService.isSameModelContent(fileName, fileContent, currentModel).pipe(
      switchMap(isSameModelContent =>
        !isSameModelContent ? this.openReloadConfirmationDialog(currentModel.absoluteAspectModelFileName) : of(false),
      ),
      switchMap(isApprove => (isApprove ? this.loadAspectModelService.loadNewAspectModel({rdfAspectModel: fileContent}) : of(null))),
      map(() => this.rdfService.currentRdfModel),
    );
  }

  openReloadConfirmationDialog(fileName: string): Observable<boolean> {
    return this.confirmDialogService
      .open({
        phrases: [
          `${this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.VERSION_CHANGE_NOTICE} ${fileName} ${this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.WORKSPACE_LOAD_NOTICE}`,
          this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.RELOAD_WARNING,
        ],
        title: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.TITLE,
        closeButtonText: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.CLOSE_BUTTON,
        okButtonText: this.translate.language.CONFIRM_DIALOG.RELOAD_CONFIRMATION.OK_BUTTON,
      })
      .pipe(map(confirm => confirm === ConfirmDialogEnum.ok));
  }
}
