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

import {ConfirmDialogEnum, DialogOptions, IConfirmDialogService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';
import {ConfirmDialogComponent} from './confirm-dialog.component';

export {DialogOptions, IConfirmDialogService};

@Injectable({providedIn: 'root'})
export class ConfirmDialogService implements IConfirmDialogService {
  private matDialog = inject(MatDialog);

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
