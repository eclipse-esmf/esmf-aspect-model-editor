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
import {simpleDataTypes} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultEntity,
  DefaultEnumeration,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultValue,
  ModelElementCache,
  RdfModel,
} from '@esmf/aspect-model-loader';
import {DataFactory, NamedNode, Quad_Object, Store, Util} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfNodeService} from '../rdf-node';
import {ValueVisitor} from '../visitor/value/value-visitor';
import {RdfListService} from './rdf-list.service';
import {ListProperties} from './rdf-list.types';

/**
 * `NamedElement`'s `name` setter recomputes `aspectModelUrn` as `${namespace}#${name}`, where
 * `namespace` is derived by splitting the *current* `aspectModelUrn` on `#`. That means a bare
 * identifier used as both `name` and `aspectModelUrn` (e.g. `{name: 'subject', aspectModelUrn: 'subject'}`)
 * silently gets mangled into `subject#subject` once the constructor assigns `name`. Always build test
 * fixtures through this helper so the produced `aspectModelUrn` is stable and matches `name`.
 */
const urn = (name: string) => `urn:samm:test:1.0.0#${name}`;

/** A minimal `Type` stand-in so raw string/number/boolean values can be serialized as RDF literals. */
const stringDataType = {urn: simpleDataTypes.string.isDefinedBy} as any;

class MockSamm {
  isRdfNill = vi.fn((namedNode: string) => namedNode === 'nill');
  isRdfFirst = vi.fn((namedNode: string) => namedNode === 'first');
  isRdfRest = vi.fn((namedNode: string) => namedNode === 'rest');
  RdfNil = vi.fn(() => DataFactory.namedNode('nill'));
  RdfFirst = vi.fn(() => DataFactory.namedNode('first'));
  RdfRest = vi.fn(() => DataFactory.namedNode('rest'));
  NameProperty = vi.fn(() => DataFactory.namedNode('sammName'));
  PropertiesProperty = vi.fn(() => DataFactory.namedNode('properties'));
  OperationsProperty = vi.fn(() => DataFactory.namedNode('operations'));
  EventsProperty = vi.fn(() => DataFactory.namedNode('events'));
  InputProperty = vi.fn(() => DataFactory.namedNode('input'));
  ElementsProperty = vi.fn(() => DataFactory.namedNode('elements'));
  QuantityKindsProperty = vi.fn(() => DataFactory.namedNode('quantityKinds'));
  ParametersProperty = vi.fn(() => DataFactory.namedNode('parameters'));
}

class MockSammC {
  ValuesProperty = vi.fn(() => DataFactory.namedNode('values'));
  ElementsProperty = vi.fn(() => DataFactory.namedNode('elements'));
}

class MockRDFModel {
  store = new Store();
  samm = new MockSamm();
  sammC = new MockSammC();
}

