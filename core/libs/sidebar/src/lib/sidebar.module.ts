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
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatMenuModule} from '@angular/material/menu';
import {CommonModule} from '@angular/common';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {SidebarMenuComponent} from './sidebar-menu/sidebar-menu.component';
import {MatRippleModule} from '@angular/material/core';
import {MatBadgeModule} from '@angular/material/badge';
import {SidebarComponent} from './sidebar/sidebar.component';
import {SidebarSAMMElementsComponent} from './sidebar-samm-elements/sidebar-samm-elements.component';
import {SharedModule} from '@ame/shared';
import {DraggableElementComponent} from './draggable-element/draggable-element.component';
import {WorkspaceEmptyComponent} from './workspace/workspace-empty/workspace-empty.component';
import {WorkspaceFileListComponent} from './workspace/workspace-file-list/workspace-file-list.component';
import {WorkspaceComponent} from './workspace/workspace.component';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {WorkspaceFileElementsComponent} from './workspace/workspace-file-elements/workspace-file-elements.component';
import {WorkspaceMigrateComponent} from './workspace/workspace-migrate/workspace-migrate.component';
import {LanguageTranslateModule} from '@ame/translation';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatRippleModule,
    MatBadgeModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatCheckboxModule,
    LanguageTranslateModule,
  ],
  declarations: [
    SidebarMenuComponent,
    SidebarComponent,
    SidebarSAMMElementsComponent,
    DraggableElementComponent,
    WorkspaceComponent,
    WorkspaceEmptyComponent,
    WorkspaceFileListComponent,
    WorkspaceFileElementsComponent,
    WorkspaceMigrateComponent,
  ],
  exports: [SidebarMenuComponent, SidebarComponent],
})
export class SidebarModule {}
