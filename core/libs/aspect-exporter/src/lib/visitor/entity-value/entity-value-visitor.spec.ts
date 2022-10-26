/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {TestBed} from '@angular/core/testing';
import {DataFactory, Quad, Store} from 'n3';
import {describe, expect, it} from '@jest/globals';
import {EntityValueVisitor} from '@ame/aspect-exporter';
import {Bamm} from '@ame/vocabulary';
import {ModelService, RdfService} from '@ame/rdf/services';
import {provideMockObject} from '../../../../../../jest-helpers';

class MockBamm {
  RdfType = jest.fn(() => DataFactory.namedNode('type'));
  getAspectModelUrn = jest.fn(key => key);
}

class MockRDFModel {
  rdfModel = {
    store: new Store(),
    BAMM: jest.fn(() => new Bamm('')),
    BAMMC: jest.fn(() => ({ConstraintProperty: () => 'constraintProperty'} as any)),
    hasNamespace: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  } as any;
  store = new Store();
  BAMM = jest.fn((): Bamm => new MockBamm() as any as Bamm);
  // BAMMC = jest.fn((): Bammc => new MockBamm() as any as Bammc);
  // BAMMU = jest.fn((): Bammu => new MockBamm() as any as Bammu);
}

describe('Entity value visitor', () => {
  let mockedRdfModel: MockRDFModel;
  let service: EntityValueVisitor;
  let rdfService: jest.Mocked<RdfService>;
  const entity: any = {aspectModelUrn: 'entityUrn1'};
  const mockProperty1: any = {
    property: {
      aspectModelUrn: 'propertyUrn1',
      getDeepLookUpDataType: jest.fn().mockReturnValue({getUrn: () => 'dataTypeUrn1'}),
    },
  };
  const mockProperty2: any = {
    property: {
      aspectModelUrn: 'propertyUrn2',
      getDeepLookUpDataType: jest.fn().mockReturnValue({getUrn: () => 'dataTypeUrn2'}),
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
        EntityValueVisitor,
        {
          provide: ModelService,
          useValue: {getLoadedAspectModel: jest.fn().mockReturnValue({rdfModel: mockedRdfModel})},
        },
        {
          provide: RdfService,
          useValue: provideMockObject(RdfService),
        },
      ],
    });
    service = TestBed.inject(EntityValueVisitor);

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
