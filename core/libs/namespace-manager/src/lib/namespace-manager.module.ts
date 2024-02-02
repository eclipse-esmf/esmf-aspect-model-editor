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
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ErrorComponent} from './shared/components/error/error.component';
import {
  FileConflictComponent,
  RootNamespacesImporterComponent,
  ImportSummaryComponent,
  ImportValidateComponent,
} from './namespace-importer/components';
import {ClipboardCopyButtonComponent, WorkspaceSummaryComponent} from './shared/components';
import {NamespaceImporterRouterModule} from './namespace-importer';
import {NamespaceExporterRouterModule} from './namespace-exporter';
import {NamespacesManagerService} from './shared';
import {MatButtonModule} from '@angular/material/button';
import {
  ExportSummaryComponent,
  ExportValidateComponent,
  RootExportNamespacesComponent,
  SelectNamespacesComponent,
} from './namespace-exporter/components';
import {MatTreeModule} from '@angular/material/tree';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {LanguageTranslateModule} from '@ame/translation';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatListModule,
    MatTooltipModule,
    MatButtonModule,
    NamespaceImporterRouterModule,
    NamespaceExporterRouterModule,
    MatTreeModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
    LanguageTranslateModule,
  ],
  declarations: [
    ImportSummaryComponent,
    ImportValidateComponent,
    ExportValidateComponent,
    ExportSummaryComponent,
    ErrorComponent,
    FileConflictComponent,
    WorkspaceSummaryComponent,
    RootNamespacesImporterComponent,
    RootExportNamespacesComponent,
    SelectNamespacesComponent,
    ClipboardCopyButtonComponent,
  ],
  providers: [NamespacesManagerService],
})
export class NamespaceManagerModule {}
