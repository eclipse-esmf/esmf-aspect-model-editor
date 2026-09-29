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

import {provideAmeGraph} from '@ame/graph';
import {provideAmeInfrastructure} from '@ame/infrastructure';
import {provideWorkbench} from '@ame/workbench';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';

/**
 * Composition root of the Aspect Model Editor: plugs the workbench (UI, features, domain)
 * together with the adapters (graph, infrastructure) that implement the domain ports.
 */
export function provideAme(): EnvironmentProviders {
  return makeEnvironmentProviders([provideWorkbench(), provideAmeGraph(), provideAmeInfrastructure()]);
}
