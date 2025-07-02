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

import {EntityInstanceVisitor} from '@ame/aspect-exporter';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {Samm} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {DataFactory, Quad, Store} from 'n3';
import {provideMockObject} from '../../../../../../jest-helpers';

class MockSamm {
  RdfType = jest.fn(() => DataFactory.namedNode('type'));
  getAspectModelUrn = jest.fn(key => key);
}

class MockRDFModel {
  rdfModel = {
    store: new Store(),
    SAMM: jest.fn(() => new Samm('')),
    SAMMC: jest.fn(() => ({ConstraintProperty: () => 'constraintProperty'}) as any),
    hasNamespace: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  } as any;
  store = new Store();
  SAMM = jest.fn((): Samm => new MockSamm() as any as Samm);
}

describe('Entity instance visitor', () => {
  let mockedRdfModel: MockRDFModel;
  let service: EntityInstanceVisitor;
  let rdfService: jest.Mocked<RdfService>;
  const entity: any = {aspectModelUrn: 'entityUrn1'};
  const mockProperty1: any = {
    property: {
      aspectModelUrn: 'propertyUrn1',
      getDeepLookUpDataType: jest.fn().mockReturnValue({getUrn: () => 'dataTypeUrn1'}),
      characteristic: {
        dataType: {
          urn: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
          getUrn: jest.fn().mockReturnValue({getUrn: () => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'}),
        },
      },
    },
  };
  const mockProperty2: any = {
    property: {
      aspectModelUrn: 'propertyUrn2',
      getDeepLookUpDataType: jest.fn().mockReturnValue({getUrn: () => 'dataTypeUrn2'}),
      characteristic: {
        dataType: {
          urn: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
          getUrn: jest.fn().mockReturnValue({getUrn: () => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'}),
        },
      },
    },
  };

  const mockEntityValue1: any = {
    aspectModelUrn: 'entityValueUrn1',
    metaModelVersion: '1.2.3',
    entity: entity,
    properties: [
      {key: mockProperty1, value: 123},
      {key: mockProperty2, value: 456},
    ],
  };

  beforeEach(() => {
    mockedRdfModel = new MockRDFModel();
    TestBed.configureTestingModule({
      providers: [
        EntityInstanceVisitor,
        {
          provide: ModelService,
          useValue: {
            get currentRdfModel() {
              return mockedRdfModel;
            },
          },
        },
        {
          provide: RdfService,
          useValue: provideMockObject(RdfService),
        },
      ],
    });
    service = TestBed.inject(EntityInstanceVisitor);

    rdfService = TestBed.inject(RdfService) as jest.Mocked<RdfService>;
    rdfService.currentRdfModel = mockedRdfModel.rdfModel;
    rdfService.externalRdfModels = [];
  });

  it('should update store', () => {
    service.visitModel(mockEntityValue1);
    const allQuads = mockedRdfModel.store.getQuads(null, null, null, null);

    expect(allQuads.length).toBe(3);
    checkQuad(allQuads[0], 'entityValueUrn1', 'propertyUrn1', '123');
    expect(allQuads[0].object.id).toBe('"123"^^dataTypeUrn1');
    checkQuad(allQuads[1], 'entityValueUrn1', 'propertyUrn2', '456');
    expect(allQuads[1].object.id).toBe('"456"^^dataTypeUrn2');
    checkQuad(allQuads[2], 'entityValueUrn1', 'type', 'entityUrn1');
  });
});

// helpers
const checkQuad = (quad: Quad, subject: string, predicate: string, value: string | boolean | number) => {
  expect(quad.subject.value).toBe(subject);
  expect(quad.predicate.value).toBe(predicate);
  expect(quad.object.value).toBe(value);
};
