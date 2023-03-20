/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {NamespacesCacheService} from '@ame/cache';
import {RdfModel} from '@ame/rdf/utils';

export interface NewNamespaceDialogOptions {
  rdfModel: RdfModel;
  oldNamespace: string;
  newNamespace: string;
  oldVersion: string;
  newVersion: string;
}

@Component({
  templateUrl: './namespace-confirmation-modal.component.html',
  styleUrls: ['./namespace-confirmation-modal.component.scss'],
})
export class NamespaceConfirmationModalComponent {
  oldNamespace: string;
  newNamespace: string;
  oldVersion: string;
  newVersion: string;
  rdfModel: RdfModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: NewNamespaceDialogOptions,
    private namespaceCacheService: NamespacesCacheService,
    private namespaceConfirmationDialogRef: MatDialogRef<NamespaceConfirmationModalComponent>
  ) {
    this.rdfModel = data.rdfModel;
    this.oldNamespace = data.oldNamespace;
    this.newNamespace = data.newNamespace;
    this.oldVersion = data.oldVersion;
    this.newVersion = data.newVersion;
  }

  onClose() {
    this.namespaceConfirmationDialogRef.close(false);
  }

  onSave() {
    if (this.oldNamespace !== this.newNamespace) {
      this.updateAllNamespacesFromCurrentCachedFile(this.oldNamespace, this.newNamespace);
    }

    if (this.oldVersion !== this.newVersion) {
      this.updateAllNamespacesFromCurrentCachedFile(this.oldVersion, this.newVersion);
    }
    this.updateNamespaceKey();
  }

  private updateNamespaceKey(): void {
    const newUrn = 'urn:bamm:' + this.newNamespace + ':' + this.newVersion + '#';
    const oldUrn = 'urn:bamm:' + this.oldNamespace + ':' + this.oldVersion + '#';

    this.namespaceCacheService.updateNamespaceKey(oldUrn, newUrn);
  }

  private updateAllNamespacesFromCurrentCachedFile(oldValue: string, newValue: string): void {
    const currentCachedFile = this.namespaceCacheService.getCurrentCachedFile();

    currentCachedFile.updateCachedElementsNamespace(oldValue, newValue);
    this.rdfModel.updatePrefix('', oldValue, newValue);

    this.namespaceConfirmationDialogRef.close(true);
  }
}
