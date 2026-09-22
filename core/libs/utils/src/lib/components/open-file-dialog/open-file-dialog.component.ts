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

import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {TranslocoDirective} from '@jsverse/transloco';

export interface OpenFileDialogData {
  file: string;
  namespace: string;
}

export type OpenFileDialogResult = 'open-in' | 'open-tab' | 'open-out';

@Component({
  selector: 'ame-open-file-dialog',
  templateUrl: './open-file-dialog.component.html',
  imports: [MatDialogModule, MatButtonModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        --mat-dialog-supporting-text-color: rgba(0, 0, 0, 0.8);
      }
    `,
  ],
})
export class OpenFileDialogComponent {
  public readonly fileData = inject<OpenFileDialogData>(MAT_DIALOG_DATA);
}
