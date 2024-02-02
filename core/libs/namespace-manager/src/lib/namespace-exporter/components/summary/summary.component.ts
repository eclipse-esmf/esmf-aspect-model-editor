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

import {ModelApiService} from '@ame/api';
import {NotificationsService} from '@ame/shared';
import {Component, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {NAMESPACES_SESSION, WorkspaceSummaryComponent} from '../../../shared';
import {MissingElement, NamespacesSessionInterface} from '../../../shared/models';
import {LanguageTranslationService} from '@ame/translation';

@Component({
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class ExportSummaryComponent {
  private readonly packageName = 'namespaces.zip';
  private importSession: NamespacesSessionInterface = inject(NAMESPACES_SESSION);
  private url: string;

  public missingElements: MissingElement[] = this.importSession.missingElements;

  constructor(
    private modelApiService: ModelApiService,
    private dialogRef: MatDialogRef<WorkspaceSummaryComponent>,
    private notificationService: NotificationsService,
    private translate: LanguageTranslationService
  ) {}

  export() {
    if (this.url) {
      this.downloadFile(this.url);
      return;
    }

    this.modelApiService.getExportZipFile().subscribe({
      next: response => {
        this.url = URL.createObjectURL(response);
        this.downloadFile(this.url);
        this.dialogRef.close();
      },
      error: () => {
        this.notificationService.error({
          title: this.translate.language.NOTIFICATION_SERVICE.NAMESPACE_EXPORT_FAILURE,
          message: this.translate.language.NOTIFICATION_SERVICE.INTERNAL_EXPORT_ERROR,
        });
      },
    });
  }

  private downloadFile(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = this.packageName;
    a.click();
  }
}
