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

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {ConnectWithDialogComponent} from './connect-with-dialog.component';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [CommonModule, MatDialogModule, MatInputModule, MatIconModule, FormsModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  declarations: [ConnectWithDialogComponent],
  exports: [ConnectWithDialogComponent],
})
export class ConnectWithDialogModule {}
