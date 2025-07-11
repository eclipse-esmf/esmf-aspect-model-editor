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

import {AlertOptions} from '@ame/shared';
import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';

import {MatButtonModule} from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'ame-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  imports: [MatDialogModule, MatButtonModule],
})
export class AlertComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AlertOptions,
    private dialogRef: MatDialogRef<AlertComponent>,
  ) {}

  close(event: MouseEvent) {
    if (this.data.leftButtonAction && typeof this.data.leftButtonAction === 'function') {
      this.data.leftButtonAction(event);
    }
    this.dialogRef.close();
  }

  ok(event: MouseEvent) {
    if (this.data.rightButtonAction && typeof this.data.rightButtonAction === 'function') {
      this.data.rightButtonAction(event);
    }
    this.dialogRef.close();
  }
}
