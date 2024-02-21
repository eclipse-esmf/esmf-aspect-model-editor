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
import {EditorCanvasComponent} from './editor-canvas.component';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {EditorDialogModule, EditorToolbarModule} from '@ame/editor';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CounterPipe} from '@ame/shared';
import {CdkDrag, CdkDragHandle} from '@angular/cdk/drag-drop';
import {LanguageTranslateModule} from '@ame/translation';
import {SidebarModule} from '@ame/sidebar';
import {ElementsSearchComponent, FilesSearchComponent} from '@ame/utils';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    EditorToolbarModule,
    EditorDialogModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    CounterPipe,
    CdkDrag,
    CdkDragHandle,
    LanguageTranslateModule,
    SidebarModule,
    ElementsSearchComponent,
    FilesSearchComponent,
  ],
  declarations: [EditorCanvasComponent],
  exports: [EditorCanvasComponent],
})
export class EditorCanvasModule {}
