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

import {LoadedFilesService} from '@ame/cache';
import {Component, inject, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';

@Component({
  standalone: true,
  templateUrl: './large-file-warning-dialog.html',
  imports: [MatDialogModule, MatButtonModule],
})
export class LargeFileWarningComponent {
  private loadedFiles = inject(LoadedFilesService);
  public elementsCount: number;

  constructor(
    private dialogRef: MatDialogRef<LargeFileWarningComponent>,
    @Inject(MAT_DIALOG_DATA) private data: {elementsCount: number},
  ) {
    this.elementsCount = this.data?.elementsCount || 0;
  }

  close(response: 'open' | 'cancel') {
    if (response === 'cancel') this.loadedFiles.currentLoadedFile.cachedFile.reset();
    this.dialogRef.close(response);
  }
}
