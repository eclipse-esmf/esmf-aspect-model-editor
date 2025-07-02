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

import {ModelApiService} from '@ame/api';
import {LanguageTranslateModule} from '@ame/translation';
import {Component, Inject} from '@angular/core';
import {AbstractControl, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';

import {LoadedFilesService} from '@ame/cache';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {RdfModel} from '@esmf/aspect-model-loader';

@Component({
  standalone: true,
  templateUrl: './rename-model.component.html',
  styles: ['.input-suffix { padding-right: 5px;}'],
  imports: [
    MatIconModule,
    MatDialogModule,
    LanguageTranslateModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
  ],
})
export class RenameModelComponent {
  public fileNameControl: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {namespaces: string; rdfModel: RdfModel},
    private dialogRef: MatDialogRef<RenameModelComponent>,
    private loadedFiles: LoadedFilesService,
    private modelApiService: ModelApiService,
  ) {
    const rdfModel = this.loadedFiles.currentLoadedFile.rdfModel;
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
      },
    );
  }
}
