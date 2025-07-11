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

import {LanguageTranslateModule} from '@ame/translation';
import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {first} from 'rxjs';
import {FileHandlingService} from '../../services';

@Component({
  standalone: true,
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
  imports: [LanguageTranslateModule, MatDialogModule, MatFormFieldModule, MatButtonModule, MatInputModule, MatIcon],
})
export class TextModelLoaderModalComponent {
  constructor(
    private fileHandlingService: FileHandlingService,
    private matDialogRef: MatDialogRef<TextModelLoaderModalComponent>,
  ) {}

  loadModel(modelText: string) {
    this.matDialogRef.close();
    this.fileHandlingService.loadModel(modelText).pipe(first()).subscribe();
  }
}
