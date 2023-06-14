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

import {ModelApiService} from '@ame/api';
import {RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {Component, Inject} from '@angular/core';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  templateUrl: './rename-model.component.html',
  styles: ['.dialog-title { font-size: 24px !important; } .close-button {top: -10px}'],
})
export class RenameModelComponent {
  public fileNameControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {namespaces: string; rdfModel: RdfModel},
    private dialogRef: MatDialogRef<RenameModelComponent>,
    private rdfService: RdfService,
    private modelApiService: ModelApiService
  ) {
    const rdfModel = this.rdfService.currentRdfModel;
    this.modelApiService.getNamespacesAppendWithFiles().subscribe(namespaces => {
      namespaces = namespaces.map(namespace => namespace.toLowerCase());
      this.fileNameControl = new FormControl('', [
        Validators.required,
        // eslint-disable-next-line no-useless-escape
        Validators.pattern('[0-9a-zA-Z_. -]+'),
        (control: AbstractControl) => {
          const searchTerm = `${rdfModel.getAspectModelUrn().replace('urn:samm:', '').replace('#', ':')}${control.value}.ttl`.toLowerCase();
          return namespaces.includes(searchTerm) ? {sameFile: true} : null;
        },
      ]);
      this.fileNameControl.markAsTouched();
    });
  }

  closeAndGiveResult(result: boolean) {
    return this.dialogRef.close(
      result && {
        name: this.fileNameControl.value.endsWith('.ttl') ? this.fileNameControl.value : `${this.fileNameControl.value}.ttl`,
      }
    );
  }
}
