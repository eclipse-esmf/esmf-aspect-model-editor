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

import {
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultScalar,
  ModelElementCache,
} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {EntityInstanceUtil} from './EntityInstanceUtil';

describe('EntityInstanceUtil', () => {
  it('identifies a property with the LangString datatype', () => {
    const langScalar = new DefaultScalar({
      urn: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
      metaModelVersion: '2.0.0',
    });
    const property = propertyWithType(langScalar);

    expect(EntityInstanceUtil.isDefaultPropertyWithLangString(property)).toBe(true);
  });

  it('returns only cached entity instances matching the property datatype', () => {
    const matchingType = entity('MatchingType');
    const otherType = entity('OtherType');
    const matching = instance('Matching', matchingType);
    const other = instance('Other', otherType);
    const cache = new ModelElementCache();
    cache.resolveInstance(matching);
    cache.resolveInstance(other);

    expect(EntityInstanceUtil.existingEntityValues(cache, propertyWithType(matchingType))).toEqual([matching]);
  });
});

function entity(name: string): DefaultEntity {
  return new DefaultEntity({aspectModelUrn: `urn:test:1.0.0#${name}`, name, metaModelVersion: '2.0.0'});
}

function instance(name: string, type: DefaultEntity): DefaultEntityInstance {
  return new DefaultEntityInstance({aspectModelUrn: `urn:test:1.0.0#${name}`, name, metaModelVersion: '2.0.0', type});
}

function propertyWithType(dataType: DefaultEntity | DefaultScalar): DefaultProperty {
  const characteristic = new DefaultCharacteristic({
    aspectModelUrn: 'urn:test:1.0.0#Characteristic',
    name: 'Characteristic',
    dataType,
    metaModelVersion: '2.0.0',
  });
  return new DefaultProperty({
    aspectModelUrn: 'urn:test:1.0.0#property',
    name: 'property',
    characteristic,
    metaModelVersion: '2.0.0',
  });
}
