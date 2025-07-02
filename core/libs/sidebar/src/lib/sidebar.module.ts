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
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRippleModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {BarItemComponent} from '../../../shared/src/lib/components/bar-item/bar-item.component';
import {ElementIconComponent} from '../../../shared/src/lib/components/element/element.component';
import {DraggableElementComponent} from './draggable-element/draggable-element.component';
import {SidebarMenuComponent} from './sidebar-menu/sidebar-menu.component';
import {SidebarSAMMElementsComponent} from './sidebar-samm-elements/sidebar-samm-elements.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {WorkspaceEmptyComponent} from './workspace/workspace-empty/workspace-empty.component';
import {WorkspaceErrorComponent} from './workspace/workspace-error/workspace-error.component';
import {WorkspaceFileElementsComponent} from './workspace/workspace-file-elements/workspace-file-elements.component';
import {WorkspaceFileListComponent} from './workspace/workspace-file-list/workspace-file-list.component';
import {WorkspaceMigrateComponent} from './workspace/workspace-migrate/workspace-migrate.component';
import {WorkspaceComponent} from './workspace/workspace.component';

@NgModule({
  imports: [
    CommonModule,
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
    ElementIconComponent,
    WorkspaceErrorComponent,
    BarItemComponent,
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
