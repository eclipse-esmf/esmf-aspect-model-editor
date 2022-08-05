/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ModelApiService} from '@ame/api';
import {EditorService} from '@ame/editor';
import {NotificationsService} from '@ame/shared';
import {first, Observable, of, switchMap} from 'rxjs';

@Component({
  selector: 'ame-start-load-modal',
  templateUrl: './start-load-modal.component.html',
  styleUrls: ['./start-load-modal.component.scss'],
})
export class StartLoadModalComponent {
  public loadingButton: string = null;

  constructor(
    private modelApiService: ModelApiService,
    private editorService: EditorService,
    private notificationsService: NotificationsService,
    private matDialogRef: MatDialogRef<StartLoadModalComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {aspectModel: string}
  ) {}

  loadAutoSavedModel() {
    this.loadingButton = 'autoSaved';
    this.loadNewAspectModel(of(this.data.aspectModel), () => {
      this.notificationsService.info('Auto saved model was loaded');
    });
    this.editorService.showLastSavedRdf({rdf: this.data.aspectModel});
  }

  loadDefault() {
    this.loadingButton = 'default';
    this.loadNewAspectModel(
      this.modelApiService.getDefaultAspectModel(),
      () => {
        this.notificationsService.info('Default model was loaded', null, null);
      },
      true
    );
  }

  private loadNewAspectModel(aspectModel: Observable<string>, callback: Function, isDefault?: boolean) {
    aspectModel
      .pipe(
        switchMap(model => this.editorService.loadNewAspectModel(model, isDefault)),
        first()
      )
      .subscribe(() => {
        this.loadingButton = null;
        this.matDialogRef.close();
        callback();
      });
  }
}
