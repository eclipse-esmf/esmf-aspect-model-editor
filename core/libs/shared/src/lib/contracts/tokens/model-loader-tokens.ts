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

export interface INamespaceFile {
  name: string;
  namespace: string;
  originalName?: string;
  originalNamespace?: string;
  originalAspectModelUrn?: string;
  rendered?: boolean;
  fromWorkspace?: boolean;
  [key: string]: any;
}

export interface LoadSingleModelOptions {
  aspectModelUri: string;
  rdfAspectModel: string;
  fromWorkspace?: boolean;
  namespaceFileName: string;
  aspectModelUrn: string;
}

export interface IModelLoaderService {
  loadSingleModel(options: LoadSingleModelOptions): Observable<INamespaceFile>;
}

export const MODEL_LOADER_SERVICE = new InjectionToken<IModelLoaderService>('MODEL_LOADER_SERVICE');
