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
import {ErrorComponent} from '../shared/components';
import {FileConflictComponent, ImportSummaryComponent, ImportValidateComponent} from './components';

export const NAMESPACE_IMPORT_ROUTES: Routes = [
  {path: '', component: ImportValidateComponent, outlet: 'import-namespaces'},
  {path: 'conflict', component: FileConflictComponent, outlet: 'import-namespaces'},
  {path: 'summary', component: ImportSummaryComponent, outlet: 'import-namespaces'},
  {path: 'error', component: ErrorComponent, outlet: 'import-namespaces'},
];
