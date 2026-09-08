/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 * SPDX-License-Identifier: MPL-2.0
 */

import {
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultScalar,
  Value,
} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {emptyEntityInstanceProperties, entityInstanceProperties, hasMissingRequiredEntityInstanceValue} from './entity-instance-form';

describe('entity-instance-form', () => {
  it('creates one empty row per concrete property', () => {
    const property = scalarProperty();
    const entity = entityWith(property);

    expect(emptyEntityInstanceProperties(entity)).toEqual({property: [{value: ''}]});
  });

  it('maps assertions to editable rows', () => {
    const property = scalarProperty();
    const entity = entityWith(property);
    const entityValue = new DefaultEntityInstance({
      aspectModelUrn: 'urn:test:1.0.0#Instance',
      name: 'Instance',
      metaModelVersion: '2.0.0',
      type: entity,
    });
    entityValue.setAssertion(property.aspectModelUrn, new Value('saved', property.characteristic.dataType));

    const result = entityInstanceProperties(entityValue, () => property);

    expect(result.properties).toEqual({property: [{value: 'saved'}]});
    expect(result.locks.property[0].value).toBe(false);
  });

  it('validates required rows but allows optional properties', () => {
    const property = scalarProperty();
    const entity = entityWith(property);

    expect(hasMissingRequiredEntityInstanceValue(entity, {property: [{value: ''}]})).toBe(true);
    expect(hasMissingRequiredEntityInstanceValue(entity, {property: [{value: 'defined'}]})).toBe(false);

    entity.propertiesPayload[property.aspectModelUrn].optional = true;
    expect(hasMissingRequiredEntityInstanceValue(entity, {property: [{value: ''}]})).toBe(false);
  });
});

function scalarProperty(): DefaultProperty {
  const scalar = new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion: '2.0.0'});
  return new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#property',
    name: 'property',
    metaModelVersion: '2.0.0',
    characteristic: new DefaultCharacteristic({
      aspectModelUrn: 'urn:test:1.0.0#Characteristic',
      name: 'Characteristic',
      metaModelVersion: '2.0.0',
      dataType: scalar,
    }),
  });
}

function entityWith(property: DefaultProperty): DefaultEntity {
  const entity = new DefaultEntity({
    aspectModelUrn: 'urn:test:1.0.0#Entity',
    name: 'Entity',
    metaModelVersion: '2.0.0',
    properties: [property],
  });
  entity.propertiesPayload = {[property.aspectModelUrn]: {optional: false, notInPayload: false, payloadName: property.name}};
  return entity;
}
