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

import {ModelApiService} from '@ame/api';
import {Component, inject, signal} from '@angular/core';
import {form, FormField, pattern, required, validate} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {TranslocoDirective} from '@jsverse/transloco';

import {LoadedFilesService} from '@ame/cache';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {RdfModel} from '@esmf/aspect-model-loader';
import {finalize} from 'rxjs/operators';

export interface RenameModelFormData {
  fileName: string;
}

@Component({
  templateUrl: './rename-model.component.html',
  styleUrls: ['./rename-model.component.scss'],
  imports: [
    MatIconModule,
    MatDialogModule,
    TranslocoDirective,
    FormField,
    MatInputModule,
    MatDialogActions,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinner,
  ],
})
export class RenameModelComponent {
  private dialogRef = inject(MatDialogRef<RenameModelComponent>);
  private loadedFilesService = inject(LoadedFilesService);
  private modelApiService = inject(ModelApiService);

  public data = inject(MAT_DIALOG_DATA) as {namespaces: string; rdfModel: RdfModel};

  public renameModel = signal<RenameModelFormData>({fileName: ''});
  private namespaceMap = signal<Record<string, boolean>>({});

  public renameForm = form(this.renameModel, schemaPath => {
    required(schemaPath.fileName);
    pattern(schemaPath.fileName, /^[0-9a-zA-Z_. -]+$/);
    validate(schemaPath.fileName, ({value}) => {
      const fileName = value();
      if (!fileName) {
        return null;
      }
      const currentLoadedFile = this.loadedFilesService.currentLoadedFile;
      const searchTerm = `${currentLoadedFile?.namespace}:${fileName}.ttl`.toLowerCase();
      if (this.namespaceMap()[searchTerm]) {
        return {kind: 'sameFile', message: 'File exists in namespace'};
      }
      if (this.loadedFilesService.files[`${currentLoadedFile?.originalNamespace}:${fileName}.ttl`]) {
        return {kind: 'fileExists', message: 'File already defined'};
      }
      return null;
    });
  });

  public loading = signal(true);

  constructor() {
    this.loading.set(true);
    this.modelApiService
      .fetchAllNamespaceFilesContent()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(files => {
        const namespaces = this.buildNamespaceMap(files);
        this.namespaceMap.set(namespaces);
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

  closeAndGiveResult(result: boolean) {
    this.loadedFilesService.currentLoadedFile.originalAspectModelUrn = this.loadedFilesService.currentLoadedFile.aspect.getAspectModelUrn();
    const fileName = this.renameModel().fileName;
    return this.dialogRef.close(
      result && {
        name: fileName.endsWith('.ttl') ? fileName : `${fileName}.ttl`,
      },
    );
  }
}
