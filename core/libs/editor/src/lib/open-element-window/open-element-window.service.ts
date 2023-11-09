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

import {BaseMetaModelElement} from '@ame/meta-model';
import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {OpenElementWindowComponent} from './open-element-window.component';

@Injectable({providedIn: 'root'})
export class OpenReferencedElementService {
  constructor(private matDialog: MatDialog) {}

  openReferencedElement(element: BaseMetaModelElement) {
    if (!element) {
      // error notification
      return;
    }

    this.matDialog.open(OpenElementWindowComponent, {data: {file: element.fileName, urn: element.aspectModelUrn}});
  }
}
