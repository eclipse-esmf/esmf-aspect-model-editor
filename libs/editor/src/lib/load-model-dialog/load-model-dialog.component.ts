/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */
import {Component, ViewChild} from '@angular/core';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {MatDialogRef} from '@angular/material/dialog';
import {take} from 'rxjs/operators';
import {ModelApiService} from '@bame/api';

@Component({
  selector: 'bci-load-model-dialog',
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
