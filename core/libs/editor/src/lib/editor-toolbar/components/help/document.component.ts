/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {APP_CONFIG, AppConfig} from '@ame/shared';
import {Component, Inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'ame-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent {
  AMEDocumentationLink = 'https://eclipse-esmf.github.io/ame-guide/4.3.0/introduction.html';
  SAMMDocumentationLink = 'https://eclipse-esmf.github.io/samm-specification/2.0.0/index.html';

  constructor(private dialogRef: MatDialogRef<DocumentComponent>, @Inject(APP_CONFIG) public config: AppConfig) {
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
