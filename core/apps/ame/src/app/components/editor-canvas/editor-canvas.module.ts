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
import {EditorCanvasComponent} from './editor-canvas.component';
import {EditorCanvasMenuComponent} from './editor-canvas-menu.component';
import {MatIconModule} from '@angular/material/icon';
import {FooterModule} from '../footer/footer.module';
import {EditorCanvasSidebarComponent} from './sidebar/sidebar.component';
import {SidebarNewElementComponent} from './sidebar/sidebar-new-element/sidebar-new-element.component';
import {SidebarElementComponent} from './sidebar/sidebar-element/sidebar-element.component';
import {SidebarNamespacesComponent} from './sidebar/sidebar-namespaces/sidebar-namespaces.component';
import {SidebarNamespaceElementsComponent} from './sidebar/sidebar-namespace-elements/sidebar-namespace-elements.component';
import {NamespaceElementListComponent} from './sidebar/sidebar-namespace-elements/namespace-element-list/namespace-element-list.component';
import {NamespaceFilterComponent} from './sidebar/sidebar-namespace-elements/namespace-filter/namespace-filter.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {EditorDialogModule, EditorToolbarModule} from '@ame/editor';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AngularSplitModule} from 'angular-split';
import {FormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    EditorToolbarModule,
    EditorDialogModule,
    FooterModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    AngularSplitModule,
    FormsModule,
    MatDialogModule,
  ],
  declarations: [
    EditorCanvasComponent,
    EditorCanvasSidebarComponent,
    EditorCanvasMenuComponent,
    SidebarNewElementComponent,
    SidebarElementComponent,
    SidebarNamespacesComponent,
    SidebarNamespaceElementsComponent,
    NamespaceElementListComponent,
    NamespaceFilterComponent,
  ],
  exports: [EditorCanvasComponent],
})
export class EditorCanvasModule {}
