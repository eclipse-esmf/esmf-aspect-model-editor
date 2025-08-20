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
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {ConfirmDialogEnum} from '../models/confirm-dialog.enum';
import {ConfirmDialogComponent} from './confirm-dialog.component';

export interface DialogOptions {
  phrases: string[];
  title: string;
  closeButtonText?: string;
  okButtonText?: string;
  actionButtonText?: string;
}

@Injectable({providedIn: 'root'})
export class ConfirmDialogService {
  constructor(private matDialog: MatDialog) {}

  open({phrases, title, closeButtonText, okButtonText, actionButtonText}: DialogOptions): Observable<ConfirmDialogEnum> {
    return this.matDialog
      .open(ConfirmDialogComponent, {
        data: {
          phrases,
          title,
          closeButtonText: closeButtonText || 'Close',
          actionButtonText: actionButtonText || undefined,
          okButtonText: okButtonText || 'Continue',
        },
        maxWidth: 650,
        minWidth: 550,
      })
      .afterClosed()
      .pipe(first());
  }
}
