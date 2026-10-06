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

import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {LargeFileWarningComponent} from './large-file-warning-dialog';

@Injectable({providedIn: 'root'})
export class LargeFileWarningService {
  private matDialog = inject(MatDialog);

  openDialog(elementsCount: number): Observable<'open' | 'cancel' | 'ignore'> {
    if (elementsCount <= 99) return of('ignore');

    // A dialog closed without an explicit answer must never load the large model.
    return this.matDialog
      .open<LargeFileWarningComponent, {elementsCount: number}, 'open' | 'cancel'>(LargeFileWarningComponent, {data: {elementsCount}})
      .afterClosed()
      .pipe(map(response => response ?? 'cancel'));
  }
}
