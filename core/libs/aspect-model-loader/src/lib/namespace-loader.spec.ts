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

import {firstValueFrom} from 'rxjs';
import {describe, expect, it} from 'vitest';
import {NamespaceLoader} from './namespace-loader';
import {DefaultNamespaceVisitor} from './visitor/default-namespace-visitor';

const multiNamespaceTtl = `
@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.0.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.0.0#> .
@prefix samm-e: <urn:samm:org.eclipse.esmf.samm:entity:2.0.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.0.0#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.esmf.samm:test:1.0.0#> .

:TestAspect a samm:Aspect ;
   samm:preferredName "Test Aspect"@en ;
   samm:properties ( :testProperty ) ;
   samm:operations () ;
   samm:events () .

:testProperty a samm:Property ;
   samm:preferredName "Test Property"@en ;
   samm:characteristic :TestCharacteristic .

:TestCharacteristic a samm-c:Quantifiable ;
   samm:dataType xsd:string .
`;

describe('NamespaceLoader & DefaultNamespaceVisitor', () => {
  it('should load namespaces map from TTL content', async () => {
    const loader = new NamespaceLoader();
    const namespaceMap = await firstValueFrom(loader.load(multiNamespaceTtl));

    expect(namespaceMap).toBeDefined();
    expect(namespaceMap.size).toBeGreaterThan(0);

    const testNsElements = namespaceMap.get('urn:samm:org.eclipse.esmf.samm:test:1.0.0');
    expect(testNsElements).toBeDefined();
    expect(testNsElements.length).toBeGreaterThan(0);
  });

  it('should traverse namespace elements using DefaultNamespaceVisitor', async () => {
    const loader = new NamespaceLoader();
    const namespaceMap = await firstValueFrom(loader.load(multiNamespaceTtl));

    const visitor = new DefaultNamespaceVisitor();
    expect(() => visitor.visit(namespaceMap)).not.toThrow();
  });
});
