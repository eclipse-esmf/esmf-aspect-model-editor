/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {Component, ViewChild} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatDialogRef} from '@angular/material/dialog';
import {take} from 'rxjs/operators';
import {ModelApiService} from '@ame/api';

@Component({
  selector: 'ame-load-model-dialog',
  templateUrl: './load-model-dialog.component.html',
  styleUrls: ['./load-model-dialog.component.scss'],
})
export class LoadModelDialogComponent {
  rdfAspectModel: string;

  // Property decorator that configures a view query.
  // The change detector looks for the first element or the directive matching the selector in the view DOM.
  // If the view DOM changes, and a new child matches the selector, the property is updated
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(private dialogRef: MatDialogRef<LoadModelDialogComponent>, private modelApiService: ModelApiService) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onOk() {
    this.dialogRef.close(this.rdfAspectModel);
  }

  onLoadDefault() {
    this.modelApiService
      .getDefaultAspectModel()
      .pipe(take(1))
      .subscribe((aspectModel: string) => {
        this.rdfAspectModel = aspectModel;
      });
  }

  onLoadMovementExample() {
    this.modelApiService
      .getMovementAspectModel()
      .pipe(take(1))
      .subscribe((aspectModel: string) => {
        this.rdfAspectModel = aspectModel;
      });
  }

  onLoadFromFile(event) {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);

    reader.onload = () => (this.rdfAspectModel = reader.result.toString());
  }
}
