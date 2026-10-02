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

import {expect, test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';

const MODEL_WITH_ENTITY_INSTANCES = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.examples.aspect:1.0.0#> .

:AspectDefault a samm:Aspect ;
   samm:properties ( :property1 ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:NewEntity a samm:Entity ;
   samm:properties ( :property2 :property3 :property4 ) .

:property2 a samm:Property ;
   samm:characteristic :Characteristic2 .

:property3 a samm:Property ;
   samm:characteristic :Characteristic3 .

:Characteristic4 a samm:Characteristic ;
   samm:dataType rdf:langString .

:ev1 a :NewEntity ;
   :property2 :ev2 ;
   :property3 "ev3" ;
   :property4 "ev4"@de .

:Entity1 a samm:Entity ;
   samm:properties ( ) .

:property4 a samm:Property ;
   samm:characteristic :Characteristic4 .

:ev2 a :Entity1 .

:property1 a samm:Property ;
   samm:characteristic :Characteristic1 .

:Characteristic2 a samm:Characteristic ;
   samm:dataType :Entity1 .

:Characteristic3 a samm:Characteristic ;
   samm:dataType xsd:string .

:Characteristic1 a samm-c:Enumeration ;
   samm:dataType :NewEntity ;
   samm-c:values ( :ev1 ) .
`;

test.describe('Editor - Entity Instances and Enumeration Values', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should load model with entity instances and render all elements on graph', async () => {
    await app.loadModel(MODEL_WITH_ENTITY_INSTANCES);

    // Verify key shapes exist in the maxGraph model
    await app.shapeExists('AspectDefault', true);
    await app.shapeExists('property1', true);
    await app.shapeExists('Characteristic1', true);
    await app.shapeExists('NewEntity', true);
    await app.shapeExists('property2', true);
    await app.shapeExists('property3', true);
    await app.shapeExists('property4', true);
    await app.shapeExists('Entity1', true);

    // Verify entity instance values are in aspect model structure
    const aspect = await app.getAspect();
    expect(aspect.name).toBe('AspectDefault');
    expect(aspect.properties).toHaveLength(1);

    const char1 = aspect.properties[0].characteristic;
    expect(char1.name).toBe('Characteristic1');
    expect(char1.dataType.name).toBe('NewEntity');
    expect(char1.values).toHaveLength(1);
    expect(char1.values[0].name).toBe('ev1');

    // Verify serialized RDF preserves the entity instance declarations
    const rdf = await app.getUpdatedRDF();
    expect(rdf).toContain(':ev1 a :NewEntity');
    expect(rdf).toContain(':ev2 a :Entity1');
    expect(rdf).toContain(':property2 :ev2');
    expect(rdf).toContain(':property3 "ev3"');
  });
});
