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

import {EntityInstanceVisitor, RdfListService, RdfNodeService} from '@ame/aspect-exporter';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {MxGraphService} from '@ame/mx-graph';
import {TestBed} from '@angular/core/testing';
import {
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultProperty,
  DefaultScalar,
  ModelElementCache,
  RdfModel,
  Samm,
  Value,
} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {Quad, Store} from 'n3';
import {MockProvider, MockProviders} from 'ng-mocks';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

describe('Entity instance visitor', () => {
  let service: EntityInstanceVisitor;
  let loadedFiles: LoadedFilesService;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    sammC: {ConstraintProperty: () => 'constraintProperty'} as any,
    hasDependency: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  } as any;

  const property1 = new DefaultProperty({
    name: 'property1',
    aspectModelUrn: 'property1Urn',
    metaModelVersion: '1.2.3',
    characteristic: new DefaultCharacteristic({
      name: 'ch',
      aspectModelUrn: 'chUrn',
      metaModelVersion: '1.2.3',
      dataType: new DefaultScalar({
        urn: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
        metaModelVersion: '1.2.3',
      }),
    }),
  });

  const property2 = new DefaultProperty({
    name: 'property2',
    aspectModelUrn: 'property2Urn',
    metaModelVersion: '1.2.3',
    characteristic: new DefaultCharacteristic({
      name: 'ch',
      aspectModelUrn: 'chUrn',
      metaModelVersion: '1.2.3',
      dataType: new DefaultScalar({
        urn: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
        metaModelVersion: '1.2.3',
      }),
    }),
  });

  const entity = new DefaultEntity({
    name: 'entity',
    aspectModelUrn: 'entityUrn1',
    properties: [property1, property2],
    metaModelVersion: '1.2.3',
  });

  const assertions = new Map();
  assertions.set(property1.aspectModelUrn, [new Value(123)]);
  assertions.set(property2.aspectModelUrn, [new Value(456)]);

  const mockEntityValue1 = new DefaultEntityInstance({
    name: 'entityValue1',
    aspectModelUrn: 'entityValueUrn1#entityValue1',
    metaModelVersion: '1.2.3',
    type: entity,
    assertions,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntityInstanceVisitor,
        MockProviders(MxGraphService),
        MockProvider(MxGraphService),
        MockProvider(RdfListService, {
          push: jest.fn(),
          createEmpty: jest.fn(),
        }),
        MockProvider(RdfNodeService, {
          update: jest.fn(),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, new ModelElementCache(), null),
          externalFiles: [],
        }),
      ],
    });
    service = TestBed.inject(EntityInstanceVisitor);
    loadedFiles = TestBed.inject(LoadedFilesService);

    loadedFiles.currentLoadedFile.cachedFile.resolveInstance(entity);
    loadedFiles.currentLoadedFile.cachedFile.resolveInstance(property1);
    loadedFiles.currentLoadedFile.cachedFile.resolveInstance(property2);
  });

  it('should update store', () => {
    service.visitModel(mockEntityValue1);
    const allQuads = rdfModel.store.getQuads(null, null, null, null);

    expect(allQuads.length).toBe(3);
    checkQuad(allQuads[0], 'entityValueUrn1#entityValue1', 'property1Urn#property1', '123');
    expect(allQuads[0].object.id).toBe('"123"');
    checkQuad(allQuads[1], 'entityValueUrn1#entityValue1', 'property2Urn#property2', '456');
    expect(allQuads[1].object.id).toBe('"456"');
    checkQuad(allQuads[2], 'entityValueUrn1#entityValue1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'entityUrn1#entity');
  });
});

// helpers
const checkQuad = (quad: Quad, subject: string, predicate: string, value: string | boolean | number) => {
  expect(quad.subject.value).toBe(subject);
  expect(quad.predicate.value).toBe(predicate);
  expect(quad.object.value).toBe(value);
};
