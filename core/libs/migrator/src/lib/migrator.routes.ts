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
import {Routes} from '@angular/router';
import {
  LoadingMigratingComponent,
  MigrationStatusComponent,
  MigrationSuccessComponent,
  StartMigratingComponent,
  VersionMigrationComponent,
} from './components';
import {SammMigrationComponent} from './components/samm-migration/samm-migration.component';

export const MIGRATOR_ROUTES: Routes = [
  {path: 'start-migration', component: StartMigratingComponent, outlet: 'migrator'},
  {path: 'samm-migration', component: SammMigrationComponent, outlet: 'migrator'},
  {path: 'migrating', component: LoadingMigratingComponent, outlet: 'migrator'},
  {path: 'status', component: MigrationStatusComponent, outlet: 'migrator'},
  {path: 'increase-version', component: VersionMigrationComponent, outlet: 'migrator'},
  {path: 'migration-success', component: MigrationSuccessComponent, outlet: 'migrator'},
];
