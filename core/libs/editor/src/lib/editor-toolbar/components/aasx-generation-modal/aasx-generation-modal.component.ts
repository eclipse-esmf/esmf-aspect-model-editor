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
import {FormControl} from '@angular/forms';
import {finalize, first, map, switchMap, tap} from 'rxjs';
import {saveAs} from 'file-saver';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  templateUrl: 'aasx-generation-modal.component.html',
  styleUrls: ['aasx-generation-modal.component.scss'],
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
    this.modelService
      .synchronizeModelToRdf()
      .pipe(
        first(),
        map(() => this.rdfService.serializeModel(loadedAspectModel.rdfModel)),
        switchMap(rdfModel =>
          this.control.value === 'aasx' ? this.modelApiService.getAASX(rdfModel) : this.modelApiService.getAASasXML(rdfModel),
        ),
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
