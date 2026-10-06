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

import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {TranslocoService} from '@jsverse/transloco';
import {requestDialogClose} from '../../dialog-close';

/**
 * The (x) button in the top right corner of a dialog. It closes the dialog the same way the Escape key does,
 * i.e. through the dialog's `requestClose()` handler if it implements one.
 */
// TranslocoService is provided in root but needs a configured transpiler; isolated tests often lack it.
function injectTranslocoSafely(): TranslocoService | null {
  try {
    return inject(TranslocoService);
  } catch {
    return null;
  }
}

@Component({
  selector: 'ame-dialog-close-button',
  imports: [MatIconButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {style: 'display: contents'},
  template: `
    <button
      class="close-button"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      [disabled]="disabled()"
      [attr.data-testid]="testId()"
      (click)="close()"
      mat-icon-button
      type="button"
      tabindex="-1"
    >
      <mat-icon>close</mat-icon>
    </button>
  `,
})
export class DialogCloseButtonComponent {
  private readonly dialogRef = inject(MatDialogRef, {optional: true});
  private readonly transloco = injectTranslocoSafely();

  readonly disabled = input(false);
  /** Kept configurable so existing test ids of dialogs stay stable. */
  readonly testId = input('dialog-close-button');

  label(): string {
    const translated = this.transloco?.translate('dialog.close');
    return translated && translated !== 'dialog.close' ? translated : 'Close';
  }

  close(): void {
    if (this.dialogRef) requestDialogClose(this.dialogRef);
  }
}
