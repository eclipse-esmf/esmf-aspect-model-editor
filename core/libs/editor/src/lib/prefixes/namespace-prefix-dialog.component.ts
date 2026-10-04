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

import {Component, computed, inject, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {PrefixChangeError, RdfModel} from '@esmf/aspect-model-loader';
import {TranslocoDirective} from '@jsverse/transloco';

export interface NamespacePrefixDialogData {
  rdfModel: RdfModel;
  namespace: string;
  suggestion: string;
  /** The alias the referenced file uses for the namespace. */
  sourceAlias: string | null;
  /** Local name of the referenced element, used for the example. */
  elementName?: string;
}

/** Asks for the prefix of a namespace which is referenced for the first time. Closes with the alias, or nothing to keep the automatic prefix. */
@Component({
  selector: 'ame-namespace-prefix-dialog',
  templateUrl: './namespace-prefix-dialog.component.html',
  styleUrls: ['./prefix-dialogs.scss'],
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, TranslocoDirective],
})
export class NamespacePrefixDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NamespacePrefixDialogComponent, string>);
  readonly data = inject<NamespacePrefixDialogData>(MAT_DIALOG_DATA);

  readonly alias = signal(this.data.suggestion);

  /** The namespace which already uses the alias of the referenced file in the current model. */
  readonly sourceAliasConflict = computed(() => {
    const sourceAlias = this.data.sourceAlias;
    const namespace = sourceAlias ? this.data.rdfModel.getPrefixes()[sourceAlias] : undefined;
    return sourceAlias && namespace && namespace !== this.data.namespace ? {alias: sourceAlias, namespace} : null;
  });

  readonly error = computed<PrefixChangeError | null>(() => {
    const alias = this.alias().trim();
    if (!RdfModel.isValidPrefixAlias(alias) || this.data.rdfModel.isProtectedPrefix(alias)) return 'invalidAlias';
    const namespace = this.data.rdfModel.getPrefixes()[alias];
    return namespace !== undefined && namespace !== this.data.namespace ? 'aliasInUse' : null;
  });

  readonly usedBy = computed(() => (this.error() === 'aliasInUse' ? this.data.rdfModel.getPrefixes()[this.alias().trim()] : null));

  /** How a referenced element is written with the chosen prefix. */
  readonly example = computed(() => `${this.alias().trim()}:${this.data.elementName || 'MyElement'}`);

  onAliasInput(event: Event): void {
    this.alias.set((event.target as HTMLInputElement).value);
  }

  confirm(): void {
    if (!this.error()) {
      this.dialogRef.close(this.alias().trim());
    }
  }

  useAutomaticPrefix(): void {
    this.dialogRef.close();
  }
}
