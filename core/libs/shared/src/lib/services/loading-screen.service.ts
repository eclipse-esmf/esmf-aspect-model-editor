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
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {LoadingScreenComponent} from '../components';

export type LoadingScreenOptions = Omit<MatDialogConfig, 'data'> & {
  title?: string;
  content?: string;
  hasCloseButton?: boolean;
  closeButtonAction?: Function;
};

@Injectable({providedIn: 'root'})
export class LoadingScreenService {
  public dialog: MatDialogRef<LoadingScreenComponent>;

  constructor(private matDialog: MatDialog) {}

  open(options: LoadingScreenOptions): MatDialogRef<LoadingScreenComponent> {
    this.dialog = this.matDialog.open(LoadingScreenComponent, {
      data: options,
      disableClose: true,
    });
    return this.dialog;
  }

  close() {
    this.dialog?.close();
    this.dialog = null;
  }
}
