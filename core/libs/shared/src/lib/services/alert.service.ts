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
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {AlertComponent} from '../components';

export interface AlertOptions {
  title: string;
  content: string;
  leftButtonText: string;
  rightButtonText: string;
  hasLeftButton: boolean;
  hasRightButton: boolean;
  leftButtonAction: Function;
  rightButtonAction: Function;
}

@Injectable({providedIn: 'root'})
export class AlertService {
  constructor(private matDialog: MatDialog) {}

  public open(options: MatDialogConfig<Partial<AlertOptions>>) {
    return this.matDialog.open(AlertComponent, {
      minWidth: '500px',
      maxWidth: '800px',
      disableClose: true,
      ...options,
      data: {
        ...options.data,
        leftButtonText: options.data.leftButtonText || 'Close',
        rightButtonText: options.data.rightButtonText || 'Ok',
      },
    });
  }
}
