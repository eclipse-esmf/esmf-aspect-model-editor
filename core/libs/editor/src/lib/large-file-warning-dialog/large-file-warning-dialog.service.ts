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

import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {LargeFileWarningComponent} from './large-file-warning-dialog';

@Injectable({providedIn: 'root'})
export class LargeFileWarningService {
  constructor(private matDialog: MatDialog) {}

  openDialog(elementsCount: number): Observable<'open' | 'cancel' | 'ignore'> {
    return elementsCount > 99 ? this.matDialog.open(LargeFileWarningComponent, {data: {elementsCount}}).afterClosed() : of('ignore');
  }
}
