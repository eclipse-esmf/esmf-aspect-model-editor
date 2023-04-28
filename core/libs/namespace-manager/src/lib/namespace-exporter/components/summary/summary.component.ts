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
import {Component, Inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {WorkspaceSummaryComponent, NAMESPACES_SESSION} from '../../../shared';
import {NamespacesSessionInterface, MissingElement} from '../../../shared/models';

@Component({
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class ExportSummaryComponent {
  private readonly packageName = 'namespaces.zip';
  private url: string;
  public missingElements: MissingElement[] = this.importSession.missingElements;

  constructor(
    private modelApiService: ModelApiService,
    private dialogRef: MatDialogRef<WorkspaceSummaryComponent>,
    private notificationService: NotificationsService,
    @Inject(NAMESPACES_SESSION) private importSession: NamespacesSessionInterface
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
        this.notificationService.error({title: 'Namespace export error', message: 'Could not export package due to an internal error'});
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
