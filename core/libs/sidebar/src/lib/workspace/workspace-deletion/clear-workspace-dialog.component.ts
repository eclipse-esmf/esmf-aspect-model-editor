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

import {DialogCloseButtonComponent} from '@ame/shared';
import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {TranslocoDirective} from '@jsverse/transloco';

export interface ClearWorkspaceDialogData {
  fileCount: number;
}

export interface ClearWorkspaceDialogResult {
  backup: boolean;
}

/** The word to type to confirm. Not translated, so it is the same in every language and in the documentation. */
export const CLEAR_WORKSPACE_CONFIRM_WORD = 'CLEAR';

/** Asks for a typed confirmation before all Aspect Models of the workspace are deleted. */
@Component({
  selector: 'ame-clear-workspace-dialog',
  templateUrl: './clear-workspace-dialog.component.html',
  styleUrls: ['./clear-workspace-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogCloseButtonComponent,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    TranslocoDirective,
  ],
})
export class ClearWorkspaceDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ClearWorkspaceDialogComponent, ClearWorkspaceDialogResult>>(MatDialogRef);
  public readonly data: ClearWorkspaceDialogData = inject(MAT_DIALOG_DATA);

  public readonly confirmWord = CLEAR_WORKSPACE_CONFIRM_WORD;
  public readonly backup = signal(true);
  public readonly typed = signal('');
  public readonly confirmed = computed(() => this.typed().trim() === this.confirmWord);

  public cancel(): void {
    this.dialogRef.close();
  }

  public clear(): void {
    if (this.confirmed()) {
      this.dialogRef.close({backup: this.backup()});
    }
  }
}
