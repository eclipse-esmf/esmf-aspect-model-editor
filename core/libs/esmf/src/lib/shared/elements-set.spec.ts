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

import {describe, expect, it} from 'vitest';
import {DefaultProperty} from '../aspect-meta-model/default-property';
import {ElementSet} from './elements-set';

describe('ElementSet', () => {
  it('should initialize empty when no items are passed', () => {
    const set = new ElementSet();
    expect(set.length).toBe(0);
  });

  it('should initialize with unique items', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:test#prop1', name: 'prop1', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn:test#prop2', name: 'prop2', metaModelVersion: '2.0.0'});
    const set = new ElementSet(prop1, prop2);

    expect(set.length).toBe(2);
    expect(set[0]).toBe(prop1);
    expect(set[1]).toBe(prop2);
  });

  it('should prevent duplicate items with the same aspectModelUrn on construction', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:test#prop1', name: 'prop1', metaModelVersion: '2.0.0'});
    const prop1Duplicate = new DefaultProperty({aspectModelUrn: 'urn:test#prop1', name: 'prop1', metaModelVersion: '2.0.0'});
    const set = new ElementSet(prop1, prop1Duplicate);

    expect(set.length).toBe(1);
    expect(set[0]).toBe(prop1);
  });

  it('should prevent duplicate items with the same aspectModelUrn on push', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:test#prop1', name: 'prop1', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn:test#prop2', name: 'prop2', metaModelVersion: '2.0.0'});
    const set = new ElementSet(prop1);

    const newLen1 = set.push(prop1);
    expect(newLen1).toBe(1);
    expect(set.length).toBe(1);

    const newLen2 = set.push(prop2);
    expect(newLen2).toBe(2);
    expect(set.length).toBe(2);
  });

  it('should append items to create a new ElementSet without modifying the original', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:test#prop1', name: 'prop1', metaModelVersion: '2.0.0'});
    const prop2 = new DefaultProperty({aspectModelUrn: 'urn:test#prop2', name: 'prop2', metaModelVersion: '2.0.0'});
    const prop3 = new DefaultProperty({aspectModelUrn: 'urn:test#prop3', name: 'prop3', metaModelVersion: '2.0.0'});

    const original = new ElementSet(prop1, prop2);
    const appended = original.append([prop2, prop3]);

    expect(original.length).toBe(2);
    expect(appended.length).toBe(3);
    expect(appended[0].aspectModelUrn).toBe('urn:test#prop1');
    expect(appended[1].aspectModelUrn).toBe('urn:test#prop2');
    expect(appended[2].aspectModelUrn).toBe('urn:test#prop3');
  });

  it('should handle append with null or undefined gracefully', () => {
    const prop1 = new DefaultProperty({aspectModelUrn: 'urn:test#prop1', name: 'prop1', metaModelVersion: '2.0.0'});
    const original = new ElementSet(prop1);

    const result1 = original.append(null as any);
    expect(result1.length).toBe(1);

    const result2 = original.append(undefined as any);
    expect(result2.length).toBe(1);
  });
});
