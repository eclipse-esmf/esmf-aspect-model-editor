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

import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {first} from 'rxjs/operators';
import {ConfirmDialogComponent} from './confirm-dialog.component';
import {Observable} from 'rxjs';

export interface DialogOptions {
  phrases: string[];
  title: string;
  closeButtonText?: string;
  okButtonText?: string;
}

@Injectable({providedIn: 'root'})
export class ConfirmDialogService {
  constructor(private matDialog: MatDialog) {}

  open({phrases, title, closeButtonText, okButtonText}: DialogOptions): Observable<boolean> {
    return this.matDialog
      .open(ConfirmDialogComponent, {
        data: {
          phrases,
          title,
          closeButtonText: closeButtonText || 'Close',
          okButtonText: okButtonText || 'Continue',
        },
        maxWidth: 650,
        minWidth: 550,
      })
      .afterClosed()
      .pipe(first());
  }
}
