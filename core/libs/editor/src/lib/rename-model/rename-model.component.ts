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

import {RdfModel} from '@ame/rdf/utils';
import {Component, Inject} from '@angular/core';
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  templateUrl: './rename-model.component.html',
  styles: ['.dialog-title { font-size: 24px !important; } .close-button {top: -10px}'],
})
export class RenameModelComponent {
  public fileNameControl = new FormControl('', [
    Validators.required,
    (control: AbstractControl) => {
      return this.data.namespaces.includes(
        `${this.data.rdfModel.getAspectModelUrn().replace('urn:bamm:', '').replace('#', ':')}${control.value}`
      )
        ? {sameFile: true}
        : null;
    },
  ]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {namespaces: string; rdfModel: RdfModel},
    private dialogRef: MatDialogRef<RenameModelComponent>
  ) {}

  closeAndGiveResult(result: boolean) {
    return this.dialogRef.close(
      result && {
        name: this.fileNameControl.value.endsWith('.ttl') ? this.fileNameControl.value : `${this.fileNameControl.value}.ttl`,
      }
    );
  }
}
