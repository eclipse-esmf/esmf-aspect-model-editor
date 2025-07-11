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

import {LanguageTranslateModule} from '@ame/translation';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';
import {
  AutomatedWorkflowComponent,
  EditorConfigurationComponent,
  HeaderCopyrightComponent,
  LanguageSettingsComponent,
  NamespaceSettingsComponent,
  SettingDialogComponent,
} from './components';

@NgModule({
  declarations: [
    SettingDialogComponent,
    LanguageSettingsComponent,
    NamespaceSettingsComponent,
    AutomatedWorkflowComponent,
    EditorConfigurationComponent,
    HeaderCopyrightComponent,
  ],
  imports: [
    CommonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
    MatTreeModule,
    MatDividerModule,
    LanguageTranslateModule,
    MatMenuModule,
    MatExpansionModule,
  ],
  exports: [SettingDialogComponent],
})
export class SettingDialogModule {}
