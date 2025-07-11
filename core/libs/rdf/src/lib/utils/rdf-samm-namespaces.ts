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

import {config} from '@ame/shared';

export const getSammNamespaces = () => [
  `urn:samm:org.eclipse.esmf.samm:meta-model:${config.currentSammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:characteristic:${config.currentSammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:entity:${config.currentSammVersion}#`,
  `urn:samm:org.eclipse.esmf.samm:unit:${config.currentSammVersion}#`,
  `http://www.w3.org/2001/XMLSchema#`,
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'http://www.w3.org/2000/01/rdf-schema#',
];
