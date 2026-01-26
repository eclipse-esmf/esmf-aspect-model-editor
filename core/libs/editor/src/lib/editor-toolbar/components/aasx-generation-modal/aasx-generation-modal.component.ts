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
import {LoadedFilesService} from '@ame/cache';
import {RdfService} from '@ame/rdf/services';
import {Component, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatOptionModule} from '@angular/material/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {saveAs} from 'file-saver';
import {finalize, first, tap} from 'rxjs';

@Component({
  standalone: true,
  templateUrl: 'aasx-generation-modal.component.html',
  styleUrls: ['aasx-generation-modal.component.scss'],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatIcon,
    TranslatePipe,
  ],
})
export class AASXGenerationModalComponent {
  private destroyRef = inject(DestroyRef);
  private modelApiService = inject(ModelApiService);
  private rdfService = inject(RdfService);
  private dialogRef = inject(MatDialogRef<AssignedNodesOptions>);
  private loadedFilesService = inject(LoadedFilesService);

  control = new FormControl('aasx');
  isGenerating = false;

  generate() {
    this.isGenerating = true;
    const currentFile = this.loadedFilesService.currentLoadedFile;
    const rdfModel = this.rdfService.serializeModel(currentFile.rdfModel);
    const assx =
      this.control.value === 'aasx' ? this.modelApiService.generateAASX(rdfModel) : this.modelApiService.generatetAASasXML(rdfModel);

    assx
      .pipe(
        takeUntilDestroyed(this.destroyRef),
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
