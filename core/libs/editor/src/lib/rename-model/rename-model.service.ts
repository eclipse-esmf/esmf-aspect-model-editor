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

import {RdfModel} from '@ame/rdf/utils';
import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {first} from 'rxjs/operators';
import {RenameModelComponent} from './rename-model.component';

@Injectable({providedIn: 'root'})
export class RenameModelDialogService {
  constructor(private matDialog: MatDialog) {}

  open(namespaces: string[], rdfModel: RdfModel) {
    return this.matDialog
      .open(RenameModelComponent, {
        data: {
          namespaces,
          rdfModel,
        },
        width: '550px',
      })
      .afterClosed()
      .pipe(first());
  }
}
