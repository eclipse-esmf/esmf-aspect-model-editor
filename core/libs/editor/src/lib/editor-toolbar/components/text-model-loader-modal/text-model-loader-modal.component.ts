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

import {Component, inject, signal} from '@angular/core';
import {form, FormField, required} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {TranslocoDirective} from '@jsverse/transloco';
import {first} from 'rxjs';
import {FileHandlingService} from '../../services';

export interface TextModelFormData {
  modelText: string;
}

@Component({
  templateUrl: './text-model-loader-modal.component.html',
  styles: [
    `
      :host {
        display: block;
        max-width: 900px;
        min-width: 700px;
      }

      textarea {
        min-height: 300px;
        max-height: 500px;
      }
    `,
  ],
  imports: [TranslocoDirective, MatDialogModule, MatFormFieldModule, MatButtonModule, MatInputModule, MatIcon, FormField],
})
export class TextModelLoaderModalComponent {
  private fileHandlingService = inject(FileHandlingService);
  private matDialogRef = inject(MatDialogRef<TextModelLoaderModalComponent>);

  public modelData = signal<TextModelFormData>({modelText: ''});
  public modelForm = form(this.modelData, schemaPath => {
    required(schemaPath.modelText);
  });

  loadModel(modelText?: string) {
    const textToLoad = modelText ?? this.modelData().modelText;
    this.matDialogRef.close();
    this.fileHandlingService.loadModel(textToLoad).pipe(first()).subscribe();
  }
}
