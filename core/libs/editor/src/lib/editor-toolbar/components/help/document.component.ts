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

import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'ame-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent {
  AMEDocumentationLink = 'http://docs.digital-twin.bosch-nexeed.com/ame-guide/3.0.0/introduction.html'; // NOSONAR
  BAMMDocumentationLink = 'https://openmanufacturingplatform.github.io/sds-bamm-aspect-meta-model/bamm-specification/v1.0.0/index.html';
  supportMail = 'Nexeed.Helpdesk@de.bosch.com';

  constructor(private dialogRef: MatDialogRef<DocumentComponent>) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
