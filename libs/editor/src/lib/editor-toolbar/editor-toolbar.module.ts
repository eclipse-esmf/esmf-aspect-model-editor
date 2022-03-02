/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BciComponentModule, BciSharedModule} from '@bci-web-core/core';
import {EditorToolbarComponent} from './editor-toolbar.component';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {LoadModelDialogModule} from '../load-model-dialog';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {WorkspaceSummaryComponent, ExportWorkspaceComponent, SearchBarComponent, ZipUploaderComponent} from './components';
import {FormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatRadioModule} from '@angular/material/radio';
import {MatTreeModule} from '@angular/material/tree';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    BciSharedModule,
    MatIconModule,
    LoadModelDialogModule,
    MatMenuModule,
    MatCheckboxModule,
    MatRadioModule,
    BciComponentModule,
    MatExpansionModule,
    MatListModule,
    MatTooltipModule,
    MatTreeModule,
    MatAutocompleteModule,
    FormsModule,
    MatButtonToggleModule,
  ],
  declarations: [EditorToolbarComponent, ExportWorkspaceComponent, WorkspaceSummaryComponent, SearchBarComponent, ZipUploaderComponent],
  exports: [EditorToolbarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditorToolbarModule {}
