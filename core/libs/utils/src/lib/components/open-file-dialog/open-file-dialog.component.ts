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

import {DIALOG_DATA} from '@angular/cdk/dialog';
import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  templateUrl: './open-file-dialog.component.html',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  styles: [
    `
      :host {
        --mat-dialog-supporting-text-color: rgba(0, 0, 0, 0.8);
      }
    `,
  ],
})
export class OpenFileDialogComponent {
  public fileData = inject(DIALOG_DATA) as {file: string; namespace: string};
}
