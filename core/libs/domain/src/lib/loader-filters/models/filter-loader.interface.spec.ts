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

import {DefaultProperty} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {ChildrenArray, ModelFilter, ModelTree} from './filter-loader.interface';

describe('ChildrenArray', () => {
  it('should push unique ModelTree nodes', () => {
    const children = new ChildrenArray();
    const prop1 = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#prop1',
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });
    const prop2 = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#prop2',
      name: 'prop2',
      metaModelVersion: '2.0.0',
    });

    const node1: ModelTree = {element: prop1, filterType: ModelFilter.DEFAULT};
    const node2: ModelTree = {element: prop2, filterType: ModelFilter.DEFAULT};

    const count = children.push(node1, node2);

    expect(count).toBe(2);
    expect(children).toHaveLength(2);
    expect(children[0]).toBe(node1);
    expect(children[1]).toBe(node2);
  });

  it('should ignore items with duplicate aspectModelUrn', () => {
    const children = new ChildrenArray();
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test:1.0.0#prop1',
      name: 'prop1',
      metaModelVersion: '2.0.0',
    });

    const node1: ModelTree = {element: prop, filterType: ModelFilter.DEFAULT};
    const node2: ModelTree = {element: prop, filterType: ModelFilter.DEFAULT};

    children.push(node1);
    const pushed = children.push(node2);

    expect(pushed).toBe(0);
    expect(children).toHaveLength(1);
  });

  it('should ignore null/undefined items', () => {
    const children = new ChildrenArray();
    const pushed = children.push(null as never, undefined as never);

    expect(pushed).toBe(0);
    expect(children).toHaveLength(0);
  });
});
