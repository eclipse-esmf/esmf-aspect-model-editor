import {TestBed} from '@angular/core/testing';
import {DataFactory, Quad, Store} from 'n3';
import {Bamm} from '../../shared/vocabulary';
import {RdfNodeService} from './rdf-node.service';
import {describe, expect, it} from '@jest/globals';
import {RdfModelUtil} from 'src/app/shared/model/rdf-model-util';
import {ModelService} from 'src/app/shared/model.service';

class MockBamm {
  RdfType = jest.fn(() => DataFactory.namedNode('type'));
  getAspectModelUrn = jest.fn(key => key);
}

class MockRDFModel {
  store = new Store();
  BAMM = jest.fn((): Bamm => (new MockBamm() as any) as Bamm);
}

describe('RdfNodeService', () => {
  let service: RdfNodeService;
  let rdfModel: MockRDFModel;
  const mockModelElement1: any = {aspectModelUrn: 'aspectModelUrn1', metaModelVersion: '1.2.3'};
  const mockModelElement2: any = {aspectModelUrn: 'aspectModelUrn2', metaModelVersion: '1.2.3'};

  RdfModelUtil.getFullQualifiedModelName = jest.fn().mockReturnValue('elementType');

  beforeEach(() => {
    rdfModel = new MockRDFModel();
    TestBed.configureTestingModule({
      providers: [{provide: ModelService, useValue: {getLoadedAspectModel: jest.fn().mockReturnValue({rdfModel: rdfModel})}}],
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
      checkQuad(quads1[0], 'aspectModelUrn1', 'type', 'elementType');

      // check optional property for mockModelElement1
      checkQuad(quads1[1], 'aspectModelUrn1', 'optional', 'true');

      // check type property for mockModelElement2
      checkQuad(quads2[0], 'aspectModelUrn2', 'type', 'elementType');

      // check description property (localized) for mockModelElement2
      checkQuad(quads2[1], 'aspectModelUrn2', 'description', 'testDescriptionEn');
      checkQuad(quads2[2], 'aspectModelUrn2', 'description', 'testDescriptionRo');

      // check name property for mockModelElement2
      checkQuad(quads2[3], 'aspectModelUrn2', 'name', 'testName');

      // check see property (array) for mockModelElement2
      checkQuad(quads2[4], 'aspectModelUrn2', 'see', 'see1');
      checkQuad(quads2[5], 'aspectModelUrn2', 'see', 'see2');
    });

    it('should update quads for model elements', () => {
      // create initial quads
      service.update(mockModelElement1, {optional: true});

      // update existing
      service.update(mockModelElement1, {optional: false, exampleValue: 'testExampleValue'});
      const quads: Quad[] = rdfModel.store.getQuads(DataFactory.namedNode('aspectModelUrn1'), null, null, null);
      expect(quads.length).toBe(2);

      // type
      checkQuad(quads[0], 'aspectModelUrn1', 'type', 'elementType');

      // example value
      checkQuad(quads[1], 'aspectModelUrn1', 'exampleValue', 'testExampleValue');
    });
  });

  describe('remove()', () => {
    it('should remove quads for model element', () => {
      service.update(mockModelElement1, {optional: true, exampleValue: 'testExampleValue'});
      service.update(mockModelElement2, {
        description: [
          {value: 'testDescriptionEn', language: 'en'},
          {value: 'testDescriptionRo', language: 'ro'},
        ],
        name: 'testName',
      });

      // remove one property
      service.remove(mockModelElement1, ['optional']);
      const quads1: Quad[] = rdfModel.store.getQuads(DataFactory.namedNode('aspectModelUrn1'), null, null, null);
      let quads2: Quad[] = rdfModel.store.getQuads(DataFactory.namedNode('aspectModelUrn2'), null, null, null);

      expect(quads1.length).toBe(2);
      expect(quads2.length).toBe(4);

      // type
      checkQuad(quads1[0], 'aspectModelUrn1', 'type', 'elementType');

      // exampleValue
      checkQuad(quads1[1], 'aspectModelUrn1', 'exampleValue', 'testExampleValue');

      // remove entire element
      service.remove(mockModelElement2);
      quads2 = rdfModel.store.getQuads(DataFactory.namedNode('aspectModelUrn2'), null, null, null);
      expect(quads2.length).toBe(0);
    });

    it('should handle nonexisting properties', () => {
      service.update(mockModelElement1, {
        description: [
          {value: 'testDescriptionEn', language: 'en'},
          {value: 'testDescriptionRo', language: 'ro'},
        ],
        name: 'testName',
      });

      // try to remove unexisting property
      service.remove(mockModelElement1, ['optional']);

      const quads: Quad[] = rdfModel.store.getQuads(DataFactory.namedNode('aspectModelUrn1'), null, null, null);
      expect(quads.length).toBe(4);
    });
  });
});

// helpers
const checkQuad = (quad: Quad, subject: string, predicate: string, value: string | boolean | number) => {
  expect(quad.subject.value).toBe(subject);
  expect(quad.predicate.value).toBe(predicate);
  expect(quad.object.value).toBe(value);
};