describe('RDF Helper', () => {
  // A fresh model/store is created for every test so that quads created by one test
  // (e.g. lists for the same subject/predicate) can never leak into another test.
  let rdfModel: any;
  let service: RdfListService;
  let predicate: NamedNode;
  const subjectName = 'subject';
  const subjectUrn = urn(subjectName);

  beforeEach(() => {
    rdfModel = new MockRDFModel();

    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        RdfListService,
        MockProvider(RdfNodeService),
        MockProvider(ValueVisitor, {
          visit: vi.fn(),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel as RdfModel, new ModelElementCache(), null),
        }),
      ],
      imports: [],
    });

    service = TestBed.inject(RdfListService);
  });

  const getRdfFirstCount = (list: Quad_Object) => {
    let firstCount = 0;
    const quads = rdfModel.store.getQuads(list, null, null, null);

    for (const quad of quads) {
      if (quad.predicate.value === 'first') {
        firstCount++;
      } else if (quad.predicate.value === 'rest') {
        firstCount += getRdfFirstCount(quad.object);
      }
    }

    return firstCount;
  };

  const getRestCount = (list: Quad_Object) => {
    const quads = rdfModel.store.getQuads(list, null, null, null);

    for (const quad of quads) {
      if (quad.predicate.value === 'rest') {
        return 1 + getRestCount(quad.object);
      }
    }

    return 0;
  };

  const isEndingInNil = (list: Quad_Object) => {
    const quads = rdfModel.store.getQuads(list, null, null, null);

    for (const quad of quads) {
      if (quad.predicate.value !== 'rest') {
        continue;
      }

      if (Util.isBlankNode(quad.object)) {
        return isEndingInNil(quad.object);
      }

      if (quad.object.value === 'nill') {
        return true;
      }
    }

    return false;
  };

  const getList = (): Quad_Object => {
    const quads = rdfModel.store.getQuads(DataFactory.namedNode(subjectUrn), predicate, null, null);
    return quads[0]?.object;
  };

  const setPredicate = (pred: NamedNode) => {
    predicate = pred;
  };

  const shouldBeListAndHave = ({first, rest, list}) => {
    expect(Util.isBlankNode(list)).toBe(true);
    expect(getRdfFirstCount(list)).toBe(first);
    expect(getRestCount(list)).toBe(rest);
    expect(isEndingInNil(list)).toBe(true);
  };

  const createEmptyList = () => {
    const samm = rdfModel.samm;
    const list = DataFactory.blankNode();
    rdfModel.store.addQuad(DataFactory.namedNode(subjectUrn), predicate, list);
    rdfModel.store.addQuad(DataFactory.triple(list, samm.RdfRest(), samm.RdfNil()));
  };

  const checkForFakeElements = (source, elements) => {
    service.push(source, ...elements);
    shouldBeListAndHave({first: 0, rest: 1, list: getList()});
  };

  const newProperty = (name: string) => new DefaultProperty({metaModelVersion: '1', name, aspectModelUrn: urn(name), characteristic: null});

  const newOperation = (name: string) => new DefaultOperation({metaModelVersion: '1', name, aspectModelUrn: urn(name), input: null});

  describe('push()', () => {
    describe('Aspect -> Properties', () => {
      beforeEach(() => {
        setPredicate(rdfModel.samm.PropertiesProperty());
      });

      let aspect: DefaultAspect;
      const createAspectAndCreateElements = () => {
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
        const elements = [newProperty('property1'), newProperty('property2')];

        service.push(aspect, ...elements);
      };

      it('should add 2 elements to list', () => {
        createEmptyList();
        createAspectAndCreateElements();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should create the list and add 2 elements', () => {
        expect(getList()).toBeUndefined();
        createAspectAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should create the list and add 2 elements an then 2 more others', () => {
        expect(getList()).toBeUndefined();
        createAspectAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(aspect, newProperty('property1'), newProperty('property2'), newProperty('property3'), newProperty('property4'));
        shouldBeListAndHave({first: 4, rest: 4, list: getList()});
      });

      it('should create the list and not add duplicates', () => {
        expect(getList()).toBeUndefined();
        createAspectAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(aspect, newProperty('property2'), newProperty('property1'));
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should not add any element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn}), [
          'example',
          1,
          true,
        ]);
      });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn}), [
          {random: 'object'},
          {random: 'object'},
        ]);
      });

      it('should add only properties', () => {
        createEmptyList();
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
        const elements = ['example', 1, true, newProperty('property1'), newProperty('property2')];
        service.push(aspect, ...elements);
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });
    });

    describe('Aspect -> Operations', () => {
      beforeEach(() => {
        setPredicate(rdfModel.samm.OperationsProperty());
      });

      let aspect: DefaultAspect;
      const createAspectAndCreateElements = () => {
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
        const elements = [newOperation('operation1'), newOperation('operation2')];

        service.push(aspect, ...elements);
      };

      it('should add 2 elements to list', () => {
        createEmptyList();
        createAspectAndCreateElements();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should create the list and add 2 elements', () => {
        expect(getList()).toBeUndefined();
        createAspectAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should create the list and add 2 elements an then 2 more others', () => {
        expect(getList()).toBeUndefined();
        createAspectAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(
          aspect,
          newOperation('operation1'),
          newOperation('operation2'),
          newOperation('operation3'),
          newOperation('operation4'),
        );
        shouldBeListAndHave({first: 4, rest: 4, list: getList()});
      });

      it('should create the list and not add duplicates', () => {
        expect(getList()).toBeUndefined();
        createAspectAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(aspect, newOperation('operation2'), newOperation('operation1'));
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should not add any element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn}), [
          'example',
          1,
          true,
        ]);
      });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn}), [
          {random: 'object'},
          {random: 'object'},
        ]);
      });

      it('should add only operations', () => {
        createEmptyList();
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
        const elements = ['example', 1, true, newOperation('operation1'), newOperation('operation2')];
        service.push(aspect, ...elements);
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });
    });

    describe('Entity -> Properties', () => {
      beforeEach(() => {
        setPredicate(rdfModel.samm.PropertiesProperty());
      });

      let entity: DefaultEntity;
      const createEntityAndCreateElements = () => {
        entity = new DefaultEntity({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
        const elements = [newProperty('property1'), newProperty('property2')];

        service.push(entity, ...elements);
      };

      it('should add 2 elements to list', () => {
        createEmptyList();
        createEntityAndCreateElements();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should create the list and add 2 elements', () => {
        expect(getList()).toBeUndefined();
        createEntityAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should create the list and add 2 elements an then 2 more others', () => {
        expect(getList()).toBeUndefined();
        createEntityAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(entity, newProperty('property1'), newProperty('property2'), newProperty('property3'), newProperty('property4'));
        shouldBeListAndHave({first: 4, rest: 4, list: getList()});
      });

      it('should create the list and not add duplicates', () => {
        expect(getList()).toBeUndefined();
        createEntityAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(entity, newProperty('property2'), newProperty('property1'));
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should not add any element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultEntity({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn}), [
          'example',
          1,
          true,
        ]);
      });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultEntity({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn}), [
          {random: 'object'},
          {random: 'object'},
        ]);
      });

      it('should add only properties', () => {
        createEmptyList();
        entity = new DefaultEntity({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
        const elements = ['example', 1, true, newProperty('property1'), newProperty('property2')];
        service.push(entity, ...elements);
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });
    });

    describe('DefaultEnumeration -> number, string, boolean', () => {
      beforeEach(() => {
        setPredicate(rdfModel.sammC.ValuesProperty());
      });

      let enumeration: DefaultEnumeration;
      const createEnumerationAndCreateElements = () => {
        enumeration = new DefaultEnumeration({
          metaModelVersion: '1',
          name: subjectName,
          aspectModelUrn: subjectUrn,
          values: [],
          dataType: stringDataType,
        });
        const elements = [1, 'value', true];
        service.push(enumeration, ...elements);
      };

      it('should add 3 elements to list', () => {
        createEmptyList();
        createEnumerationAndCreateElements();
        shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      });

      it('should create the list and add 3 elements', () => {
        expect(getList()).toBeUndefined();
        createEnumerationAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(
          new DefaultEnumeration({
            metaModelVersion: '1',
            name: subjectName,
            aspectModelUrn: subjectUrn,
            values: [],
            dataType: stringDataType,
          }),
          [{random: 'object'}, {random: 'object'}],
        );
      });

      it('should add only string, number, boolean', () => {
        createEmptyList();
        const aspect = new DefaultEnumeration({
          metaModelVersion: '1',
          name: subjectName,
          aspectModelUrn: subjectUrn,
          values: [],
          dataType: stringDataType,
        });
        const elements = ['example', 1, true, {random: 'object'}, {random: 'object'}];
        service.push(aspect, ...elements);
        shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      });

      it('should add named and anonymous DefaultValue to enumeration list', () => {
        createEmptyList();
        const namedVal = new DefaultValue({
          metaModelVersion: '1',
          aspectModelUrn: urn('GreenLight'),
          name: 'GreenLight',
          value: 'green',
          isAnonymous: false,
        } as any);
        const anonVal = new DefaultValue({
          metaModelVersion: '1',
          aspectModelUrn: urn('[Value]_1234'),
          name: '[Value]',
          value: 'red',
          isAnonymous: true,
        } as any);
        const enumeration = new DefaultEnumeration({
          metaModelVersion: '1',
          name: subjectName,
          aspectModelUrn: subjectUrn,
          values: [namedVal, anonVal],
          dataType: stringDataType,
        });

        service.push(enumeration, namedVal, anonVal);

        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
        expect(service.valueVisitor.visit).toHaveBeenCalledWith(anonVal, expect.anything(), stringDataType.urn);
      });
    });

    describe('DefaultStructuredValue -> number, string, boolean', () => {
      beforeEach(() => {
        setPredicate(rdfModel.sammC.ElementsProperty());
      });

      let structuredValue: DefaultStructuredValue;
      const createStructuredValueAndCreateElements = () => {
        structuredValue = new DefaultStructuredValue({
          metaModelVersion: '1',
          name: subjectName,
          aspectModelUrn: subjectUrn,
          elements: [],
          deconstructionRule: null,
          dataType: stringDataType,
        });
        const elements = [1, 'value', true];
        service.push(structuredValue, ...elements);
      };

      it('should add 3 elements to list', () => {
        createEmptyList();
        createStructuredValueAndCreateElements();
        shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      });

      it('should create the list and add 3 elements', () => {
        expect(getList()).toBeUndefined();
        createStructuredValueAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(
          new DefaultStructuredValue({
            metaModelVersion: '1',
            name: subjectName,
            aspectModelUrn: subjectUrn,
            deconstructionRule: null,
            elements: [],
            dataType: stringDataType,
          }),
          [{random: 'object'}, {random: 'object'}],
        );
      });

      it('should add only string, number, boolean', () => {
        createEmptyList();
        structuredValue = new DefaultStructuredValue({
          metaModelVersion: '1',
          name: subjectName,
          aspectModelUrn: subjectUrn,
          deconstructionRule: null,
          elements: [],
          dataType: stringDataType,
        });
        const elements = ['example', 1, true, {random: 'object'}, {random: 'object'}];
        service.push(structuredValue, ...elements);
        shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      });
    });
  });

  describe('remove()', () => {
    it('should remove property1', () => {
      setPredicate(rdfModel.samm.PropertiesProperty());
      createEmptyList();

      const source = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
      const elements = [newProperty('property1'), newProperty('property2')];
      service.push(source, ...elements);

      const list = getList();
      shouldBeListAndHave({first: 2, rest: 2, list});

      service.remove(source, elements[0]);
      shouldBeListAndHave({first: 1, rest: 1, list});

      const remainingQuads = rdfModel.store.getQuads(null, rdfModel.samm.RdfFirst(), null, null);
      expect(remainingQuads.find(quad => quad?.object.value === urn('property1'))).not.toBeDefined();
      expect(remainingQuads.find(quad => quad?.object.value === urn('property2'))).toBeDefined();
    });

    it('should remove property1 and property2', () => {
      setPredicate(rdfModel.samm.PropertiesProperty());
      createEmptyList();

      const source = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
      const elements = [newProperty('property1'), newProperty('property2'), newProperty('property3'), newProperty('property4')];
      service.push(source, ...elements);

      const list = getList();
      shouldBeListAndHave({first: 4, rest: 4, list});

      service.remove(source, elements[0], elements[1]);
      shouldBeListAndHave({first: 2, rest: 2, list});

      const remainingQuads = rdfModel.store.getQuads(null, rdfModel.samm.RdfFirst(), null, null);
      expect(remainingQuads.find(quad => quad?.object.value === urn('property1'))).not.toBeDefined();
      expect(remainingQuads.find(quad => quad?.object.value === urn('property2'))).not.toBeDefined();
      expect(remainingQuads.find(quad => quad?.object.value === urn('property3'))).toBeDefined();
      expect(remainingQuads.find(quad => quad?.object.value === urn('property4'))).toBeDefined();
    });

    it('should do nothing when there is no list for the given source/property', () => {
      setPredicate(rdfModel.samm.PropertiesProperty());

      const source = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
      // getFilteredElements() eagerly creates an (empty) list via getListOrCreateNew() even when
      // called from remove(); remove() only skips *removing* elements from a freshly created list.
      expect(() => service.remove(source, newProperty('property1'))).not.toThrow();
      shouldBeListAndHave({first: 0, rest: 1, list: getList()});
    });
  });

  let sourceAspect: DefaultAspect;
  const createSourceAspectAndCreateElements = () => {
    sourceAspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
    const elements = [newProperty('property1'), newProperty('property2')];

    service.push(sourceAspect, ...elements);
  };

  describe('emptyList', () => {
    beforeEach(() => {
      setPredicate(rdfModel.samm.PropertiesProperty());
    });

    it('should empty the properties list', () => {
      createEmptyList();
      createSourceAspectAndCreateElements();
      shouldBeListAndHave({first: 2, rest: 2, list: getList()});

      service.emptyList(sourceAspect, ListProperties.properties);

      const list = rdfModel.store.getQuads(DataFactory.namedNode(subjectUrn), rdfModel.samm.PropertiesProperty(), null, null)?.[0]?.object;
      expect(list).not.toBeUndefined();
      expect(list.value).toBe(rdfModel.samm.RdfNil().value);
    });

    it('should do nothing when the list is already empty', () => {
      createEmptyList();
      const aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});

      service.emptyList(aspect, ListProperties.properties);

      const list = rdfModel.store.getQuads(DataFactory.namedNode(subjectUrn), rdfModel.samm.PropertiesProperty(), null, null)?.[0]?.object;
      expect(list.value).toBe(rdfModel.samm.RdfNil().value);
    });
  });

  describe('createEmpty()', () => {
    beforeEach(() => {
      setPredicate(rdfModel.samm.PropertiesProperty());
    });

    it('should create empty list', () => {
      createEmptyList();
      createSourceAspectAndCreateElements();

      service.createEmpty(sourceAspect, ListProperties.properties);

      shouldBeListAndHave({first: 0, rest: 1, list: getList()});
    });

    it('should create a new list from scratch when none exists yet', () => {
      const aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectUrn});
      expect(getList()).toBeUndefined();

      service.createEmpty(aspect, ListProperties.properties);

      shouldBeListAndHave({first: 0, rest: 1, list: getList()});
    });
  });
});
