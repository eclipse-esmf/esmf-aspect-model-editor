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

import {test} from '@playwright/test';
import {AppHelper} from '../../support/app-helper';

const SAMPLE_TURTLE_MODEL = `@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix samm-e: <urn:samm:org.eclipse.esmf.samm:entity:2.2.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.2.0#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:com.example:1.0.0#> .

:SampleAspect a samm:Aspect ;
   samm:name "SampleAspect" ;
   samm:properties (:sampleProperty) ;
   samm:operations () ;
   samm:events () .

:sampleProperty a samm:Property ;
   samm:name "sampleProperty" ;
   samm:characteristic :SampleCharacteristic .

:SampleCharacteristic a samm-c:Trait ;
   samm:name "SampleCharacteristic" ;
   samm-c:baseCharacteristic :SampleText ;
   samm-c:constraint :SampleConstraint .

:SampleText a samm:Characteristic ;
   samm:name "SampleText" ;
   samm:dataType xsd:string .

:SampleConstraint a samm-c:RegularExpressionConstraint ;
   samm:name "SampleConstraint" ;
   samm-c:value "^[A-Z]+$" .
`;

test.describe('Editor - Load Model & RDF Parsing', () => {
  let app: AppHelper;

  test.beforeEach(async ({page}) => {
    app = new AppHelper(page);
    await app.visitDefault();
  });

  test('should load model from RDF Turtle string and render shapes', async ({page}) => {
    await app.loadModel(SAMPLE_TURTLE_MODEL);

    await app.shapeExists('SampleAspect', true);
    await app.shapeExists('sampleProperty', true);
    await app.shapeExists('SampleCharacteristic', true);
  });
});
