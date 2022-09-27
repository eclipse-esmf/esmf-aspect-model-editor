/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterModule, Routes} from '@angular/router';
import {
  StartMigratingComponent,
  MigratorComponent,
  LoadingMigratingComponent,
  VersionMigrationComponent,
  MigrationSuccessComponent,
  MigrationStatusComponent,
} from './components';

const routes: Routes = [
  {path: '', component: StartMigratingComponent, outlet: 'migrator'},
  {path: 'migrating', component: LoadingMigratingComponent, outlet: 'migrator'},
  {path: 'status', component: MigrationStatusComponent, outlet: 'migrator'},
  {path: 'increase-version', component: VersionMigrationComponent, outlet: 'migrator'},
  {path: 'migration-success', component: MigrationSuccessComponent, outlet: 'migrator'},
];

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    StartMigratingComponent,
    MigratorComponent,
    LoadingMigratingComponent,
    VersionMigrationComponent,
    MigrationSuccessComponent,
    MigrationStatusComponent,
  ],
})
export class MigratorModule {}
