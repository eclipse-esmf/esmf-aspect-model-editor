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
import {RouterModule, Routes} from '@angular/router';
import {ErrorComponent} from '../shared';
import {SelectNamespacesComponent, ExportSummaryComponent, ExportValidateComponent} from './components';

const routes: Routes = [
  {path: '', component: SelectNamespacesComponent, outlet: 'export-namespaces'},
  {path: 'validate', component: ExportValidateComponent, outlet: 'export-namespaces'},
  {path: 'summary', component: ExportSummaryComponent, outlet: 'export-namespaces'},
  {path: 'error', component: ErrorComponent, outlet: 'export-namespaces'},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NamespaceExporterRouterModule {}
