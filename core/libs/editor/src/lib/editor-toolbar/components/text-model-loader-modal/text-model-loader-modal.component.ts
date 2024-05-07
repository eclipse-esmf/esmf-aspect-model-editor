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

import {Component} from '@angular/core';
import {FileHandlingService} from '../../services';
import {first} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';

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
})
export class TextModelLoaderModalComponent {
  constructor(private fileHandlingService: FileHandlingService, private matDialogRef: MatDialogRef<TextModelLoaderModalComponent>) {}

  loadModel(modelText: string) {
    this.matDialogRef.close();
    this.fileHandlingService.loadModel(modelText).pipe(first()).subscribe();
  }
}
