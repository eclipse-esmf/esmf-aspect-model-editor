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

import {LoadedFilesService} from '@ame/cache';
import {EdgeStyles} from '@ame/max-graph';
import {basicShapeGeometry, circleShapeGeometry, smallBasicShapeGeometry} from '@ame/shared';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelFilter} from '../models';
import {DefaultFilter, ModelStyle} from './default-filter';

describe('DefaultFilter', () => {
  let filter: DefaultFilter;
  let loadedFilesMock: {isElementExtern: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    loadedFilesMock = {
      isElementExtern: vi.fn(() => false),
    };

    filter = new DefaultFilter(loadedFilesMock as unknown as LoadedFilesService);
  });

  describe('generateTree and filter', () => {
    it('should return null if element is null or undefined', () => {
      expect(filter.generateTree(null)).toBeNull();
      expect(filter.filter([])).toEqual([]);
    });

    it('should generate tree for an Aspect with child property', () => {
      const prop = new DefaultProperty({
        aspectModelUrn: 'urn:test:1.0.0#prop',
        name: 'prop',
        metaModelVersion: '2.0.0',
      });
      const aspect = new DefaultAspect({
        aspectModelUrn: 'urn:test:1.0.0#TestAspect',
        name: 'TestAspect',
        metaModelVersion: '2.0.0',
        properties: [prop],
      });

      const tree = filter.generateTree(aspect);

      expect(tree).toBeTruthy();
      expect(tree.element).toBe(aspect);
      expect(tree.filterType).toBe(ModelFilter.DEFAULT);
      expect(tree.children).toHaveLength(1);
      expect(tree.children[0].element).toBe(prop);
    });

    it('should avoid infinite loops by caching visited relations', () => {
      const prop = new DefaultProperty({
        aspectModelUrn: 'urn:test:1.0.0#prop',
        name: 'prop',
        metaModelVersion: '2.0.0',
      });
      const aspect = new DefaultAspect({
        aspectModelUrn: 'urn:test:1.0.0#TestAspect',
        name: 'TestAspect',
        metaModelVersion: '2.0.0',
        properties: [prop],
      });

      filter.cache[`${aspect.aspectModelUrn} - ${prop.aspectModelUrn}`] = true;

      const tree = filter.generateTree(aspect);
      expect(tree.children).toHaveLength(0);
    });

    it('should skip external children when parent is also external', () => {
      const prop = new DefaultProperty({
        aspectModelUrn: 'urn:test:1.0.0#prop',
        name: 'prop',
        metaModelVersion: '2.0.0',
      });
      const aspect = new DefaultAspect({
        aspectModelUrn: 'urn:test:1.0.0#TestAspect',
        name: 'TestAspect',
        metaModelVersion: '2.0.0',
        properties: [prop],
      });

      loadedFilesMock.isElementExtern.mockReturnValue(true);

      const tree = filter.generateTree(aspect);
      expect(tree.children).toHaveLength(0);
    });
  });

  describe('getArrowStyle', () => {
    it('should return null if parent or element is missing', () => {
      const prop = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#prop', name: 'prop', metaModelVersion: '2.0.0'});
      expect(filter.getArrowStyle(null, prop)).toBeNull();
      expect(filter.getArrowStyle(prop, null)).toBeNull();
    });

    it('should return entityValueEntityEdge when parent is DefaultEntityInstance and element is not', () => {
      const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
      const instance = new DefaultEntityInstance({
        aspectModelUrn: 'urn:test:1.0.0#inst',
        name: 'inst',
        metaModelVersion: '2.0.0',
        type: entity,
      });

      expect(filter.getArrowStyle(entity, instance)).toBe(EdgeStyles.entityValueEntityEdge);
    });

    it('should return defaultEdge for standard element relations', () => {
      const aspect = new DefaultAspect({aspectModelUrn: 'urn:test:1.0.0#Aspect', name: 'Aspect', metaModelVersion: '2.0.0'});
      const prop = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#prop', name: 'prop', metaModelVersion: '2.0.0'});

      expect(filter.getArrowStyle(prop, aspect)).toBe(EdgeStyles.defaultEdge);
    });
  });

  describe('getShapeGeometry', () => {
    it('should return circleShapeGeometry for DefaultTrait', () => {
      const trait = new DefaultTrait({aspectModelUrn: 'urn:test:1.0.0#Trait', name: 'Trait', metaModelVersion: '2.0.0'});
      expect(filter.getShapeGeometry(trait)).toEqual(circleShapeGeometry);
    });

    it('should return smallBasicShapeGeometry for DefaultEntityInstance', () => {
      const instance = new DefaultEntityInstance({aspectModelUrn: 'urn:test:1.0.0#inst', name: 'inst', metaModelVersion: '2.0.0'});
      expect(filter.getShapeGeometry(instance)).toEqual(smallBasicShapeGeometry);
    });

    it('should return basicShapeGeometry for standard elements', () => {
      const prop = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#prop', name: 'prop', metaModelVersion: '2.0.0'});
      expect(filter.getShapeGeometry(prop)).toEqual(basicShapeGeometry);
    });
  });

  describe('getMaxgraphStyle', () => {
    it('should return correct style strings for each element class', () => {
      expect(filter.getMaxgraphStyle(new DefaultAspect({aspectModelUrn: 'urn:test:1.0.0#a', name: 'a', metaModelVersion: '2.0.0'}))).toBe(
        ModelStyle.ASPECT,
      );
      expect(filter.getMaxgraphStyle(new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#p', name: 'p', metaModelVersion: '2.0.0'}))).toBe(
        ModelStyle.PROPERTY,
      );

      const abstractProp = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#ap', name: 'ap', metaModelVersion: '2.0.0'});
      abstractProp.isAbstract = true;
      expect(filter.getMaxgraphStyle(abstractProp)).toBe(ModelStyle.ABSTRACT_PROPERTY);

      expect(
        filter.getMaxgraphStyle(
          new DefaultOperation({aspectModelUrn: 'urn:test:1.0.0#op', name: 'op', metaModelVersion: '2.0.0', input: []}),
        ),
      ).toBe(ModelStyle.OPERATION);
      expect(
        filter.getMaxgraphStyle(new DefaultConstraint({aspectModelUrn: 'urn:test:1.0.0#c', name: 'c', metaModelVersion: '2.0.0'})),
      ).toBe(ModelStyle.CONSTRAINT);
      expect(filter.getMaxgraphStyle(new DefaultTrait({aspectModelUrn: 'urn:test:1.0.0#t', name: 't', metaModelVersion: '2.0.0'}))).toBe(
        ModelStyle.TRAIT,
      );
      expect(
        filter.getMaxgraphStyle(new DefaultCharacteristic({aspectModelUrn: 'urn:test:1.0.0#ch', name: 'ch', metaModelVersion: '2.0.0'})),
      ).toBe(ModelStyle.CHARACTERISTIC);

      const abstractEntity = new DefaultEntity({
        aspectModelUrn: 'urn:test:1.0.0#ae',
        name: 'ae',
        metaModelVersion: '2.0.0',
        isAbstract: true,
      });
      expect(filter.getMaxgraphStyle(abstractEntity)).toBe(ModelStyle.ABSTRACT_ENTITY);

      const concreteEntity = new DefaultEntity({
        aspectModelUrn: 'urn:test:1.0.0#ce',
        name: 'ce',
        metaModelVersion: '2.0.0',
        isAbstract: false,
      });
      expect(filter.getMaxgraphStyle(concreteEntity)).toBe(ModelStyle.ENTITY);

      expect(
        filter.getMaxgraphStyle(
          new DefaultUnit({aspectModelUrn: 'urn:test:1.0.0#u', name: 'u', metaModelVersion: '2.0.0', quantityKinds: []}),
        ),
      ).toBe(ModelStyle.UNIT);
      expect(
        filter.getMaxgraphStyle(new DefaultEntityInstance({aspectModelUrn: 'urn:test:1.0.0#ei', name: 'ei', metaModelVersion: '2.0.0'})),
      ).toBe(ModelStyle.ENTITY_VALUE);
      expect(filter.getMaxgraphStyle(new DefaultEvent({aspectModelUrn: 'urn:test:1.0.0#ev', name: 'ev', metaModelVersion: '2.0.0'}))).toBe(
        ModelStyle.EVENT,
      );
      expect(
        filter.getMaxgraphStyle(new DefaultValue({aspectModelUrn: 'urn:test:1.0.0#v', name: 'v', metaModelVersion: '2.0.0', value: 'val'})),
      ).toBe(ModelStyle.VALUE);
    });

    it('should return true for hasOverlay', () => {
      expect(filter.hasOverlay()).toBe(true);
    });
  });
});
