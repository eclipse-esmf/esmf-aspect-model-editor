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

import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {
  DefaultCollection,
  DefaultDuration,
  DefaultEither,
  DefaultEntity,
  DefaultEnumeration,
  DefaultMeasurement,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultState,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
  ModelElementCache,
  RdfModel,
  Samm,
  SammC,
} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node';
import {CharacteristicVisitor} from './characteristic-visitor';

describe('Characteristic Visitor', () => {
  let service: CharacteristicVisitor;
  let rdfModel: RdfModel;

  beforeEach(() => {
    rdfModel = {
      store: new Store(),
      samm: new Samm(''),
      sammC: new SammC(new Samm('')),
      hasDependency: vi.fn(() => false),
      addPrefix: vi.fn(() => {}),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        CharacteristicVisitor,
        MockProvider(RdfListService, {
          push: vi.fn(),
          createEmpty: vi.fn(),
        }),
        MockProvider(RdfNodeService, {
          update: vi.fn(),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, new ModelElementCache(), null),
          externalFiles: [],
          isElementExtern: vi.fn(() => false),
        }),
      ],
    });

    service = TestBed.inject(CharacteristicVisitor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update the default properties and stop early for predefined characteristics', () => {
    const characteristic = new DefaultQuantifiable({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#quantifiable1',
      name: 'quantifiable1',
      isPredefined: true,
    } as any);

    service.visit(characteristic);

    expect(service.rdfNodeService.update).not.toHaveBeenCalled();
  });

  it('should update the default properties for a non-predefined characteristic', () => {
    const characteristic = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#quantifiable1', name: 'quantifiable1'});

    service.visit(characteristic);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(characteristic, {
      preferredName: [],
      description: [],
      see: [],
      dataType: undefined,
    });
  });

  it('should set the prefix for a complex entity dataType', () => {
    const entityType = new DefaultEntity({metaModelVersion: '1', aspectModelUrn: 'samm#MyEntity', name: 'MyEntity'});
    const characteristic = new DefaultQuantifiable({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#quantifiable1',
      name: 'quantifiable1',
      dataType: entityType as any,
    });

    service.visit(characteristic);

    expect(rdfModel.hasDependency).toHaveBeenCalledWith('samm#');
  });

  describe('DefaultTrait characteristics', () => {
    it('should reference the base characteristic and constraints', () => {
      const baseCharacteristic = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#base', name: 'base'});
      const constraint = {aspectModelUrn: 'samm#constraint1'} as any;
      const trait = new DefaultTrait({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#trait1',
        name: 'trait1',
        baseCharacteristic,
        constraints: [constraint],
      });

      service.visit(trait);

      const baseQuads = rdfModel.store.getQuads(
        DataFactory.namedNode('samm#trait1'),
        rdfModel.sammC.BaseCharacteristicProperty(),
        null,
        null,
      );
      expect(baseQuads).toHaveLength(1);
      expect(baseQuads[0].object.value).toBe('samm#base');

      const constraintQuads = rdfModel.store.getQuads(
        DataFactory.namedNode('samm#trait1'),
        rdfModel.sammC.ConstraintProperty(),
        null,
        null,
      );
      expect(constraintQuads).toHaveLength(1);
      expect(constraintQuads[0].object.value).toBe('samm#constraint1');
    });

    it('should skip constraints without an aspectModelUrn', () => {
      const trait = new DefaultTrait({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#trait1',
        name: 'trait1',
        constraints: [null, {} as any],
      });

      expect(() => service.visit(trait)).not.toThrow();

      const constraintQuads = rdfModel.store.getQuads(
        DataFactory.namedNode('samm#trait1'),
        rdfModel.sammC.ConstraintProperty(),
        null,
        null,
      );
      expect(constraintQuads).toHaveLength(0);
    });
  });

  describe('DefaultQuantifiable / DefaultMeasurement / DefaultDuration characteristics', () => {
    it('should add a unit quad only when a unit is set (Quantifiable)', () => {
      const unit = new DefaultUnit({metaModelVersion: '1', aspectModelUrn: 'samm#kg', name: 'kg', quantityKinds: []});
      const characteristic = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#q1', name: 'q1', unit});

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#q1'), rdfModel.sammC.UnitProperty(), null, null);
      expect(quads).toHaveLength(1);
      expect(quads[0].object.value).toBe('samm#kg');
    });

    it('should not add a unit quad when Quantifiable has no unit', () => {
      const characteristic = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#q1', name: 'q1'});

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#q1'), rdfModel.sammC.UnitProperty(), null, null);
      expect(quads).toHaveLength(0);
    });

    it('should add the unit quad for a Measurement', () => {
      const unit = new DefaultUnit({metaModelVersion: '1', aspectModelUrn: 'samm#kg', name: 'kg', quantityKinds: []});
      const characteristic = new DefaultMeasurement({metaModelVersion: '1', aspectModelUrn: 'samm#m1', name: 'm1', unit});

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#m1'), rdfModel.sammC.UnitProperty(), null, null);
      expect(quads).toHaveLength(1);
    });

    it('should add the unit quad for a Duration', () => {
      const unit = new DefaultUnit({metaModelVersion: '1', aspectModelUrn: 'samm#s', name: 's', quantityKinds: []});
      const characteristic = new DefaultDuration({metaModelVersion: '1', aspectModelUrn: 'samm#d1', name: 'd1', unit});

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#d1'), rdfModel.sammC.UnitProperty(), null, null);
      expect(quads).toHaveLength(1);
    });
  });

  describe('DefaultEnumeration characteristics', () => {
    it('should push the enumeration values', () => {
      const values = ['a', 'b'] as any;
      const characteristic = new DefaultEnumeration({metaModelVersion: '1', aspectModelUrn: 'samm#e1', name: 'e1', values});

      service.visit(characteristic);

      expect(service.rdfListService.push).toHaveBeenCalledWith(characteristic, 'a', 'b');
    });

    it('should set prefix for named DefaultValues in enumeration', () => {
      const namedVal = new DefaultValue({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#Green',
        name: 'Green',
        value: 'green',
        isAnonymous: false,
      } as any);
      const anonVal = new DefaultValue({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#[Value]_1',
        name: '[Value]',
        value: 'red',
        isAnonymous: true,
      } as any);
      const characteristic = new DefaultEnumeration({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#e1',
        name: 'e1',
        values: [namedVal, anonVal],
      });

      service.visit(characteristic);

      expect(service.rdfListService.push).toHaveBeenCalledWith(characteristic, namedVal, anonVal);
      expect(rdfModel.hasDependency).toHaveBeenCalledWith('samm#');
    });
  });

  describe('DefaultCollection characteristics', () => {
    it('should reference the element characteristic when set', () => {
      const elementCharacteristic = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#elem', name: 'elem'});
      const characteristic = new DefaultCollection({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#col1',
        name: 'col1',
        elementCharacteristic,
      });

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#col1'), rdfModel.sammC.ElementCharacteristicProperty(), null, null);
      expect(quads).toHaveLength(1);
      expect(quads[0].object.value).toBe('samm#elem');
    });

    it('should reference the element characteristic as blank node when anonymous', () => {
      const elementCharacteristic = new DefaultQuantifiable({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#elem',
        name: '[Quantifiable]',
        isAnonymous: true,
      });
      const characteristic = new DefaultCollection({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#col1',
        name: 'col1',
        elementCharacteristic,
      });

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#col1'), rdfModel.sammC.ElementCharacteristicProperty(), null, null);
      expect(quads).toHaveLength(1);
      expect(quads[0].object.termType).toBe('BlankNode');
    });

    it('should not reference an element characteristic when none is set', () => {
      const characteristic = new DefaultCollection({metaModelVersion: '1', aspectModelUrn: 'samm#col1', name: 'col1'});

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#col1'), rdfModel.sammC.ElementCharacteristicProperty(), null, null);
      expect(quads).toHaveLength(0);
    });
  });

  describe('DefaultEither characteristics', () => {
    it('should reference both the left and right characteristics', () => {
      const left = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#left', name: 'left'});
      const right = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#right', name: 'right'});
      const characteristic = new DefaultEither({metaModelVersion: '1', aspectModelUrn: 'samm#either1', name: 'either1', left, right});

      service.visit(characteristic);

      const leftQuads = rdfModel.store.getQuads(DataFactory.namedNode('samm#either1'), rdfModel.sammC.EitherLeftProperty(), null, null);
      const rightQuads = rdfModel.store.getQuads(DataFactory.namedNode('samm#either1'), rdfModel.sammC.EitherRightProperty(), null, null);
      expect(leftQuads[0].object.value).toBe('samm#left');
      expect(rightQuads[0].object.value).toBe('samm#right');
    });

    it('should reference left and right as blank nodes when anonymous', () => {
      const left = new DefaultQuantifiable({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#left',
        name: '[Quantifiable]',
        isAnonymous: true,
      });
      const right = new DefaultQuantifiable({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#right',
        name: '[Quantifiable]',
        isAnonymous: true,
      });
      const characteristic = new DefaultEither({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#either1',
        name: 'either1',
        left,
        right,
      });

      service.visit(characteristic);

      const leftQuads = rdfModel.store.getQuads(DataFactory.namedNode('samm#either1'), rdfModel.sammC.EitherLeftProperty(), null, null);
      const rightQuads = rdfModel.store.getQuads(DataFactory.namedNode('samm#either1'), rdfModel.sammC.EitherRightProperty(), null, null);
      expect(leftQuads[0].object.termType).toBe('BlankNode');
      expect(rightQuads[0].object.termType).toBe('BlankNode');
    });
  });

  describe('DefaultStructuredValue characteristics', () => {
    it('should add the deconstruction rule and push the elements', () => {
      const property = new DefaultProperty({metaModelVersion: '1', aspectModelUrn: 'samm#p1', name: 'p1', characteristic: null});
      const characteristic = new DefaultStructuredValue({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#sv1',
        name: 'sv1',
        deconstructionRule: '(.*)',
        elements: [property],
      });

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#sv1'), rdfModel.sammC.DeconstructionRuleProperty(), null, null);
      expect(quads).toHaveLength(1);
      expect(quads[0].object.value).toBe('(.*)');
      expect(service.rdfListService.push).toHaveBeenCalledWith(characteristic, property);
    });
  });

  describe('DefaultState characteristics', () => {
    it('should reference a NamedElement default value directly', () => {
      const defaultValue = new DefaultUnit({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#defaultVal',
        name: 'defaultVal',
        quantityKinds: [],
      });
      const characteristic = new DefaultState({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#state1',
        name: 'state1',
        values: [],
        defaultValue: defaultValue as any,
      });

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#state1'), rdfModel.sammC.DefaultValueProperty(), null, null);
      expect(quads).toHaveLength(1);
      expect(quads[0].object.value).toBe('samm#defaultVal');
    });

    it('should encode a plain default value as a literal', () => {
      const characteristic = new DefaultState({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#state1',
        name: 'state1',
        values: [],
        defaultValue: {value: 'OPEN'} as any,
      });

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#state1'), rdfModel.sammC.DefaultValueProperty(), null, null);
      expect(quads).toHaveLength(1);
      expect(quads[0].object.value).toBe('OPEN');
    });

    it('should not duplicate the default value reference if it already exists', () => {
      const characteristic = new DefaultState({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#state1',
        name: 'state1',
        values: [],
        defaultValue: {value: 'OPEN'} as any,
      });

      service.visit(characteristic);
      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#state1'), rdfModel.sammC.DefaultValueProperty(), null, null);
      expect(quads).toHaveLength(1);
    });
  });

  describe('updateParents', () => {
    it('should update the characteristic reference on a non-predefined property parent', () => {
      const characteristic = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#c1', name: 'c1'});
      const property = new DefaultProperty({metaModelVersion: '1', aspectModelUrn: 'samm#p1', name: 'p1', characteristic});
      characteristic.parents.push(property);

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#p1'), rdfModel.samm.CharacteristicProperty(), null, null);
      expect(quads).toHaveLength(1);
      expect(quads[0].object.value).toBe('samm#c1');
    });

    it('should skip trait and either parents', () => {
      const characteristic = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#c1', name: 'c1'});
      const traitParent = new DefaultTrait({metaModelVersion: '1', aspectModelUrn: 'samm#trait1', name: 'trait1'});
      characteristic.parents.push(traitParent);

      expect(() => service.visit(characteristic)).not.toThrow();
    });

    it('should skip parents that are external elements', () => {
      const isElementExtern = TestBed.inject(LoadedFilesService).isElementExtern as ReturnType<typeof vi.fn>;
      isElementExtern.mockReturnValue(true);

      const characteristic = new DefaultQuantifiable({metaModelVersion: '1', aspectModelUrn: 'samm#c1', name: 'c1'});
      const property = new DefaultProperty({metaModelVersion: '1', aspectModelUrn: 'samm#p1', name: 'p1', characteristic});
      characteristic.parents.push(property);

      service.visit(characteristic);

      const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#p1'), rdfModel.samm.CharacteristicProperty(), null, null);
      expect(quads).toHaveLength(0);
    });

    it('should clear the example value when the dataType is a complex entity', () => {
      const entityType = new DefaultEntity({metaModelVersion: '1', aspectModelUrn: 'samm#MyEntity', name: 'MyEntity'});
      const characteristic = new DefaultQuantifiable({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#c1',
        name: 'c1',
        dataType: entityType as any,
      });
      const property = new DefaultProperty({
        metaModelVersion: '1',
        aspectModelUrn: 'samm#p1',
        name: 'p1',
        characteristic,
        exampleValue: {value: 'example'} as any,
      });
      characteristic.parents.push(property);

      service.visit(characteristic);

      expect(property.exampleValue).toBeNull();
      expect(service.rdfNodeService.update).toHaveBeenCalledWith(property, {exampleValue: null});
    });
  });
});
