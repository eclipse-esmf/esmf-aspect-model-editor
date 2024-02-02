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
import {LoadingScreenOptions} from './loading-screen.service';

@Component({
  selector: 'ame-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss'],
})
export class LoadingScreenComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: LoadingScreenOptions, private dialog: MatDialogRef<LoadingScreenComponent>) {}

  close() {
    if (typeof this.data.closeButtonAction === 'function') {
      this.data.closeButtonAction();
    }

    this.dialog.close();
  }
}
