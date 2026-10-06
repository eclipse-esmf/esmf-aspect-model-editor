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

import {ReferenceReport} from '@ame/domain';
import {DialogCloseButtonComponent} from '@ame/shared';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {TranslocoDirective} from '@jsverse/transloco';

export interface ReferencesDialogData {
  kind: 'file' | 'namespace';
  /** File name or namespace key of what should have been deleted. */
  name: string;
  report: ReferenceReport;
}

/** Explains why a file or namespace cannot be deleted: other files still use it or could not be checked. */
@Component({
  selector: 'ame-references-dialog',
  templateUrl: './references-dialog.component.html',
  styleUrls: ['./references-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogCloseButtonComponent,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatIcon,
    TranslocoDirective,
  ],
})
export class ReferencesDialogComponent {
  public readonly data: ReferencesDialogData = inject(MAT_DIALOG_DATA);

  /** `urn:samm:org.example:1.0.0#property` -> `org.example:1.0.0#property` */
  public shortUrn(urn: string): string {
    return urn.replace(/^urn:samm:/, '');
  }
}
