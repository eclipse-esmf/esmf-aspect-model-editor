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
import {Component, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {PrefixChangeError, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';

export interface PrefixManagementDialogData {
  rdfModel: RdfModel;
}

export interface PrefixRow {
  alias: string;
  namespace: string;
  used: boolean;
  protected: boolean;
}

/** Shows the prefixes of the current model and lets the user add, rename and remove them. Closes with `true` when something changed. */
@Component({
  selector: 'ame-prefix-management-dialog',
  templateUrl: './prefix-management-dialog.component.html',
  styleUrls: ['./prefix-dialogs.scss'],
  imports: [
    DialogCloseButtonComponent,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    TranslocoDirective,
  ],
})
export class PrefixManagementDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PrefixManagementDialogComponent, boolean>);
  private readonly rdfModel = inject<PrefixManagementDialogData>(MAT_DIALOG_DATA).rdfModel;
  private changed = false;

  /** True when prefixes were changed, also if the dialog is closed with (x) or Escape. */
  get hasChanges(): boolean {
    return this.changed;
  }

  readonly rows = signal<PrefixRow[]>([]);
  readonly editingAlias = signal<string | null>(null);
  readonly editValue = signal('');
  readonly editError = signal<PrefixChangeError | null>(null);
  readonly rowError = signal<{alias: string; error: PrefixChangeError} | null>(null);

  readonly newAlias = signal('');
  readonly newNamespace = signal('');
  readonly addError = signal<PrefixChangeError | null>(null);

  constructor() {
    this.refresh();
  }

  startRename(row: PrefixRow): void {
    this.editingAlias.set(row.alias);
    this.editValue.set(row.alias);
    this.editError.set(null);
    this.rowError.set(null);
  }

  cancelRename(): void {
    this.editingAlias.set(null);
    this.editError.set(null);
  }

  saveRename(): void {
    const oldAlias = this.editingAlias();
    if (oldAlias === null) return;

    const error = this.rdfModel.renamePrefix(oldAlias, this.editValue().trim());
    if (error) {
      this.editError.set(error);
      return;
    }
    this.changed ||= oldAlias !== this.editValue().trim();
    this.cancelRename();
    this.refresh();
  }

  remove(row: PrefixRow): void {
    const error = this.rdfModel.deletePrefix(row.alias);
    if (error) {
      this.rowError.set({alias: row.alias, error});
      return;
    }
    this.changed = true;
    this.rowError.set(null);
    this.refresh();
  }

  add(): void {
    const error = this.rdfModel.definePrefix(this.newAlias().trim(), this.newNamespace().trim());
    if (error) {
      this.addError.set(error);
      return;
    }
    this.changed = true;
    this.newAlias.set('');
    this.newNamespace.set('');
    this.addError.set(null);
    this.refresh();
  }

  onInput(target: 'edit' | 'alias' | 'namespace', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (target === 'edit') {
      this.editValue.set(value);
      this.editError.set(null);
    } else {
      (target === 'alias' ? this.newAlias : this.newNamespace).set(value);
      this.addError.set(null);
    }
  }

  /** (x) and Escape keep the information whether prefixes were changed. */
  requestClose(): void {
    this.close();
  }

  close(): void {
    this.dialogRef.close(this.changed);
  }

  private refresh(): void {
    this.rows.set(
      Object.entries(this.rdfModel.getPrefixes()).map(([alias, namespace]) => ({
        alias,
        namespace: String(namespace),
        used: this.rdfModel.isPrefixUsed(alias),
        protected: this.rdfModel.isProtectedPrefix(alias),
      })),
    );
  }
}
