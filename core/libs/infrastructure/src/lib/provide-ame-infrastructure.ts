/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {ModelRepositoryPort, WorkspaceFacade} from '@ame/domain';
import {EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer} from '@angular/core';
import {ModelApiService, WorkspaceApiFacade} from './api';
import {DomainModelToRdfService} from './aspect-exporter';

export function provideAmeInfrastructure(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: WorkspaceFacade, useExisting: WorkspaceApiFacade},
    {provide: ModelRepositoryPort, useExisting: ModelApiService},
    provideEnvironmentInitializer(() => inject(DomainModelToRdfService).listenForStoreUpdates()),
  ]);
}
