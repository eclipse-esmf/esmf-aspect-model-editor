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
import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';

@Component({
  standalone: true,
  templateUrl: './large-file-warning-dialog.html',
  imports: [MatDialogModule, MatButtonModule],
})
export class LargeFileWarningComponent {
  private loadedFilesService = inject(LoadedFilesService);
  private dialogRef = inject(MatDialogRef<LargeFileWarningComponent>);
  private data = inject<{elementsCount: number}>(MAT_DIALOG_DATA);

  public elementsCount: number;

  constructor() {
    this.elementsCount = this.data?.elementsCount || 0;
  }

  close(response: 'open' | 'cancel') {
    if (response === 'cancel') this.loadedFilesService.currentLoadedFile.cachedFile.reset();
    this.dialogRef.close(response);
  }
}
