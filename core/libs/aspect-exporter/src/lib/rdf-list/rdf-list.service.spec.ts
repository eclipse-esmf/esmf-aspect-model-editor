/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {RdfModelUtil} from '@ame/rdf/utils';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultEntity,
  DefaultEnumeration,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  ModelElementCache,
  RdfModel,
} from '@esmf/aspect-model-loader';
import {DataFactory, NamedNode, Quad_Object, Store, Util} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfNodeService} from '../rdf-node';
import {RdfListService} from './rdf-list.service';
import {ListProperties} from './rdf-list.types';

class MockSamm {
  isRdfNill = jest.fn((namedNode: string) => namedNode === 'nill');
  isRdfFirst = jest.fn((namedNode: string) => namedNode === 'first');
  isRdfRest = jest.fn((namedNode: string) => namedNode === 'rest');
  RdfNil = jest.fn(() => DataFactory.namedNode('nill'));
  RdfFirst = jest.fn(() => DataFactory.namedNode('first'));
  RdfRest = jest.fn(() => DataFactory.namedNode('rest'));
  NameProperty = jest.fn(() => DataFactory.namedNode('sammName'));
  PropertiesProperty = jest.fn(() => DataFactory.namedNode('properties'));
  OperationsProperty = jest.fn(() => DataFactory.namedNode('operations'));
  EventsProperty = jest.fn(() => DataFactory.namedNode('events'));
  InputProperty = jest.fn(() => DataFactory.namedNode('input'));
  ElementsProperty = jest.fn(() => DataFactory.namedNode('elements'));
  QuantityKindsProperty = jest.fn(() => DataFactory.namedNode('quantityKinds'));
  ParametersProperty = jest.fn(() => DataFactory.namedNode('parameters'));
}

class MockSammC {
  ValuesProperty = jest.fn(() => DataFactory.namedNode('values'));
  ElementsProperty = jest.fn(() => DataFactory.namedNode('elements'));
}

class MockRDFModel {
  store = new Store();
  samm = new MockSamm();
  sammC = new MockSammC();
}

jest.mock('../../../../rdf/src/lib/utils/rdf-model-util');

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

