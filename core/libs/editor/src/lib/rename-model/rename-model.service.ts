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

import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {first} from 'rxjs/operators';
import {RenameModelComponent} from './rename-model.component';

@Injectable({providedIn: 'root'})
export class RenameModelDialogService {
  private matDialog = inject(MatDialog);

  open() {
    return this.matDialog.open(RenameModelComponent, {width: '550px'}).afterClosed().pipe(first());
  }
}
