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

import {
  DOMAIN_MODEL_TO_RDF_SERVICE,
  INSTANTIATOR_SERVICE,
  LOADED_FILES_SERVICE,
  NAMESPACES_MANAGER_SERVICE,
  RDF_NODE_SERVICE,
} from '@ame/shared';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {DomainModelToRdfService} from './aspect-exporter';
import {RdfNodeService} from './aspect-exporter/rdf-node/rdf-node.service';
import {LoadedFilesService} from './cache';
import {InstantiatorService} from './instantiator';
import {NamespacesManagerService} from './namespace-manager';

export function provideAmeInfrastructure(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: LOADED_FILES_SERVICE, useExisting: LoadedFilesService},
    {provide: NAMESPACES_MANAGER_SERVICE, useExisting: NamespacesManagerService},
    {provide: DOMAIN_MODEL_TO_RDF_SERVICE, useExisting: DomainModelToRdfService},
    {provide: INSTANTIATOR_SERVICE, useExisting: InstantiatorService},
    {provide: RDF_NODE_SERVICE, useExisting: RdfNodeService},
  ]);
}