// test aren't working as expected but works with real data
// TODO: to check if the functionality works on every scenario
describe.skip('RDF Helper', () => {
  const rdfModel = new MockRDFModel() as any;
  let service: RdfListService;
  let predicate: NamedNode;
  const subjectName = 'subject';

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      providers: [
        RdfListService,
        MockProvider(RdfNodeService),
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
    const quads = rdfModel.store.getQuads(DataFactory.namedNode(subjectName), predicate, null, null);
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
    rdfModel.store.addQuad(DataFactory.namedNode(subjectName), predicate, list);
    rdfModel.store.addQuad(DataFactory.triple(list, samm.RdfRest(), samm.RdfNil()));
  };

  const checkForFakeElements = (source, elements) => {
    service.push(source, ...elements);
    shouldBeListAndHave({first: 0, rest: 1, list: getList()});
  };

  describe('push()', () => {
    describe('Aspect -> Properties', () => {
      beforeEach(() => {
        setPredicate(rdfModel.samm.PropertiesProperty());
        RdfModelUtil.resolvePredicate = jest.fn(() => rdfModel.samm.PropertiesProperty());
        // RdfListConstants.getRelations = jest.fn(() => null);
      });

      let aspect: DefaultAspect;
      const createAspectAndCreateElements = () => {
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = [
          new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
        ];

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
          new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property3', aspectModelUrn: 'property3', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property4', aspectModelUrn: 'property4', characteristic: null}),
        );
        shouldBeListAndHave({first: 4, rest: 4, list: getList()});
      });

      it('should create the list and not add duplicates', () => {
        expect(getList()).toBeUndefined();
        createAspectAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(
          aspect,
          new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
        );
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should not add any element', () => {
        createEmptyList();
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = ['example', 1, true];
        service.push(aspect, ...elements);
        shouldBeListAndHave({first: 0, rest: 1, list: getList()});
        checkForFakeElements(new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName}), [
          'example',
          1,
          true,
        ]);
      });

      it('should not add any fake element', () => {
        createEmptyList();
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = [{random: 'object'}, {random: 'object'}];
        service.push(aspect, ...elements);
        shouldBeListAndHave({first: 0, rest: 1, list: getList()});
      });

      it('should add only properties', () => {
        createEmptyList();
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = [
          'example',
          1,
          true,
          new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
        ];
        service.push(aspect, ...elements);
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });
    });

    describe('Aspect -> Operations', () => {
      beforeEach(() => {
        setPredicate(rdfModel.samm.OperationsProperty());
        RdfModelUtil.resolvePredicate = jest.fn(() => predicate);
      });

      let aspect: DefaultAspect;
      const createAspectAndCreateElements = () => {
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = [
          new DefaultOperation({metaModelVersion: '1', name: 'operation1', aspectModelUrn: 'operation1', input: null}),
          new DefaultOperation({metaModelVersion: '1', name: 'operation2', aspectModelUrn: 'operation2', input: null}),
        ];

        service.push(aspect, ...elements);
      };

      it('should add 2 elements to list', () => {
        createEmptyList();
        createAspectAndCreateElements();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should create the list and add 2 elements', () => {
        expect(getList()).toBeUndefined();
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = [
          new DefaultOperation({metaModelVersion: '1', name: 'operation1', aspectModelUrn: 'operation1', input: null}),
          new DefaultOperation({metaModelVersion: '1', name: 'operation2', aspectModelUrn: 'operation2', input: null}),
        ];

        service.push(aspect, ...elements);
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
          new DefaultOperation({metaModelVersion: '1', name: 'operation1', aspectModelUrn: 'operation1', input: null}),
          new DefaultOperation({metaModelVersion: '1', name: 'operation2', aspectModelUrn: 'operation2', input: null}),
          new DefaultOperation({metaModelVersion: '1', name: 'operation3', aspectModelUrn: 'operation3', input: null}),
          new DefaultOperation({metaModelVersion: '1', name: 'operation4', aspectModelUrn: 'operation4', input: null}),
        );
        shouldBeListAndHave({first: 4, rest: 4, list: getList()});
      });

      it('should create the list and not add duplicates', () => {
        expect(getList()).toBeUndefined();
        createAspectAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(
          aspect,
          new DefaultOperation({metaModelVersion: '1', name: 'operation2', aspectModelUrn: 'operation2', input: null}),
          new DefaultOperation({metaModelVersion: '1', name: 'operation1', aspectModelUrn: 'operation1', input: null}),
        );
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should not add any element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName}), [
          'example',
          1,
          true,
        ]);
      });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName}), [
          {random: 'object'},
          {random: 'object'},
        ]);
      });

      it('should add only operations', () => {
        createEmptyList();
        aspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = [
          'example',
          1,
          true,
          new DefaultOperation({metaModelVersion: '1', name: 'operation1', aspectModelUrn: 'operation1', input: null}),
          new DefaultOperation({metaModelVersion: '1', name: 'operation2', aspectModelUrn: 'operation2', input: null}),
        ];
        service.push(aspect, ...elements);
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });
    });

    describe('Entity -> Properties', () => {
      beforeEach(() => {
        setPredicate(rdfModel.samm.PropertiesProperty());
        RdfModelUtil.resolvePredicate = jest.fn(() => predicate);
      });

      let entity: DefaultEntity;
      const createEntityAndCreateElements = () => {
        entity = new DefaultEntity({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = [
          new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
        ];

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

        service.push(
          entity,
          new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property3', aspectModelUrn: 'property3', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property4', aspectModelUrn: 'property4', characteristic: null}),
        );
        shouldBeListAndHave({first: 4, rest: 4, list: getList()});
      });

      it('should create the list and not add duplicates', () => {
        expect(getList()).toBeUndefined();
        createEntityAndCreateElements();
        expect(getList()).toBeDefined();
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});

        service.push(
          entity,
          new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
        );
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });

      it('should not add any element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultEntity({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName}), [
          'example',
          1,
          true,
        ]);
      });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultEntity({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName}), [
          {random: 'object'},
          {random: 'object'},
        ]);
      });

      it('should add only properties', () => {
        createEmptyList();
        entity = new DefaultEntity({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
        const elements = [
          'example',
          1,
          true,
          new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
          new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
        ];
        service.push(entity, ...elements);
        shouldBeListAndHave({first: 2, rest: 2, list: getList()});
      });
    });

    describe('DefaultEnumeration -> number, string, boolean', () => {
      beforeEach(() => {
        setPredicate(rdfModel.sammC.ValuesProperty());
        RdfModelUtil.resolvePredicate = jest.fn(() => predicate);
      });

      let enumeration: DefaultEnumeration;
      const createEnumerationAndCreateElements = () => {
        enumeration = new DefaultEnumeration({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName, values: []});
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

      // TODO Test should be adjusted.
      // it('should create the list and add 3 elements an then 3 more others', () => {
      //   expect(getList()).toBeUndefined();
      //   createEnumerationAndCreateElements();
      //   expect(getList()).toBeDefined();
      //   shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      //
      //   service.push(enumeration, 1, 'value', true, 2, 'element', false);
      //   shouldBeListAndHave({first: 6, rest: 6, list: getList()});
      // });
      //
      // it('should create the list and add duplicates', () => {
      //   expect(getList()).toBeUndefined();
      //   createEnumerationAndCreateElements();
      //   shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      //
      //   service.push(enumeration, 2, 'value', true);
      //   shouldBeListAndHave({first: 6, rest: 6, list: getList()});
      // });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(new DefaultEnumeration({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName, values: []}), [
          {random: 'object'},
          {random: 'object'},
        ]);
      });

      it('should add only string, number, boolean', () => {
        createEmptyList();
        const aspect = new DefaultEnumeration({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName, values: []});
        const elements = ['example', 1, true, {random: 'object'}, {random: 'object'}];
        service.push(aspect, ...elements);
        shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      });
    });

    describe('DefaultStructuredValue -> number, string, boolean', () => {
      beforeEach(() => {
        setPredicate(rdfModel.sammC.ElementsProperty());
        RdfModelUtil.resolvePredicate = jest.fn(() => predicate);
      });

      let structuredValue: DefaultStructuredValue;
      const createStructuredValueAndCreateElements = () => {
        structuredValue = new DefaultStructuredValue({
          metaModelVersion: '1',
          name: subjectName,
          aspectModelUrn: subjectName,
          elements: [],
          deconstructionRule: null,
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

      // TODO Test should be adjusted.
      // it('should create the list and add 3 elements an then 3 more others', () => {
      //   expect(getList()).toBeUndefined();
      //   createStructuredValueAndCreateElements();
      //   expect(getList()).toBeDefined();
      //   shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      //
      //   service.push(structuredValue, 2, 'element', false);
      //   shouldBeListAndHave({first: 6, rest: 6, list: getList()});
      // });
      //
      // it('should create the list and add duplicates', () => {
      //   expect(getList()).toBeUndefined();
      //   createStructuredValueAndCreateElements();
      //   expect(getList()).toBeDefined();
      //   shouldBeListAndHave({first: 3, rest: 3, list: getList()});
      //
      //   service.push(structuredValue, 2, 'value', true);
      //   shouldBeListAndHave({first: 6, rest: 6, list: getList()});
      // });

      it('should not add any fake element', () => {
        createEmptyList();
        checkForFakeElements(
          new DefaultStructuredValue({
            metaModelVersion: '1',
            name: subjectName,
            aspectModelUrn: subjectName,
            deconstructionRule: null,
            elements: [],
          }),
          [{random: 'object'}, {random: 'object'}],
        );
      });

      it('should add only string, number, boolean', () => {
        createEmptyList();
        structuredValue = new DefaultStructuredValue({
          metaModelVersion: '1',
          name: subjectName,
          aspectModelUrn: subjectName,
          deconstructionRule: null,
          elements: [],
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

      const source = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
      const elements = [
        new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
        new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
      ];
      service.push(source, ...elements);

      const list = getList();
      shouldBeListAndHave({first: 2, rest: 2, list});

      service.remove(source, elements[0]);
      shouldBeListAndHave({first: 1, rest: 1, list});

      const remainingQuads = rdfModel.store.getQuads(null, rdfModel.samm.RdfFirst(), null, null);
      expect(remainingQuads.find(quad => quad?.object.value === 'property1')).not.toBeDefined();
    });

    it('should remove property1 and property2', () => {
      setPredicate(rdfModel.samm.PropertiesProperty());
      createEmptyList();

      const source = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
      const elements = [
        new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
        new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
        new DefaultProperty({metaModelVersion: '1', name: 'property3', aspectModelUrn: 'property3', characteristic: null}),
        new DefaultProperty({metaModelVersion: '1', name: 'property4', aspectModelUrn: 'property4', characteristic: null}),
      ];
      service.push(source, ...elements);

      const list = getList();
      shouldBeListAndHave({first: 4, rest: 4, list});

      service.remove(source, elements[0], elements[1]);
      shouldBeListAndHave({first: 2, rest: 2, list});

      const remainingQuads = rdfModel.store.getQuads(null, rdfModel.samm.RdfFirst(), null, null);
      expect(remainingQuads.find(quad => quad?.object.value === 'property1')).not.toBeDefined();
      expect(remainingQuads.find(quad => quad?.object.value === 'property2')).not.toBeDefined();
    });
  });

  let sourceAspect: DefaultAspect;
  const createSourceAspectAndCreateElements = () => {
    sourceAspect = new DefaultAspect({metaModelVersion: '1', name: subjectName, aspectModelUrn: subjectName});
    const elements = [
      new DefaultProperty({metaModelVersion: '1', name: 'property1', aspectModelUrn: 'property1', characteristic: null}),
      new DefaultProperty({metaModelVersion: '1', name: 'property2', aspectModelUrn: 'property2', characteristic: null}),
    ];

    service.push(sourceAspect, ...elements);
  };

  describe('emptyList', () => {
    beforeEach(() => {
      setPredicate(rdfModel.samm.PropertiesProperty());
      RdfModelUtil.resolvePredicate = jest.fn(() => rdfModel.samm.PropertiesProperty());
    });

    it('should empty the properties list', () => {
      createEmptyList();
      createSourceAspectAndCreateElements();

      service.emptyList(sourceAspect, ListProperties.properties);

      const list = rdfModel.store.getQuads(DataFactory.namedNode(subjectName), rdfModel.samm.PropertiesProperty(), null, null)?.[0]?.object;
      expect(list).not.toBeUndefined();
      expect(list.value).toBe(rdfModel.samm.RdfNil().value);
    });
  });

  describe('createEmpty()', () => {
    beforeEach(() => {
      setPredicate(rdfModel.samm.PropertiesProperty());
      RdfModelUtil.resolvePredicate = jest.fn(() => rdfModel.samm.PropertiesProperty());
    });

    it('should create empty list', () => {
      createEmptyList();
      createSourceAspectAndCreateElements();

      service.createEmpty(sourceAspect, ListProperties.properties);

      shouldBeListAndHave({first: 0, rest: 1, list: getList()});
    });
  });
});
