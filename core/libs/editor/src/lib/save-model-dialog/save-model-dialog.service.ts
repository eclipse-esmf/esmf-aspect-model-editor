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

import {inject, Injectable, NgZone} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SaveModelDialogComponent} from './save-model-dialog.component';

@Injectable({providedIn: 'root'})
export class SaveModelDialogService {
  private matDialog = inject(MatDialog);

  constructor(private ngZone: NgZone) {}

  openDialog() {
    return this.ngZone.run(() => this.matDialog.open(SaveModelDialogComponent).afterClosed());
  }
}
