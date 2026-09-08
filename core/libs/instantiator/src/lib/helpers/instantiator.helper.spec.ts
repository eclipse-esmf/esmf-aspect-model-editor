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

import {DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {describe, expect, it} from 'vitest';
import {syncElementWithChildren} from './instantiator.helper';

describe('instantiator.helper', () => {
  describe('syncElementWithChildren', () => {
    it('should push parent element into each child parents list', () => {
      const property = new DefaultProperty({
        aspectModelUrn: 'urn:test:1.0.0#testProp',
        name: 'testProp',
        metaModelVersion: '2.0.0',
      });

      const entity = new DefaultEntity({
        aspectModelUrn: 'urn:test:1.0.0#TestEntity',
        name: 'TestEntity',
        metaModelVersion: '2.0.0',
        properties: [property],
      });

      expect(property.parents).toHaveLength(0);

      syncElementWithChildren(entity);

      expect(property.parents).toHaveLength(1);
      expect(property.parents[0]).toBe(entity);
    });

    it('should handle elements with no children without throwing', () => {
      const property = new DefaultProperty({
        aspectModelUrn: 'urn:test:1.0.0#standaloneProp',
        name: 'standaloneProp',
        metaModelVersion: '2.0.0',
      });

      expect(() => syncElementWithChildren(property)).not.toThrow();
    });

    it('should safely handle nullish element', () => {
      expect(() => syncElementWithChildren(null as never)).not.toThrow();
      expect(() => syncElementWithChildren(undefined as never)).not.toThrow();
    });
  });
});
