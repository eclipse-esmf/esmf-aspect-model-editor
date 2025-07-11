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

import {LoadingScreenOptions} from '@ame/shared';
import {LanguageTranslateModule} from '@ame/translation';
import {Component, Inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  standalone: true,
  selector: 'ame-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss'],
  imports: [MatProgressBarModule, MatDialogModule, LanguageTranslateModule, MatButtonModule],
})
export class LoadingScreenComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LoadingScreenOptions,
    private dialog: MatDialogRef<LoadingScreenComponent>,
  ) {}

  close() {
    if (typeof this.data.closeButtonAction === 'function') {
      this.data.closeButtonAction();
    }

    this.dialog.close();
  }
}
