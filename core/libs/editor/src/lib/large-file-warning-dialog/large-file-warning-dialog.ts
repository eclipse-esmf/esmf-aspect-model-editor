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

import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  templateUrl: './large-file-warning-dialog.html',
})
export class LargeFileWarningComponent {
  public elementsCount: number;

  constructor(private dialogRef: MatDialogRef<LargeFileWarningComponent>, @Inject(MAT_DIALOG_DATA) private data: {elementsCount: number}) {
    this.elementsCount = data?.elementsCount || 0;
  }

  close(response: 'open' | 'cancel') {
    this.dialogRef.close(response);
  }
}
