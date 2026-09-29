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

import {ModelApiPort, ModelInstantiatorPort, NamespacesTransferPort, RdfNodePort, RdfPort, WorkspaceFacade} from '@ame/domain';
import {EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer} from '@angular/core';
import {ModelApiService, WorkspaceApiFacade} from './api';
import {DomainModelToRdfService, RdfNodeService} from './aspect-exporter';
import {InstantiatorService} from './instantiator';
import {NamespacesManagerService} from './namespace-manager';
import {RdfService} from './rdf';

export function provideAmeInfrastructure(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: WorkspaceFacade, useExisting: WorkspaceApiFacade},
    {provide: ModelApiPort, useExisting: ModelApiService},
    {provide: RdfPort, useExisting: RdfService},
    {provide: RdfNodePort, useExisting: RdfNodeService},
    {provide: ModelInstantiatorPort, useExisting: InstantiatorService},
    {provide: NamespacesTransferPort, useExisting: NamespacesManagerService},
    provideEnvironmentInitializer(() => inject(DomainModelToRdfService).listenForStoreUpdates()),
  ]);
}
