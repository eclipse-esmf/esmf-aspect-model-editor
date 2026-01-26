/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {ConfirmDialogEnum} from '../models/confirm-dialog.enum';
import {DialogOptions} from './confirm-dialog.service';

@Component({
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styles: ['.dialog-title { font-size: 24px !important; }'],
  imports: [MatDialogModule, MatIconModule, MatButtonModule],
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  public data: DialogOptions = inject(MAT_DIALOG_DATA);

  public readonly confirmDialogEnum = ConfirmDialogEnum;

  closeAndGiveResult(result: ConfirmDialogEnum) {
    this.dialogRef.close(result);
  }
}
