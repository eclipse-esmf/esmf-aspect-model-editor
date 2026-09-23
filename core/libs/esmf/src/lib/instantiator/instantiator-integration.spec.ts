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
import {
  DefaultEntity,
  DefaultEnumeration,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
  DefaultTrait,
} from '../aspect-meta-model';
import {AspectModelLoader} from '../aspect-model-loader';

const complexModelTtl = `
@prefix samm: <urn:samm:org.eclipse.esmf.samm:meta-model:2.0.0#> .
@prefix samm-c: <urn:samm:org.eclipse.esmf.samm:characteristic:2.0.0#> .
@prefix samm-e: <urn:samm:org.eclipse.esmf.samm:entity:2.0.0#> .
@prefix unit: <urn:samm:org.eclipse.esmf.samm:unit:2.0.0#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <urn:samm:org.eclipse.esmf.samm:test:2.0.0#> .

:ComplexAspect a samm:Aspect ;
   samm:preferredName "Complex Aspect"@en ;
   samm:properties ( :traitProperty :enumProperty :entityProperty ) ;
   samm:operations ( :calculateSomething ) ;
   samm:events ( :somethingHappened ) .

:traitProperty a samm:Property ;
   samm:preferredName "Trait Property"@en ;
   samm:characteristic :MyTrait .

:MyTrait a samm-c:Trait ;
   samm-c:baseCharacteristic :BaseQuantifiable ;
   samm-c:constraint :RangeLimit, :PatternCheck .

:BaseQuantifiable a samm-c:Quantifiable ;
   samm:dataType xsd:integer ;
   samm-c:unit unit:kilometre .

:RangeLimit a samm-c:RangeConstraint ;
   samm-c:minValue "0"^^xsd:integer ;
   samm-c:maxValue "100"^^xsd:integer .

:PatternCheck a samm-c:RegularExpressionConstraint ;
   samm:value "^[0-9]+$" .

:enumProperty a samm:Property ;
   samm:characteristic :StatusEnum .

:StatusEnum a samm-c:Enumeration ;
   samm:dataType xsd:string ;
   samm-c:values ( "OPEN" "CLOSED" "PENDING" ) .

:entityProperty a samm:Property ;
   samm:characteristic :EntityCharacteristic .

:EntityCharacteristic a samm-c:SingleEntity ;
   samm:dataType :PersonEntity .

:PersonEntity a samm:Entity ;
   samm:properties ( :personName ) .

:personName a samm:Property ;
   samm:characteristic :NameTrait .

:NameTrait a samm-c:Trait ;
   samm-c:baseCharacteristic :StringCharacteristic ;
   samm-c:constraint :LengthLimit .

:StringCharacteristic a samm-c:Quantifiable ;
   samm:dataType xsd:string .

:LengthLimit a samm-c:LengthConstraint ;
   samm-c:minValue "1"^^xsd:nonNegativeInteger ;
   samm-c:maxValue "50"^^xsd:nonNegativeInteger .

:calculateSomething a samm:Operation ;
   samm:preferredName "Calculate Something"@en ;
   samm:input ( :traitProperty ) ;
   samm:output :enumProperty .

:somethingHappened a samm:Event ;
   samm:preferredName "Something Happened"@en ;
   samm:parameters ( :traitProperty ) .
`;

describe('AspectModelLoader instantiator integration', () => {
  it('should instantiate complex aspect model with traits, constraints, enums, entities, operations and events', async () => {
    const loader = new AspectModelLoader();
    const result = await firstValueFrom(loader.loadSelfContainedModel(complexModelTtl));

    expect(result.aspect).toBeDefined();
    expect(result.aspect.name).toBe('ComplexAspect');
    expect(result.aspect.properties.length).toBe(3);
    expect(result.aspect.operations.length).toBe(1);
    expect(result.aspect.events.length).toBe(1);

    // Check trait property
    const traitProp = result.aspect.properties.find(p => p.name === 'traitProperty');
    expect(traitProp).toBeDefined();
    expect(traitProp.characteristic).toBeInstanceOf(DefaultTrait);

    const trait = traitProp.characteristic as DefaultTrait;
    expect(trait.baseCharacteristic).toBeDefined();
    expect(trait.baseCharacteristic.dataType?.name).toBe('integer');
    expect(trait.constraints.length).toBe(2);

    const rangeConstraint = trait.constraints.find(c => c instanceof DefaultRangeConstraint) as DefaultRangeConstraint;
    expect(rangeConstraint).toBeDefined();
    expect(rangeConstraint.minValue).toBe(0);
    expect(rangeConstraint.maxValue).toBe(100);

    const regexConstraint = trait.constraints.find(
      c => c instanceof DefaultRegularExpressionConstraint,
    ) as DefaultRegularExpressionConstraint;
    expect(regexConstraint).toBeDefined();
    expect(regexConstraint.value).toBe('^[0-9]+$');

    // Check enumeration property
    const enumProp = result.aspect.properties.find(p => p.name === 'enumProperty');
    expect(enumProp).toBeDefined();
    expect(enumProp.characteristic).toBeInstanceOf(DefaultEnumeration);
    const enumChar = enumProp.characteristic as DefaultEnumeration;
    expect(enumChar.values.length).toBe(3);

    // Check entity property
    const entityProp = result.aspect.properties.find(p => p.name === 'entityProperty');
    expect(entityProp).toBeDefined();
    expect(entityProp.characteristic.dataType).toBeInstanceOf(DefaultEntity);
    const personEntity = entityProp.characteristic.dataType as DefaultEntity;
    expect(personEntity.name).toBe('PersonEntity');
    expect(personEntity.properties.length).toBe(1);

    // Check operation
    const op = result.aspect.operations[0];
    expect(op.name).toBe('calculateSomething');
    expect(op.input.length).toBe(1);
    expect(op.input[0].name).toBe('traitProperty');
    expect(op.output).toBeDefined();
    expect(op.output.name).toBe('enumProperty');

    // Check event
    const event = result.aspect.events[0];
    expect(event.name).toBe('somethingHappened');
    expect(event.properties.length).toBe(1);
    expect(event.properties[0].name).toBe('traitProperty');
  });
});
