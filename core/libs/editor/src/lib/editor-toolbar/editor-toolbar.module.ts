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

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorToolbarComponent} from './editor-toolbar.component';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
  AASXGenerationModalComponent,
  DocumentComponent,
  GenerateOpenApiComponent,
  LanguageSelectorModalComponent,
  TextModelLoaderModalComponent,
  ThemeSwitcherComponent,
} from './components';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import {MatTreeModule} from '@angular/material/tree';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {NotificationsComponent} from './components/notifications/notifications.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatInputModule} from '@angular/material/input';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {GenerateDocumentationComponent} from './components/generate-documentation/generate-documentation.component';
import {ConnectWithDialogModule} from '../connect-with-dialog/connect-with-dialog.module';
import {MatSelectModule} from '@angular/material/select';
import {NamespaceManagerModule} from '@ame/namespace-manager';
import {OpenElementWindowComponent} from '../open-element-window/open-element-window.component';
import {LanguageTranslateModule} from '@ame/translation';
import {SharedModule} from '@ame/shared';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatIconModule,
    ConnectWithDialogModule,
    MatMenuModule,
    MatCheckboxModule,
    MatRadioModule,
    MatExpansionModule,
    MatListModule,
    MatTooltipModule,
    MatTreeModule,
    MatAutocompleteModule,
    FormsModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatTableModule,
    MatToolbarModule,
    MatInputModule,
    MatBadgeModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatSelectModule,
    NamespaceManagerModule,
    LanguageTranslateModule,
    SharedModule,
  ],
  declarations: [
    EditorToolbarComponent,
    DocumentComponent,
    NotificationsComponent,
    ThemeSwitcherComponent,
    GenerateOpenApiComponent,
    GenerateDocumentationComponent,
    LanguageSelectorModalComponent,
    OpenElementWindowComponent,
    AASXGenerationModalComponent,
    TextModelLoaderModalComponent,
  ],
  exports: [EditorToolbarComponent, ThemeSwitcherComponent, TextModelLoaderModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditorToolbarModule {}
