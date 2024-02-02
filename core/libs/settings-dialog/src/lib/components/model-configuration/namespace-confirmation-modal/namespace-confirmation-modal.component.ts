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
    @Inject(MAT_DIALOG_DATA) data: NewNamespaceDialogOptions,
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
    this.rdfModel.updateAbsoluteFileName(this.newNamespace, this.newVersion);

    if (this.oldNamespace !== this.newNamespace) {
      this.updateAllNamespacesFromCurrentCachedFile(this.oldNamespace, this.newNamespace);
    }

    if (this.oldVersion !== this.newVersion) {
      this.updateAllNamespacesFromCurrentCachedFile(this.oldVersion, this.newVersion);
    }

    this.updateNamespaceKey();
    this.namespaceConfirmationDialogRef.close(true);
  }

  private updateNamespaceKey(): void {
    const newUrn = 'urn:samm:' + this.newNamespace + ':' + this.newVersion + '#';
    const oldUrn = 'urn:samm:' + this.oldNamespace + ':' + this.oldVersion + '#';

    this.namespaceCacheService.updateNamespaceKey(oldUrn, newUrn);
    if (this.rdfModel.aspect) {
      const [, aspectName] = this.rdfModel.aspect.value.split('#');
      this.rdfModel.setAspect(`${newUrn}${aspectName}`);
    }
  }

  private updateAllNamespacesFromCurrentCachedFile(oldValue: string, newValue: string): void {
    const currentCachedFile = this.namespaceCacheService.currentCachedFile;

    currentCachedFile.updateCachedElementsNamespace(oldValue, newValue);
    this.rdfModel.updatePrefix('', oldValue, newValue);
  }
}
