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

import {Injectable, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SaveModelDialogComponent} from './save-model-dialog.component';

@Injectable({providedIn: 'root'})
export class SaveModelDialogService {
  private matDialog = inject(MatDialog);

  openDialog() {
    return this.matDialog.open(SaveModelDialogComponent).afterClosed();
  }
}
