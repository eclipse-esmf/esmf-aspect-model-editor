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

import {beforeEach, describe, expect, it} from 'vitest';
import {DefaultEntity} from '../aspect-meta-model/default-entity';
import {DefaultProperty} from '../aspect-meta-model/default-property';
import {ModelElementCache} from './model-element-cache.service';

describe('ModelElementCache', () => {
  let cache: ModelElementCache;

  beforeEach(() => {
    cache = new ModelElementCache();
  });

  it('should initialize empty', () => {
    expect(cache.getAllElements()).toEqual([]);
    expect(cache.getKeys()).toEqual([]);
  });

  it('should add and retrieve element by key', () => {
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#prop1',
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });

    cache.addElement('urn:test#prop1', prop);
    expect(cache.get('urn:test#prop1')).toBe(prop);
    expect(cache.getAllElements().length).toBe(1);
  });

  it('should not overwrite existing element when overwrite is false', () => {
    const prop1 = new DefaultProperty({
      aspectModelUrn: 'urn:test#prop1',
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });
    const prop2 = new DefaultProperty({
      aspectModelUrn: 'urn:test#prop1',
      name: 'prop2',
      metaModelVersion: '2.0.0',
    });

    cache.addElement('urn:test#prop1', prop1);
    cache.addElement('urn:test#prop1', prop2, false);

    expect(cache.get('urn:test#prop1')).toBe(prop1);
  });

  it('should overwrite existing element when overwrite is true', () => {
    const prop1 = new DefaultProperty({
      aspectModelUrn: 'urn:test#prop1',
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });
    const prop2 = new DefaultProperty({
      aspectModelUrn: 'urn:test#prop1',
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });

    cache.addElement('urn:test#prop1', prop1);
    cache.addElement('urn:test#prop1', prop2, true);

    expect(cache.get('urn:test#prop1')).toBe(prop2);
  });

  it('should resolve instance and cache non-anonymous elements', () => {
    const entity = new DefaultEntity({
      aspectModelUrn: 'urn:test#MyEntity',
      name: 'MyEntity',
      metaModelVersion: '2.0.0',
    });

    const resolvedFirst = cache.resolveInstance(entity);
    expect(resolvedFirst).toBe(entity);
    expect(cache.get('urn:test#MyEntity')).toBe(entity);

    const duplicateInstance = new DefaultEntity({
      aspectModelUrn: 'urn:test#MyEntity',
      name: 'MyEntity',
      metaModelVersion: '2.0.0',
    });
    const resolvedSecond = cache.resolveInstance(duplicateInstance);
    expect(resolvedSecond).toBe(entity);
  });

  it('should not cache anonymous elements on resolveInstance', () => {
    const anon = new DefaultProperty({
      aspectModelUrn: 'urn:test#anon',
      name: 'anon',
      metaModelVersion: '2.0.0',
      isAnonymous: true,
    });

    const resolved = cache.resolveInstance(anon);
    expect(resolved).toBe(anon);
    expect(cache.get('urn:test#anon')).toBeUndefined();
  });

  it('should filter elements matching predicate', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:test#p1', name: 'alpha', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn:test#p2', name: 'beta', metaModelVersion: '2.0.0'});

    cache.addElement('urn:test#p1', prop1);
    cache.addElement('urn:test#p2', prop2);

    const result = cache.filter(e => e.name.startsWith('al'));
    expect(result).toEqual([prop1]);
  });

  it('should get elements by name', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:ns1#target', name: 'target', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn:ns2#target', name: 'target', metaModelVersion: '2.0.0'});
    const prop3 = new DefaultProperty({aspectModelUrn: 'urn:ns1#other', name: 'other', metaModelVersion: '2.0.0'});

    cache.addElement('urn:ns1#target', prop1);
    cache.addElement('urn:ns2#target', prop2);
    cache.addElement('urn:ns1#other', prop3);

    const found = cache.getByName('target');
    expect(found.length).toBe(2);
    expect(found).toContain(prop1);
    expect(found).toContain(prop2);
  });

  it('should remove element by key', () => {
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#p1', name: 'p1', metaModelVersion: '2.0.0'});
    cache.addElement('urn:test#p1', prop);
    expect(cache.get('urn:test#p1')).toBe(prop);

    cache.removeElement('urn:test#p1');
    expect(cache.get('urn:test#p1')).toBeUndefined();
  });

  it('should reset all cached elements', () => {
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#p1', name: 'p1', metaModelVersion: '2.0.0'});
    cache.addElement('urn:test#p1', prop);
    expect(cache.getAllElements().length).toBe(1);

    cache.reset();
    expect(cache.getAllElements().length).toBe(0);
    expect(cache.get('urn:test#p1')).toBeUndefined();
  });

  it('should update element key', () => {
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#p1', name: 'p1', metaModelVersion: '2.0.0'});
    cache.addElement('urn:test#p1', prop);

    cache.updateElementKey('urn:test#p1', 'urn:test#p1_renamed');
    expect(cache.get('urn:test#p1')).toBeUndefined();
    expect(cache.get('urn:test#p1_renamed')).toBe(prop);
  });

  it('should update namespaces of all cached elements', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:old:1.0.0#p1', name: 'p1', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn:old:1.0.0#p2', name: 'p2', metaModelVersion: '2.0.0'});
    cache.addElement('urn:old:1.0.0#p1', prop1);
    cache.addElement('urn:old:1.0.0#p2', prop2);

    cache.updateElementsNamespace('urn:old:1.0.0#', 'urn:new:2.0.0#');

    expect(cache.get('urn:old:1.0.0#p1')).toBeUndefined();
    expect(cache.get('urn:new:2.0.0#p1')).toBe(prop1);
    expect(prop1.aspectModelUrn).toBe('urn:new:2.0.0#p1');
    expect(prop2.aspectModelUrn).toBe('urn:new:2.0.0#p2');
  });

  it('should filter keys by search pattern', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:ns:sample#alpha', name: 'alpha', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn:ns:sample#beta', name: 'beta', metaModelVersion: '2.0.0'});
    cache.addElement('urn:ns:sample#alpha', prop1);
    cache.addElement('urn:ns:sample#beta', prop2);

    expect(cache.getKeys('alpha')).toEqual(['urn:ns:sample#alpha']);
    expect(cache.getKeys('beta')).toEqual(['urn:ns:sample#beta']);
    expect(cache.getKeys()).toHaveLength(2);
  });
});
