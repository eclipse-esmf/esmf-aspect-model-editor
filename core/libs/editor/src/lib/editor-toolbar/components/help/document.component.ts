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

import {APP_CONFIG, AppConfig} from '@ame/shared';
import {Component, Inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'ame-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent {
  AMEDocumentationLink = 'https://openmanufacturingplatform.github.io/sds-documentation/ame-guide/4.0.2/introduction.html';
  BAMMDocumentationLink = 'https://openmanufacturingplatform.github.io/sds-documentation/bamm-specification/v1.0.0/index.html';

  constructor(private dialogRef: MatDialogRef<DocumentComponent>, @Inject(APP_CONFIG) public config: AppConfig) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
