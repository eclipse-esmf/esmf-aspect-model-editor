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
import {ShapeSettingsStateService} from '@ame/editor';
import {basicShapeGeometry, smallCircleShapeGeometry} from '@ame/shared';
import {Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelFilter} from '../models';
import {PropertiesFilterLoader} from './properties-filter';

describe('PropertiesFilterLoader', () => {
  let filter: PropertiesFilterLoader;
  let injector: Injector;
  let loadedFilesMock: {isElementExtern: ReturnType<typeof vi.fn>};
  let shapeSettingsStateMock: {isShapeSettingOpened: boolean; closeShapeSettings: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    shapeSettingsStateMock = {
      isShapeSettingOpened: vi.fn(() => false) as any,
      closeShapeSettings: vi.fn(),
    };

    loadedFilesMock = {
      isElementExtern: vi.fn(() => false),
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: ShapeSettingsStateService, useValue: shapeSettingsStateMock},
        {provide: LoadedFilesService, useValue: loadedFilesMock},
      ],
    });

    injector = TestBed.inject(Injector);
    filter = new PropertiesFilterLoader(injector);
  });

  describe('filter', () => {
    it('should close shape settings if currently opened', () => {
      (shapeSettingsStateMock as any).isShapeSettingOpened = vi.fn(() => true);

      filter.filter([]);

      expect(shapeSettingsStateMock.closeShapeSettings).toHaveBeenCalled();
    });

    it('should filter out null trees and return valid ModelTree array', () => {
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

      const result = filter.filter([aspect]);

      expect(result).toHaveLength(1);
      expect(result[0].element).toBe(aspect);
      expect(result[0].filterType).toBe(ModelFilter.PROPERTIES);
    });
  });

  describe('generateTree', () => {
    it('should return null for nullish elements or DefaultEntityInstance', () => {
      expect(filter.generateTree(null)).toBeNull();

      const instance = new DefaultEntityInstance({
        aspectModelUrn: 'urn:test:1.0.0#inst',
        name: 'inst',
        metaModelVersion: '2.0.0',
      });
      expect(filter.generateTree(instance)).toBeNull();
    });

    it('should skip operation and event children in properties filter', () => {
      const op = new DefaultOperation({
        aspectModelUrn: 'urn:test:1.0.0#op',
        name: 'op',
        metaModelVersion: '2.0.0',
        input: [],
      });
      const ev = new DefaultEvent({
        aspectModelUrn: 'urn:test:1.0.0#ev',
        name: 'ev',
        metaModelVersion: '2.0.0',
      });
      const aspect = new DefaultAspect({
        aspectModelUrn: 'urn:test:1.0.0#TestAspect',
        name: 'TestAspect',
        metaModelVersion: '2.0.0',
        operations: [op],
        events: [ev],
      });

      const tree = filter.generateTree(aspect);
      expect(tree.children).toHaveLength(0);
    });

    it('should traverse intermediate characteristic to find nested property', () => {
      const nestedProp = new DefaultProperty({
        aspectModelUrn: 'urn:test:1.0.0#nestedProp',
        name: 'nestedProp',
        metaModelVersion: '2.0.0',
      });
      const entity = new DefaultEntity({
        aspectModelUrn: 'urn:test:1.0.0#Entity',
        name: 'Entity',
        metaModelVersion: '2.0.0',
        properties: [nestedProp],
      });
      const char = new DefaultCharacteristic({
        aspectModelUrn: 'urn:test:1.0.0#Char',
        name: 'Char',
        metaModelVersion: '2.0.0',
        dataType: entity,
      });
      const rootProp = new DefaultProperty({
        aspectModelUrn: 'urn:test:1.0.0#rootProp',
        name: 'rootProp',
        metaModelVersion: '2.0.0',
        characteristic: char,
      });

      const tree = filter.generateTree(rootProp);
      expect(tree).toBeTruthy();
      expect(tree.children.length).toBeGreaterThan(0);
    });
  });

  describe('getArrowStyle, getShapeGeometry, getMaxgraphStyle, hasOverlay', () => {
    it('should return correct arrow styles', () => {
      const aspect = new DefaultAspect({aspectModelUrn: 'urn:test:1.0.0#Aspect', name: 'Aspect', metaModelVersion: '2.0.0'});
      const prop = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#prop', name: 'prop', metaModelVersion: '2.0.0'});

      expect(filter.getArrowStyle(prop, aspect)).toBe('defaultEdge');
    });

    it('should return correct shape geometries', () => {
      const aspect = new DefaultAspect({aspectModelUrn: 'urn:test:1.0.0#Aspect', name: 'Aspect', metaModelVersion: '2.0.0'});
      const prop = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#prop', name: 'prop', metaModelVersion: '2.0.0'});
      const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});

      expect(filter.getShapeGeometry(aspect)).toEqual(basicShapeGeometry);
      expect(filter.getShapeGeometry(prop)).toEqual(basicShapeGeometry);
      expect(filter.getShapeGeometry(entity)).toEqual(smallCircleShapeGeometry);
    });

    it('should return correct maxgraph styles', () => {
      const aspect = new DefaultAspect({aspectModelUrn: 'urn:test:1.0.0#Aspect', name: 'Aspect', metaModelVersion: '2.0.0'});
      const prop = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#prop', name: 'prop', metaModelVersion: '2.0.0'});
      const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
      const either = new DefaultEither({
        aspectModelUrn: 'urn:test:1.0.0#Either',
        name: 'Either',
        metaModelVersion: '2.0.0',
        left: null,
        right: null,
      });

      expect(filter.getMaxgraphStyle(aspect)).toBe('aspect');
      expect(filter.getMaxgraphStyle(prop)).toBe('property');
      expect(filter.getMaxgraphStyle(entity)).toBe('filteredProperties_entity');
      expect(filter.getMaxgraphStyle(either)).toBe('filteredProperties_either');
    });

    it('should report hasOverlay only for Entity and Aspect', () => {
      const aspect = new DefaultAspect({aspectModelUrn: 'urn:test:1.0.0#Aspect', name: 'Aspect', metaModelVersion: '2.0.0'});
      const entity = new DefaultEntity({aspectModelUrn: 'urn:test:1.0.0#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
      const prop = new DefaultProperty({aspectModelUrn: 'urn:test:1.0.0#prop', name: 'prop', metaModelVersion: '2.0.0'});

      expect(filter.hasOverlay(aspect)).toBe(true);
      expect(filter.hasOverlay(entity)).toBe(true);
      expect(filter.hasOverlay(prop)).toBe(false);
    });
  });
});
