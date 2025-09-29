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
import {Component, inject, signal} from '@angular/core';
import {AbstractControl, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

import {LoadedFilesService} from '@ame/cache';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RdfModel} from '@esmf/aspect-model-loader';
import {finalize} from 'rxjs/operators';

@Component({
  standalone: true,
  templateUrl: './rename-model.component.html',
  styleUrls: ['./rename-model.component.scss'],
  imports: [
    MatIconModule,
    MatDialogModule,
    TranslatePipe,
    ReactiveFormsModule,
    MatInputModule,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinner,
  ],
})
export class RenameModelComponent {
  private dialogRef = inject(MatDialogRef<RenameModelComponent>);
  private loadedFiles = inject(LoadedFilesService);
  private modelApiService = inject(ModelApiService);

  public data = inject(MAT_DIALOG_DATA) as {namespaces: string; rdfModel: RdfModel};

  public fileNameControl: FormControl;

  public loading = signal(true);

  constructor() {
    this.loading.set(true);
    this.modelApiService
      .fetchAllNamespaceFilesContent()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(files => {
        const namespaces = this.buildNamespaceMap(files);
        this.fileNameControl = this.createFileNameControl(namespaces);
        this.fileNameControl.markAsTouched();
      });
  }

  private buildNamespaceMap(files: any[]): Record<string, boolean> {
    return files.reduce(
      (acc, {aspectModelUrn, name}) => {
        const [namespace] = aspectModelUrn.replace('urn:samm:', '').split('#');
        acc[`${namespace}:${name}`] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  private createFileNameControl(namespaces: Record<string, boolean>): FormControl {
    return new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9a-zA-Z_. -]+'),
      (control: AbstractControl) => {
        const searchTerm = `${this.loadedFiles.currentLoadedFile.namespace}:${control.value}.ttl`.toLowerCase();
        return namespaces[searchTerm] ? {sameFile: true} : null;
      },
      (control: AbstractControl) => {
        const fileName = control.value;
        if (this.loadedFiles.files[`${this.loadedFiles.currentLoadedFile.originalNamespace}:${fileName}.ttl`]) {
          return {fileExists: true};
        }
        return null;
      },
    ]);
  }

  closeAndGiveResult(result: boolean) {
    return this.dialogRef.close(
      result && {
        name: this.fileNameControl.value.endsWith('.ttl') ? this.fileNameControl.value : `${this.fileNameControl.value}.ttl`,
      },
    );
  }
}
