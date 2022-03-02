/*
 *  Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BciSharedModule} from '@bci-web-core/core';
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
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {EditorDialogModule, EditorToolbarModule} from '@bame/editor';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  imports: [
    CommonModule,
    BciSharedModule,
    MatIconModule,
    EditorToolbarModule,
    EditorDialogModule,
    FooterModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
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
