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

import {config} from '@ame/shared';
import {describe, expect, it} from 'vitest';
import {getSammNamespaces} from './rdf-samm-namespaces';

describe('rdf-samm-namespaces', () => {
  it('should return all standard samm and w3c namespace uris based on currentSammVersion', () => {
    const namespaces = getSammNamespaces();

    expect(namespaces).toHaveLength(7);
    expect(namespaces).toContain(`urn:samm:org.eclipse.esmf.samm:meta-model:${config.currentSammVersion}#`);
    expect(namespaces).toContain(`urn:samm:org.eclipse.esmf.samm:characteristic:${config.currentSammVersion}#`);
    expect(namespaces).toContain(`urn:samm:org.eclipse.esmf.samm:entity:${config.currentSammVersion}#`);
    expect(namespaces).toContain(`urn:samm:org.eclipse.esmf.samm:unit:${config.currentSammVersion}#`);
    expect(namespaces).toContain('http://www.w3.org/2001/XMLSchema#');
    expect(namespaces).toContain('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
    expect(namespaces).toContain('http://www.w3.org/2000/01/rdf-schema#');
  });
});
