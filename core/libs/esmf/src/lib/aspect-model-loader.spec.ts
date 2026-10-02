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
import {DefaultEnumeration, DefaultValue} from './aspect-meta-model';
import {DefaultTrait} from './aspect-meta-model/characteristic/default-trait';
import {AspectModelLoader, loadAspectModel} from './aspect-model-loader';

const sampleAspectTtl = `
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
   samm:description "Test Aspect Description"@en ;
   samm:properties ( :testProperty ) ;
   samm:operations () ;
   samm:events () .

:testProperty a samm:Property ;
   samm:preferredName "Test Property"@en ;
   samm:characteristic :TestCharacteristic .

:TestCharacteristic a samm-c:Quantifiable ;
   samm:dataType xsd:string .
`;

describe('AspectModelLoader', () => {
  it('should load self contained aspect model from TTL string', async () => {
    const loader = new AspectModelLoader();
    const result = await firstValueFrom(loader.loadSelfContainedModel(sampleAspectTtl));

    expect(result).toBeDefined();
    expect(result.aspect).toBeDefined();
    expect(result.aspect.name).toBe('TestAspect');
    expect(result.aspect.aspectModelUrn).toBe('urn:samm:org.eclipse.esmf.samm:test:1.0.0#TestAspect');
    expect(result.aspect.getPreferredName('en')).toBe('Test Aspect');
    expect(result.aspect.getDescription('en')).toBe('Test Aspect Description');
    expect(result.aspect.properties.length).toBe(1);
    expect(result.aspect.properties[0].name).toBe('testProperty');
  });

  it('should load model using loadAspectModel helper function', async () => {
    const result = await firstValueFrom(
      loadAspectModel({
        filesContent: [sampleAspectTtl],
        aspectModelUrn: 'urn:samm:org.eclipse.esmf.samm:test:1.0.0#TestAspect',
      }),
    );

    expect(result.aspect).toBeDefined();
    expect(result.aspect.name).toBe('TestAspect');
    expect(result.rdfModel).toBeDefined();
    expect(result.store).toBeDefined();
    expect(result.cachedElements).toBeDefined();
    expect(result.cachedElements.get('urn:samm:org.eclipse.esmf.samm:test:1.0.0#TestAspect')).toBe(result.aspect);
  });

  it('should load model with anonymous characteristics and traits', async () => {
    const anonymousAspectTtl = `
@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse:1.0.0#> .

:AspectDefault a samm:Aspect ;
    samm:properties (:property1 :property2) ;
    samm:operations () .

:property1 a samm:Property ;
    samm:characteristic [ a samm:Characteristic; samm:dataType xsd:string ] .

:property2 a samm:Property ;
    samm:characteristic [
        a samm-c:Trait ;
        samm-c:baseCharacteristic [ a samm:Characteristic; samm:dataType xsd:string ] ;
        samm-c:constraint [ a samm:Constraint ]
    ] .
`;
    const loader = new AspectModelLoader();
    const result = await firstValueFrom(loader.loadSelfContainedModel(anonymousAspectTtl));

    expect(result.aspect).toBeDefined();
    expect(result.aspect.properties.length).toBe(2);

    const prop1 = result.aspect.properties[0];
    expect(prop1.name).toBe('property1');
    expect(prop1.characteristic.isAnonymous()).toBe(true);
    expect(prop1.characteristic.name).toBe('[Characteristic]');

    const prop2 = result.aspect.properties[1];
    expect(prop2.name).toBe('property2');
    expect(prop2.characteristic.isAnonymous()).toBe(true);
    expect(prop2.characteristic.name).toBe('[Trait]');
    const trait = prop2.characteristic as DefaultTrait;
    expect(trait.baseCharacteristic.isAnonymous()).toBe(true);
    expect(trait.baseCharacteristic.name).toBe('[Characteristic]');
    expect(trait.constraints[0].isAnonymous()).toBe(true);
    expect(trait.constraints[0].name).toBe('[Constraint]');
  });

  it('should load model with anonymous samm:Value in samm:exampleValue', async () => {
    const ttl = `
@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:com.examples:1.0.0#> .

:AspectDefault a samm:Aspect ;
    samm:properties (:myProperty) ;
    samm:operations () .

:myProperty a samm:Property ;
    samm:characteristic [ a samm:Characteristic ; samm:dataType xsd:integer ] ;
    samm:exampleValue [
        a samm:Value ;
        samm:value 42 ;
        samm:description "The answer to everything"@en ;
    ] .
`;
    const result = await firstValueFrom(loadAspectModel({filesContent: [ttl]}));

    const property = result.aspect.properties[0];
    expect(property).toBeDefined();
    expect(property.name).toBe('myProperty');
    expect(property.exampleValue).toBeDefined();
    expect(property.exampleValue instanceof DefaultValue).toBe(true);
    const valueElement = property.exampleValue as DefaultValue;
    expect(valueElement.isAnonymous()).toBe(true);
    expect(valueElement.name).toBe('[Value]');
    expect(valueElement.value).toBe('42');
    expect(valueElement.getDescription('en')).toBe('The answer to everything');
  });

  it('should load model with anonymous samm:Value in samm-c:values list of Enumeration', async () => {
    const ttl = `
@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.2.0#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:com.examples:1.0.0#> .

:AspectDefault a samm:Aspect ;
    samm:properties (:trafficLightProperty) ;
    samm:operations () .

:trafficLightProperty a samm:Property ;
    samm:characteristic :TrafficLight .

:GreenLight a samm:Value ;
    samm:value "green" ;
    samm:preferredName "Green Light"@en .

:TrafficLight a samm-c:Enumeration ;
    samm:dataType xsd:string ;
    samm-c:values (
        :GreenLight
        [
            a samm:Value ;
            samm:value "red" ;
            samm:preferredName "Critical Warning"@en ;
        ]
    ) .
`;
    const result = await firstValueFrom(loadAspectModel({filesContent: [ttl]}));

    const property = result.aspect.properties[0];
    expect(property).toBeDefined();
    const enumeration = property.characteristic as DefaultEnumeration;
    expect(enumeration).toBeDefined();
    expect(enumeration.values.length).toBe(2);

    const namedValue = enumeration.values[0] as DefaultValue;
    expect(namedValue.isAnonymous()).toBe(false);
    expect(namedValue.name).toBe('GreenLight');
    expect(namedValue.value).toBe('green');

    const anonValue = enumeration.values[1] as DefaultValue;
    expect(anonValue.isAnonymous()).toBe(true);
    expect(anonValue.name).toBe('[Value]');
    expect(anonValue.value).toBe('red');
    expect(anonValue.getPreferredName('en')).toBe('Critical Warning');
  });
});
