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
import {LoadedFilesService} from '@ame/cache';
import {ModelService, RdfService} from '@ame/rdf/services';
import {LanguageTranslateModule} from '@ame/translation';
import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {saveAs} from 'file-saver';
import {finalize, first, tap} from 'rxjs';

@Component({
  standalone: true,
  templateUrl: 'aasx-generation-modal.component.html',
  styleUrls: ['aasx-generation-modal.component.scss'],
  imports: [
    MatDialogModule,
    LanguageTranslateModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatIcon,
  ],
})
export class AASXGenerationModalComponent {
  control = new FormControl('aasx');
  isGenerating = false;

  constructor(
    private modelApiService: ModelApiService,
    private modelService: ModelService,
    private rdfService: RdfService,
    private dialogRef: MatDialogRef<AssignedNodesOptions>,
    private loadedFilesService: LoadedFilesService,
  ) {}

  generate() {
    this.isGenerating = true;
    const currentFile = this.loadedFilesService.currentLoadedFile;
    const rdfModel = this.rdfService.serializeModel(currentFile.rdfModel);
    const assx = this.control.value === 'aasx' ? this.modelApiService.getAASX(rdfModel) : this.modelApiService.getAASasXML(rdfModel);

    assx
      .pipe(
        first(),
        tap(content => {
          const file = new Blob([content], {type: this.control.value === 'aasx' ? 'text/aasx' : 'text/xml'});

          const fileName = `${currentFile.name}${this.control.value === 'aasx' ? '.aasx' : '-aas.xml'}`;
          saveAs(file, fileName);
        }),
        finalize(() => {
          this.isGenerating = false;
          this.dialogRef.close();
        }),
      )
      .subscribe();
  }
}
