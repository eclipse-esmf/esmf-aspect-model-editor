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

import {DefaultEntity, DefaultProperty, ModelElementCache} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {CacheUtils} from './cache-utils';

describe('CacheUtils', () => {
  it('should extract cached elements matching the specified class type', () => {
    const cache = new ModelElementCache();
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:test#prop1', name: 'prop1', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn:test#prop2', name: 'prop2', metaModelVersion: '2.0.0'});
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test#entity', name: 'entity', metaModelVersion: '2.0.0'});

    cache.addElement(prop1.aspectModelUrn, prop1);
    cache.addElement(prop2.aspectModelUrn, prop2);
    cache.addElement(entity.aspectModelUrn, entity);

    const properties = CacheUtils.getCachedElements(cache, DefaultProperty);
    expect(properties.length).toBe(2);
    expect(properties).toContain(prop1);
    expect(properties).toContain(prop2);

    const entities = CacheUtils.getCachedElements(cache, DefaultEntity);
    expect(entities.length).toBe(1);
    expect(entities[0]).toBe(entity);
  });

  it('should return an empty array when no elements match the specified class type', () => {
    const cache = new ModelElementCache();
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
    cache.addElement(prop.aspectModelUrn, prop);

    const entities = CacheUtils.getCachedElements(cache, DefaultEntity);
    expect(entities).toEqual([]);
  });

  it('should return an empty array for an empty cache', () => {
    const cache = new ModelElementCache();
    const result = CacheUtils.getCachedElements(cache, DefaultProperty);
    expect(result).toEqual([]);
  });
});
