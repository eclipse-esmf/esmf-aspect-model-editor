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

import {InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';
import {FileInfo} from '../models';

export interface INamespacesManagerService {
  onImportNamespaces(fileInfo?: FileInfo): void;
  resolveNamespacesFile(fileInfo?: FileInfo): Observable<File>;
  importNamespaces(zip: File): Observable<unknown>;
  onExportNamespaces(): void;
}

export const NAMESPACES_MANAGER_SERVICE = new InjectionToken<INamespacesManagerService>('NAMESPACES_MANAGER_SERVICE');

export interface IDomainModelToRdfService {
  listenForStoreUpdates(): void;
}

export const DOMAIN_MODEL_TO_RDF_SERVICE = new InjectionToken<IDomainModelToRdfService>('DOMAIN_MODEL_TO_RDF_SERVICE');

export interface IInstantiatorService {
  instantiateRemainingElements(mergedRdfModel: any, currentRdfModel: any, cache: any): void;
}

export const INSTANTIATOR_SERVICE = new InjectionToken<IInstantiatorService>('INSTANTIATOR_SERVICE');

export interface IRdfNodeService {
  updateQuads(searchQuery: any, replaceQuery: any, rdfModel?: any): number;
}

export const RDF_NODE_SERVICE = new InjectionToken<IRdfNodeService>('RDF_NODE_SERVICE');
