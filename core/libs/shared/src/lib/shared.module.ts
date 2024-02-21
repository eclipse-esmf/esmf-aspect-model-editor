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

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlertComponent, LoadingScreenComponent, ElementIconComponent} from './components';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {LanguageTranslateModule} from '@ame/translation';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BarItemComponent} from './components/bar-item/bar-item.component';

@NgModule({
  declarations: [LoadingScreenComponent, AlertComponent, ElementIconComponent, BarItemComponent],
  imports: [CommonModule, MatDialogModule, MatProgressBarModule, MatButtonModule, MatTooltipModule, LanguageTranslateModule],
  exports: [ElementIconComponent, BarItemComponent],
})
export class SharedModule {}
