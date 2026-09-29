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

import {LoadedFilesPort} from '@ame/shared';
import {EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer} from '@angular/core';
import {DomainModelToRdfService} from './aspect-exporter';
import {LoadedFilesService} from './cache';

export function provideAmeInfrastructure(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: LoadedFilesPort, useExisting: LoadedFilesService},
    provideEnvironmentInitializer(() => inject(DomainModelToRdfService).listenForStoreUpdates()),
  ]);
}
