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
import {ModelService, RdfService} from '@ame/rdf/services';
import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {finalize, first, tap} from 'rxjs';
import {saveAs} from 'file-saver';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {LanguageTranslateModule} from '@ame/translation';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';

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
    CommonModule,
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
  ) {}

  generate() {
    this.isGenerating = true;
    const loadedAspectModel = this.modelService.getLoadedAspectModel();
    const rdfModel = this.rdfService.serializeModel(loadedAspectModel.rdfModel);
    const assx = this.control.value === 'aasx' ? this.modelApiService.getAASX(rdfModel) : this.modelApiService.getAASasXML(rdfModel);

    assx
      .pipe(
        first(),
        tap(content => {
          const file = new Blob([content], {type: this.control.value === 'aasx' ? 'text/aasx' : 'text/xml'});
          let fileName = !loadedAspectModel.aspect ? this.modelService.currentCachedFile.fileName : `${loadedAspectModel.aspect.name}`;

          fileName = `${fileName}${this.control.value === 'aasx' ? '.aasx' : '-aas.xml'}`;
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
