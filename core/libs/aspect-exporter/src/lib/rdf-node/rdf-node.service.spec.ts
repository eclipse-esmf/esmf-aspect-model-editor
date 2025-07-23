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
import {ModelElementCache, RdfModel, Samm, SammC, SammU} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {DataFactory, Quad, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfNodeService} from './rdf-node.service';

class MockSamm {
  RdfType = jest.fn(() => DataFactory.namedNode('type'));
  getAspectModelUrn = jest.fn(key => key);
}

class MockRDFModel {
  store = new Store();
  samm = new Samm('');
  sammC = new SammC(this.samm);
  sammU = new SammU(this.samm);
}

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

describe('RdfNodeService', () => {
  let service: RdfNodeService;
  let rdfModel: MockRDFModel;
  const mockModelElement1: any = {aspectModelUrn: 'aspectModelUrn1', metaModelVersion: '1.2.3'};
  const mockModelElement2: any = {aspectModelUrn: 'aspectModelUrn2', metaModelVersion: '1.2.3'};

  RdfModelUtil.getFullQualifiedModelName = jest.fn().mockReturnValue('elementType');

  beforeEach(() => {
    rdfModel = new MockRDFModel();
    TestBed.configureTestingModule({
      providers: [
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel as RdfModel, new ModelElementCache(), null),
        }),
      ],
    });
    service = TestBed.inject(RdfNodeService);
  });

  describe('update()', () => {
    it('should create quads for model elements', () => {
      service.update(mockModelElement1, {optional: true});
      service.update(mockModelElement2, {
        description: [
          {value: 'testDescriptionEn', language: 'en'},
          {value: 'testDescriptionRo', language: 'ro'},
        ],
        name: 'testName',
        see: ['see1', 'see2'],
      });
      const quads1: Quad[] = rdfModel.store.getQuads(DataFactory.namedNode('aspectModelUrn1'), null, null, null);
      const quads2: Quad[] = rdfModel.store.getQuads(DataFactory.namedNode('aspectModelUrn2'), null, null, null);
      expect(quads1.length).toBe(2);
      expect(quads2.length).toBe(6);

      // check type for mockModelElement1
      checkQuad(quads1[0], 'aspectModelUrn1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'elementType');

      // check optional property for mockModelElement1
      checkQuad(quads1[1], 'aspectModelUrn1', 'urn:samm:org.eclipse.esmf.samm:meta-model:#optional', 'true');

      // check type property for mockModelElement2
      checkQuad(quads2[0], 'aspectModelUrn2', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'elementType');

      // check description property (localized) for mockModelElement2
      checkQuad(quads2[1], 'aspectModelUrn2', 'urn:samm:org.eclipse.esmf.samm:meta-model:#description', 'testDescriptionEn');
      checkQuad(quads2[2], 'aspectModelUrn2', 'urn:samm:org.eclipse.esmf.samm:meta-model:#description', 'testDescriptionRo');

      // check name property for mockModelElement2
      checkQuad(quads2[3], 'aspectModelUrn2', 'urn:samm:org.eclipse.esmf.samm:meta-model:#name', 'testName');

      // check see property (array) for mockModelElement2
      checkQuad(quads2[4], 'aspectModelUrn2', 'urn:samm:org.eclipse.esmf.samm:meta-model:#see', 'see1');
      checkQuad(quads2[5], 'aspectModelUrn2', 'urn:samm:org.eclipse.esmf.samm:meta-model:#see', 'see2');
    });

    it('should update quads for model elements', () => {
      // create initial quads
      service.update(mockModelElement1, {optional: true});

      // update existing
      service.update(mockModelElement1, {optional: false, exampleValue: 'testExampleValue'});
      const quads: Quad[] = rdfModel.store.getQuads(DataFactory.namedNode('aspectModelUrn1'), null, null, null);
      expect(quads.length).toBe(2);

      // type
      checkQuad(quads[0], 'aspectModelUrn1', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'elementType');

      // example value
      checkQuad(quads[1], 'aspectModelUrn1', 'urn:samm:org.eclipse.esmf.samm:meta-model:#exampleValue', 'testExampleValue');
    });
  });
});

// helpers
const checkQuad = (quad: Quad, subject: string, predicate: string, value: string | boolean | number) => {
  expect(quad.subject.value).toBe(subject);
  expect(quad.predicate.value).toBe(predicate);
  expect(quad.object.value).toBe(value);
};
