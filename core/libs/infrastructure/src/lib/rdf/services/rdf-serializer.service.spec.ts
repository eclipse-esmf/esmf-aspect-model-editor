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

import {ModelDocumentService} from '@ame/domain';
import {LanguageTranslationService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {RdfModel, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Parser, Store} from 'n3';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {RdfSerializerService} from './rdf-serializer.service';

describe('RdfSerializerService', () => {
  let service: RdfSerializerService;
  let translationService: {
    translateService: {
      getActiveLang: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    translationService = {
      translateService: {
        getActiveLang: vi.fn(() => 'en'),
      },
    };

    TestBed.configureTestingModule({
      providers: [RdfSerializerService, {provide: LanguageTranslationService, useValue: translationService}],
    });

    service = TestBed.inject(RdfSerializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty string when rdfModel is null or store is missing', () => {
    expect(service.serializeModel(null as unknown as RdfModel)).toBe('');
    expect(service.serializeModel({} as unknown as RdfModel)).toBe('');
  });

  it('should serialize basic rdf model with prefixes', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', null);

    const result = service.serializeModel(rdfModel);
    expect(typeof result).toBe('string');
  });

  it('should handle XSD URI prefix replacements', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', null);

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestProperty'),
        DataFactory.namedNode('urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#dataType'),
        DataFactory.namedNode(`${Samm.XSD_URI}#string`),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain('xsd:string');
  });

  it('should handle langString example value quads with active language', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', null);

    translationService.translateService.getActiveLang.mockReturnValue('de');

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestProperty'),
        rdfModel.samm.ExampleValueProperty(),
        DataFactory.literal('Beispiel', DataFactory.namedNode(`${Samm.RDF_URI}#langString`)),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain('"Beispiel"@de');
  });

  it('should handle samm namespace replacements to alias', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', null);

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestAspect'),
        rdfModel.samm.RdfType(),
        rdfModel.samm.Aspect(),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain('samm:Aspect');
  });

  it('should handle rdf:nil quads and serialize empty list', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', null);

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestOperation'),
        rdfModel.samm.InputProperty(),
        rdfModel.samm.RdfNil(),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain('()');
  });

  it('should handle blank node subjects with resolveBlankNodes', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', null);

    const blankSubject = DataFactory.blankNode('b0');
    store.addQuad(
      DataFactory.quad(
        blankSubject,
        DataFactory.namedNode('urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#name'),
        DataFactory.literal('testItem'),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(typeof serialized).toBe('string');
  });

  it('should only include used prefixes in the serialized output', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:org.eclipse.esmf:test:1.0.0');

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestProperty'),
        rdfModel.samm.RdfType(),
        rdfModel.samm.Property(),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain('@prefix samm:');
    expect(serialized).toContain('@prefix :');
    // xsd, rdf, rdfs and unit are not used in this store, so they should not appear in prefix header
    expect(serialized).not.toContain('@prefix xsd:');
    expect(serialized).not.toContain('@prefix rdf:');
    expect(serialized).not.toContain('@prefix rdfs:');
    expect(serialized).not.toContain('@prefix unit:');
  });

  it('should include rdf prefix when an explicit rdf term is used', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:org.eclipse.esmf:test:1.0.0');

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestProperty'),
        DataFactory.namedNode('urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#dataType'),
        DataFactory.namedNode(`${Samm.RDF_URI}#langString`),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain('@prefix rdf:');
  });

  it('should not include rdf prefix for language-tagged literals or empty lists', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:org.eclipse.esmf:test:1.0.0');

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestProperty'),
        DataFactory.namedNode('urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#description'),
        DataFactory.literal('Description in English', 'en'),
      ),
    );
    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestOperation'),
        rdfModel.samm.InputProperty(),
        rdfModel.samm.RdfNil(),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain('"Description in English"@en');
    expect(serialized).not.toContain('@prefix rdf:');
  });

  it('should include rdfs prefix when an rdfs term is used', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:org.eclipse.esmf:test:1.0.0');

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#TestProperty'),
        DataFactory.namedNode(`${Samm.RDFS_URI}#seeAlso`),
        DataFactory.namedNode('http://example.com/ref'),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain('@prefix rdfs:');
  });

  it('should serialize anonymous inline characteristic blank node correctly', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:com.example:1.0.0');
    const blankChar = DataFactory.blankNode('b0');

    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.example:1.0.0#property1'), rdfModel.samm.RdfType(), rdfModel.samm.Property()),
    );
    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.example:1.0.0#property1'), rdfModel.samm.CharacteristicProperty(), blankChar),
    );
    store.addQuad(DataFactory.quad(blankChar, rdfModel.samm.RdfType(), rdfModel.samm.Characteristic()));
    store.addQuad(
      DataFactory.quad(
        blankChar,
        DataFactory.namedNode('urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#dataType'),
        DataFactory.namedNode(`${Samm.XSD_URI}#string`),
      ),
    );

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain(':property1 a samm:Property;');
    expect(serialized).toContain('samm:characteristic [');
    expect(serialized).toContain('a samm:Characteristic;');
    expect(serialized).toContain('samm:dataType xsd:string');
    expect(serialized).not.toContain('_:b0');
  });

  it('should serialize anonymous inline samm:Value in samm:exampleValue as blank node correctly', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:com.example:1.0.0');
    const blankValue = DataFactory.blankNode('b0');

    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.example:1.0.0#myProperty'), rdfModel.samm.RdfType(), rdfModel.samm.Property()),
    );
    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.example:1.0.0#myProperty'), rdfModel.samm.ExampleValueProperty(), blankValue),
    );
    store.addQuad(DataFactory.quad(blankValue, rdfModel.samm.RdfType(), rdfModel.samm.Value()));
    store.addQuad(DataFactory.quad(blankValue, rdfModel.samm.ValueProperty(), DataFactory.literal('42')));
    store.addQuad(DataFactory.quad(blankValue, rdfModel.samm.DescriptionProperty(), DataFactory.literal('The answer to everything', 'en')));

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain(':myProperty a samm:Property;');
    expect(serialized).toContain('samm:exampleValue [');
    expect(serialized).toContain('a samm:Value;');
    expect(serialized).toContain('samm:value "42"');
    expect(serialized).toContain('samm:description "The answer to everything"@en');
    expect(serialized).not.toContain('_:b0');
  });

  it('should serialize anonymous samm:Value in list correctly', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:com.example:1.0.0');
    const listHead = DataFactory.blankNode('b_list');
    const blankValue = DataFactory.blankNode('b_val');

    store.addQuad(
      DataFactory.quad(
        DataFactory.namedNode('urn:samm:com.example:1.0.0#TrafficLight'),
        rdfModel.samm.RdfType(),
        rdfModel.sammC.EnumerationCharacteristic(),
      ),
    );
    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.example:1.0.0#TrafficLight'), rdfModel.sammC.ValuesProperty(), listHead),
    );
    store.addQuad(DataFactory.quad(listHead, rdfModel.samm.RdfFirst(), blankValue));
    store.addQuad(DataFactory.quad(listHead, rdfModel.samm.RdfRest(), rdfModel.samm.RdfNil()));

    store.addQuad(DataFactory.quad(blankValue, rdfModel.samm.RdfType(), rdfModel.samm.Value()));
    store.addQuad(DataFactory.quad(blankValue, rdfModel.samm.ValueProperty(), DataFactory.literal('red')));
    store.addQuad(DataFactory.quad(blankValue, rdfModel.samm.PreferredNameProperty(), DataFactory.literal('Critical Warning', 'en')));

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain(':TrafficLight a samm-c:Enumeration;');
    expect(serialized).toContain('samm-c:values ([');
    expect(serialized).toContain('a samm:Value;');
    expect(serialized).toContain('samm:value "red"');
    expect(serialized).toContain('samm:preferredName "Critical Warning"@en');
    expect(serialized).not.toContain('_:b_val');
  });

  it('should serialize empty lists as () instead of []', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:com.example:1.0.0');
    const emptyOpsList = DataFactory.blankNode('b_ops');
    const emptyEventsList = DataFactory.blankNode('b_events');

    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.example:1.0.0#AspectDefault'), rdfModel.samm.RdfType(), rdfModel.samm.Aspect()),
    );
    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.example:1.0.0#AspectDefault'), rdfModel.samm.OperationsProperty(), emptyOpsList),
    );
    store.addQuad(DataFactory.quad(emptyOpsList, rdfModel.samm.RdfRest(), rdfModel.samm.RdfNil()));

    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.example:1.0.0#AspectDefault'), rdfModel.samm.EventsProperty(), emptyEventsList),
    );
    store.addQuad(DataFactory.quad(emptyEventsList, rdfModel.samm.RdfRest(), rdfModel.samm.RdfNil()));

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain(':AspectDefault a samm:Aspect;');
    expect(serialized).toContain('samm:operations ()');
    expect(serialized).toContain('samm:events ()');
    expect(serialized).not.toContain('samm:operations []');
    expect(serialized).not.toContain('samm:events []');
  });

  it('should serialize anonymous inline enumeration characteristic with values list correctly', () => {
    const store = new Store();
    const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:com.examples:1.0.0');
    const blankChar = DataFactory.blankNode('b_char');
    const listHead = DataFactory.blankNode('b_list1');
    const listSecond = DataFactory.blankNode('b_list2');

    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.examples:1.0.0#property1'), rdfModel.samm.RdfType(), rdfModel.samm.Property()),
    );
    store.addQuad(
      DataFactory.quad(DataFactory.namedNode('urn:samm:com.examples:1.0.0#property1'), rdfModel.samm.CharacteristicProperty(), blankChar),
    );
    store.addQuad(DataFactory.quad(blankChar, rdfModel.samm.RdfType(), rdfModel.sammC.EnumerationCharacteristic()));
    store.addQuad(
      DataFactory.quad(
        blankChar,
        DataFactory.namedNode('urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#dataType'),
        DataFactory.namedNode(`${Samm.XSD_URI}#string`),
      ),
    );
    store.addQuad(DataFactory.quad(blankChar, rdfModel.sammC.ValuesProperty(), listHead));
    store.addQuad(DataFactory.quad(listHead, rdfModel.samm.RdfFirst(), DataFactory.literal('DD')));
    store.addQuad(DataFactory.quad(listHead, rdfModel.samm.RdfRest(), listSecond));
    store.addQuad(DataFactory.quad(listSecond, rdfModel.samm.RdfFirst(), DataFactory.literal('gege')));
    store.addQuad(DataFactory.quad(listSecond, rdfModel.samm.RdfRest(), rdfModel.samm.RdfNil()));

    const serialized = service.serializeModel(rdfModel);
    expect(serialized).toContain(':property1 a samm:Property;');
    expect(serialized).toContain('samm:characteristic [');
    expect(serialized).toContain('a samm-c:Enumeration;');
    expect(serialized).toContain('samm:dataType xsd:string;');
    expect(serialized).toContain('samm-c:values ("DD" "gege")');
    expect(serialized).not.toContain('_:b_char');
    expect(serialized).not.toContain('_:b_list1');
    expect(serialized).not.toContain('first');
    expect(serialized).not.toContain('rest');
  });

  describe('prefix preservation', () => {
    const property = DataFactory.namedNode('urn:samm:org.eclipse.esmf:test:1.0.0#prop');
    const sammDescription = DataFactory.namedNode('urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#description');

    function createModel(): RdfModel {
      const store = new Store();
      store.addQuad(property, sammDescription, DataFactory.literal('A property', 'en'));
      const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:org.eclipse.esmf:test:1.0.0');
      rdfModel.addPrefix('ex', 'http://example.com#');
      return rdfModel;
    }

    it('should drop unused prefixes which were not declared explicitly', () => {
      const serialized = service.serializeModel(createModel());
      expect(serialized).not.toContain('@prefix ex:');
    });

    it('should keep explicit prefixes even when no statement uses them', () => {
      const rdfModel = createModel();
      rdfModel.serializationMetadata.markPrefixExplicit('ex');

      expect(service.serializeModel(rdfModel)).toContain('@prefix ex: <http://example.com#>.');
    });

    it('should not keep an explicit prefix which was removed from the model', () => {
      const rdfModel = createModel();
      rdfModel.serializationMetadata.markPrefixExplicit('ex');
      rdfModel.removePrefix('ex');

      expect(service.serializeModel(rdfModel)).not.toContain('@prefix ex:');
    });
  });

  describe('element order', () => {
    const NS = 'urn:samm:org.eclipse.esmf:test:1.0.0#';
    const SAMM = 'urn:samm:org.eclipse.esmf.samm:meta-model:2.2.0#';
    const node = (name: string) => DataFactory.namedNode(`${NS}${name}`);
    const samm = (name: string) => DataFactory.namedNode(`${SAMM}${name}`);
    const rdfType = DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    it('should write the subjects in the resolved order and the attributes in SAMM order', () => {
      const order = [`${NS}b`, `${NS}a`];
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          RdfSerializerService,
          {provide: LanguageTranslationService, useValue: translationService},
          {provide: ModelDocumentService, useValue: {resolveSubjectOrder: () => order}},
        ],
      });
      const orderedService = TestBed.inject(RdfSerializerService);

      const store = new Store();
      store.addQuad(node('a'), samm('description'), DataFactory.literal('A', 'en'));
      store.addQuad(node('a'), rdfType, samm('Property'));
      store.addQuad(node('b'), samm('see'), DataFactory.namedNode('http://example.com/b'));
      store.addQuad(node('b'), samm('description'), DataFactory.literal('B', 'en'));
      store.addQuad(node('b'), samm('preferredName'), DataFactory.literal('B', 'en'));
      store.addQuad(node('b'), rdfType, samm('Property'));
      const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:org.eclipse.esmf:test:1.0.0');

      const serialized = orderedService.serializeModel(rdfModel);

      expect(serialized.indexOf(':b')).toBeLessThan(serialized.indexOf(':a'));
      const b = serialized.slice(serialized.indexOf(':b'), serialized.indexOf(':a'));
      const positions = ['a samm:Property', 'samm:preferredName', 'samm:description', 'samm:see'].map(text => b.indexOf(text));
      expect(positions.every(position => position >= 0)).toBe(true);
      expect([...positions].sort((x, y) => x - y)).toEqual(positions);
    });

    it('should write every statement and list exactly once', () => {
      const ttl = `@prefix samm: <${SAMM}> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix : <${NS}> .

:SimpleAspect a samm:Aspect ;
   samm:properties ( :property1 [ samm:property :property2 ; samm:optional true ] ) ;
   samm:operations ( ) ;
   samm:events ( ) .

:property1 a samm:Property ;
   samm:characteristic :Characteristic1 .

:property2 a samm:Property ;
   samm:characteristic :Characteristic1 .

:Characteristic1 a samm:Characteristic ;
   samm:dataType xsd:string .
`;
      const order = ['SimpleAspect', 'property1', 'property2', 'Characteristic1'].map(name => `${NS}${name}`);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          RdfSerializerService,
          {provide: LanguageTranslationService, useValue: translationService},
          {provide: ModelDocumentService, useValue: {resolveSubjectOrder: () => order}},
        ],
      });
      const orderedService = TestBed.inject(RdfSerializerService);
      const store = new Store(new Parser().parse(ttl));
      const rdfModel = new RdfModel(store, '2.2.0', 'urn:samm:org.eclipse.esmf:test:1.0.0');

      const serialized = orderedService.serializeModel(rdfModel);
      const count = (text: string) => serialized.split(text).length - 1;

      expect(count('samm:properties')).toBe(1);
      expect(count('samm:operations')).toBe(1);
      expect(count('samm:events')).toBe(1);
      expect(count('samm:dataType')).toBe(1);
      expect(count(':property1')).toBe(2);
      expect(count('samm:property :property2')).toBe(1);
      expect(serialized).not.toContain('rdf:first');

      const reparsed = new Store(new Parser().parse(serialized));
      expect(reparsed.size).toBe(store.size);
    });
  });
});
