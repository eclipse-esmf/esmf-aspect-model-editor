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

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEither,
  DefaultEntity,
  DefaultEnumeration,
  DefaultEvent,
  DefaultFixedPointConstraint,
  DefaultLengthConstraint,
  DefaultOperation,
  DefaultProperty,
  DefaultRangeConstraint,
  DefaultState,
  DefaultUnit,
  DefaultValue,
  NamedElement,
  RdfModel,
  Samm,
  SammC,
  SammU,
  Type,
} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {describe, expect, test, vi} from 'vitest';
import {RdfModelUtil} from './rdf-model-util';

describe('Test RDF Model Util', () => {
  describe('getDataType', () => {
    test('should return Urn', () => {
      const expectedUrnResult = 'expectedUrnResult';
      const dataType = {
        getUrn: () => expectedUrnResult,
      } as Type;
      const result = RdfModelUtil.getDataType(dataType);
      expect(result?.value).toBe(expectedUrnResult);
    });

    test('should return null', () => {
      const dataType = {
        getUrn: () => null,
      } as Type;

      const result = RdfModelUtil.getDataType(dataType);

      expect(result?.value).toBe(null);
    });

    test('should return null because no dataType', () => {
      expect(RdfModelUtil.getDataType(null)).toBe(null);
    });
  });

  describe('isSammUDefinition', () => {
    test('should return true if urn contains sammU namespace', () => {
      const samm = new Samm('2.2.0');
      const sammU = new SammU(samm);
      const urn = `${sammU.getNamespace()}metre`;

      expect(RdfModelUtil.isSammUDefinition(urn, sammU)).toBe(true);
    });

    test('should return false if urn is falsy or does not contain sammU namespace', () => {
      const samm = new Samm('2.2.0');
      const sammU = new SammU(samm);

      expect(RdfModelUtil.isSammUDefinition('', sammU)).toBeFalsy();
      expect(RdfModelUtil.isSammUDefinition('urn:samm:custom#metre', sammU)).toBe(false);
    });
  });

  describe('isCharacteristicInstance', () => {
    test('should return true if urn contains sammC namespace', () => {
      const samm = new Samm('2.2.0');
      const sammC = new SammC(samm);
      const urn = `${sammC.getNamespace()}Text`;

      expect(RdfModelUtil.isCharacteristicInstance(urn, sammC)).toBe(true);
    });

    test('should return false if urn does not contain sammC namespace', () => {
      const samm = new Samm('2.2.0');
      const sammC = new SammC(samm);

      expect(RdfModelUtil.isCharacteristicInstance('', sammC)).toBeFalsy();
      expect(RdfModelUtil.isCharacteristicInstance('urn:samm:custom#Text', sammC)).toBe(false);
    });
  });

  describe('getValueWithoutUrnDefinition and getValuesWithoutUrnDefinition', () => {
    test('should return empty string for falsy value', () => {
      expect(RdfModelUtil.getValueWithoutUrnDefinition(null as unknown as string)).toBe('');
      expect(RdfModelUtil.getValueWithoutUrnDefinition('')).toBe('');
    });

    test('should return name when value is NamedElement', () => {
      const element = new DefaultAspect({name: 'TestAspect', aspectModelUrn: 'urn#TestAspect', metaModelVersion: '2.2.0'});
      expect(RdfModelUtil.getValueWithoutUrnDefinition(element)).toBe('TestAspect');
    });

    test('should return value string when value is a Value instance', () => {
      const val = new DefaultValue({name: 'val', value: '42', aspectModelUrn: 'urn#val', metaModelVersion: '2.2.0'});
      expect(RdfModelUtil.getValueWithoutUrnDefinition(val)).toBe('42');
    });

    test('should extract fragment when value is a URN string', () => {
      expect(RdfModelUtil.getValueWithoutUrnDefinition('urn:samm:org.eclipse.esmf:test:1.0.0#TestProperty')).toBe('TestProperty');
      expect(RdfModelUtil.getValueWithoutUrnDefinition(`${Samm.XSD_URI}#integer`)).toBe('integer');
      expect(RdfModelUtil.getValueWithoutUrnDefinition(`${Samm.RDF_URI}#langString`)).toBe('langString');
    });

    test('should return plain string as is', () => {
      expect(RdfModelUtil.getValueWithoutUrnDefinition('plainTextValue')).toBe('plainTextValue');
    });

    test('should join multiple values with comma', () => {
      const element = new DefaultAspect({name: 'AspectA', aspectModelUrn: 'urn#AspectA', metaModelVersion: '2.2.0'});
      const list = [element, 'urn:samm:org.eclipse.esmf:test:1.0.0#PropertyB', 'plain'];

      expect(RdfModelUtil.getValuesWithoutUrnDefinition(list)).toBe('AspectA, PropertyB, plain');
    });
  });

  describe('resolveAccurateType', () => {
    let expectedElementUrn: string;
    const rdfModel = new RdfModel(new Store(), '2.2.0', null);
    const sammC = rdfModel.sammC;
    const samm = rdfModel.samm;

    test('should return DefaultLengthConstraint urn', () => {
      expectedElementUrn = sammC.MinValueProperty().value;
      const metaModelElement = new DefaultLengthConstraint({name: '', aspectModelUrn: '', metaModelVersion: ''});

      RdfModelUtil.getDataType = vi.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toHaveBeenCalled();
    });

    test('should return DefaultFixedPointConstraint urn', () => {
      expectedElementUrn = sammC.ScaleProperty().value;
      const metaModelElement = new DefaultFixedPointConstraint({name: '', aspectModelUrn: '', metaModelVersion: '', scale: 0, integer: 0});

      RdfModelUtil.getDataType = vi.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toHaveBeenCalled();
    });

    test('should return DefaultProperty urn', () => {
      expectedElementUrn = samm.ExampleValueProperty().value;
      const metaModelElement = new DefaultProperty({name: '', aspectModelUrn: '', metaModelVersion: ''});

      RdfModelUtil.getDataType = vi.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toHaveBeenCalled();
    });

    test('should return DefaultRangeConstraint urn', () => {
      expectedElementUrn = sammC.MinValueProperty().value;
      const metaModelElement = new DefaultRangeConstraint({name: '', aspectModelUrn: '', metaModelVersion: ''});

      RdfModelUtil.getDataType = vi.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toHaveBeenCalled();
    });

    test('should return DefaultEnumeration urn', () => {
      expectedElementUrn = sammC.ValuesProperty().value;
      const metaModelElement = new DefaultEnumeration({name: '', aspectModelUrn: '', metaModelVersion: '', values: []});

      RdfModelUtil.getDataType = vi.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toHaveBeenCalled();
    });

    test('should return DefaultState urn', () => {
      expectedElementUrn = sammC.DefaultValueProperty().value;
      const metaModelElement = new DefaultState({name: '', aspectModelUrn: '', metaModelVersion: '', values: [], defaultValue: null});

      RdfModelUtil.getDataType = vi.fn().mockReturnValueOnce(expectedElementUrn);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(expectedElementUrn);
      expect(RdfModelUtil.getDataType).toHaveBeenCalled();
    });

    test('should return NULL', () => {
      expectedElementUrn = null;
      const metaModelElement = new DefaultState({name: '', aspectModelUrn: '', metaModelVersion: '', values: [], defaultValue: null});

      RdfModelUtil.getDataType = vi.fn().mockReturnValueOnce(null);

      expect(RdfModelUtil.resolveAccurateType(metaModelElement, expectedElementUrn, rdfModel, null)).toBe(null);
      expect(RdfModelUtil.getDataType).toHaveBeenCalledTimes(0);
    });
  });

  describe('resolvePredicate', () => {
    const rdfModel = new RdfModel(new Store(), '2.2.0', null);
    const samm = rdfModel.samm;
    const sammC = rdfModel.sammC;
    test('should return properties property', () => {
      const parent = new DefaultAspect({name: '', aspectModelUrn: 'urn#aspect', metaModelVersion: ''});
      const child = new DefaultProperty({name: '', aspectModelUrn: 'urn#property', metaModelVersion: ''});

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toEqual(samm.PropertiesProperty());
    });

    test('should return operations property', () => {
      const parent = new DefaultAspect({name: '', aspectModelUrn: 'urn#aspect', metaModelVersion: ''});
      const child = new DefaultOperation({name: '', aspectModelUrn: 'urn#operation', metaModelVersion: '', input: [], output: null});

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toEqual(samm.OperationsProperty());
    });

    test('should return characteristic property', () => {
      const parent = new DefaultProperty({name: '', aspectModelUrn: 'urn#property', metaModelVersion: ''});
      const child = new DefaultCharacteristic({name: '', aspectModelUrn: '', metaModelVersion: ''});

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toEqual(samm.CharacteristicProperty());
    });

    test('should return type property', () => {
      const parent = new DefaultCharacteristic({name: '', aspectModelUrn: '', metaModelVersion: ''});
      const child = new DefaultEntity({name: '', aspectModelUrn: '', metaModelVersion: ''});

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toEqual(samm.DataTypeProperty());
    });

    test('should return properties property', () => {
      const parent = new DefaultEntity({name: '', aspectModelUrn: '', metaModelVersion: ''});
      const child = Object.create(DefaultProperty.prototype);

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toEqual(samm.PropertiesProperty());
    });

    test('should return right property', () => {
      const parent = new DefaultEither({name: '', aspectModelUrn: '', metaModelVersion: '', left: null, right: null});
      const rightPropertyUrn = 'rightPropertyUrn';
      parent.right = {aspectModelUrn: rightPropertyUrn} as any;

      const child = new DefaultCharacteristic({name: '', aspectModelUrn: '', metaModelVersion: ''});
      child.aspectModelUrn = rightPropertyUrn;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toEqual(sammC.EitherRightProperty());
    });

    test('should return left property', () => {
      const parent = new DefaultEither({name: '', aspectModelUrn: '', metaModelVersion: '', left: null, right: null});
      const leftPropertyUrn = 'leftPropertyUrn';
      parent.left = {aspectModelUrn: leftPropertyUrn} as any;
      parent.right = null;

      const child = new DefaultCharacteristic({name: '', aspectModelUrn: '', metaModelVersion: ''});
      child.aspectModelUrn = leftPropertyUrn;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toEqual(sammC.EitherLeftProperty());
    });

    test('should return NULL', () => {
      const parent = new DefaultEither({name: '', aspectModelUrn: '', metaModelVersion: '', left: null, right: null});
      const propertyUrn = 'propertyUrn';
      parent.right = null;
      parent.left = null;

      const child = new DefaultCharacteristic({name: '', aspectModelUrn: '', metaModelVersion: ''});
      child.aspectModelUrn = propertyUrn;

      expect(RdfModelUtil.resolvePredicate(child, parent, rdfModel)).toEqual(null);
    });
  });

  describe('getFullQualifiedModelName', () => {
    test('should return full qualified model name for various elements', () => {
      const version = '2.2.0';
      const aspect = new DefaultAspect({name: 'TestAspect', aspectModelUrn: 'urn#a', metaModelVersion: version});
      expect(RdfModelUtil.getFullQualifiedModelName(aspect)).toContain('Aspect');

      const operation = new DefaultOperation({
        name: 'TestOp',
        aspectModelUrn: 'urn#op',
        metaModelVersion: version,
        input: [],
        output: null,
      });
      expect(RdfModelUtil.getFullQualifiedModelName(operation)).toContain('Operation');

      const event = new DefaultEvent({name: 'TestEvent', aspectModelUrn: 'urn#ev', metaModelVersion: version});
      expect(RdfModelUtil.getFullQualifiedModelName(event)).toContain('Event');

      const val = new DefaultValue({name: 'val', value: '1', aspectModelUrn: 'urn#val', metaModelVersion: version});
      expect(RdfModelUtil.getFullQualifiedModelName(val)).toContain('Value');

      const prop = new DefaultProperty({name: 'TestProp', aspectModelUrn: 'urn#prop', metaModelVersion: version});
      expect(RdfModelUtil.getFullQualifiedModelName(prop)).toContain('Property');

      const abstractProp = new DefaultProperty({
        name: 'AbsProp',
        aspectModelUrn: 'urn#absprop',
        metaModelVersion: version,
        isAbstract: true,
      });
      expect(RdfModelUtil.getFullQualifiedModelName(abstractProp)).toContain('AbstractProperty');

      const entity = new DefaultEntity({name: 'TestEntity', aspectModelUrn: 'urn#entity', metaModelVersion: version, properties: []});
      expect(RdfModelUtil.getFullQualifiedModelName(entity)).toContain('Entity');

      const unit = new DefaultUnit({name: 'second', aspectModelUrn: 'urn#unit', metaModelVersion: version, quantityKinds: []});
      expect(RdfModelUtil.getFullQualifiedModelName(unit)).toBeDefined();

      const unknownElement = {className: 'UnknownClass', metaModelVersion: version} as unknown as NamedElement;
      expect(RdfModelUtil.getFullQualifiedModelName(unknownElement)).toBe(':UnknownClass');
    });
  });

  describe('isPredefinedCharacteristic', () => {
    test('should return true for predefined characteristics and false for custom ones', () => {
      const samm = new Samm('2.2.0');
      const sammC = new SammC(samm);

      expect(RdfModelUtil.isPredefinedCharacteristic(`${sammC.getNamespace()}Timestamp`, sammC)).toBe(true);
      expect(RdfModelUtil.isPredefinedCharacteristic(`${sammC.getNamespace()}Text`, sammC)).toBe(true);
      expect(RdfModelUtil.isPredefinedCharacteristic(`${sammC.getNamespace()}CustomCharacteristic`, sammC)).toBe(false);
    });
  });

  describe('isEntityInstance', () => {
    test('should return false if store has no matching quads', () => {
      const store = new Store();
      const rdfModel = new RdfModel(store, '2.2.0', null);
      const loadedFilesService = {
        currentLoadedFile: {rdfModel},
        filesAsList: [],
      } as unknown as LoadedFilesService;

      expect(RdfModelUtil.isEntityInstance('urn:test#Type', loadedFilesService)).toBe(false);
    });

    test('should return true if entity quads exist in current loaded file', () => {
      const store = new Store();
      const rdfModel = new RdfModel(store, '2.2.0', null);
      store.addQuad(DataFactory.namedNode('urn:test#instance'), rdfModel.samm.RdfType(), DataFactory.namedNode('urn:test#EntityDef'));
      store.addQuad(DataFactory.namedNode('urn:test#EntityDef'), rdfModel.samm.RdfType(), rdfModel.samm.Entity());

      const loadedFilesService = {
        currentLoadedFile: {rdfModel},
        filesAsList: [],
      } as unknown as LoadedFilesService;

      expect(RdfModelUtil.isEntityInstance('urn:test#instance', loadedFilesService)).toBe(true);
    });

    test('should return true if entity quads exist in filesAsList', () => {
      const store1 = new Store();
      const rdfModel1 = new RdfModel(store1, '2.2.0', null);
      store1.addQuad(DataFactory.namedNode('urn:test#instance'), rdfModel1.samm.RdfType(), DataFactory.namedNode('urn:test#EntityDef'));

      const store2 = new Store();
      const rdfModel2 = new RdfModel(store2, '2.2.0', null);
      store2.addQuad(DataFactory.namedNode('urn:test#EntityDef'), rdfModel2.samm.RdfType(), rdfModel2.samm.Entity());

      const loadedFilesService = {
        currentLoadedFile: {rdfModel: rdfModel1},
        filesAsList: [{rdfModel: rdfModel2} as NamespaceFile],
      } as unknown as LoadedFilesService;

      expect(RdfModelUtil.isEntityInstance('urn:test#instance', loadedFilesService)).toBe(true);
    });
  });

  describe('resolveExternalNamespaces and resolveSpecificExternalNamespaces', () => {
    test('should resolve external namespaces from rdfModel store entities', () => {
      const store = new Store();
      const rdfModel = new RdfModel(store, '2.2.0', null);
      store['_entities'] = {
        'urn:samm:com.external:model:1.0.0#ExtAspect': 'urn:samm:com.external:model:1.0.0#ExtAspect',
      };

      const result = RdfModelUtil.resolveExternalNamespaces(rdfModel, false);
      expect(result).toContain('urn:samm:com.external:model:1.0.0#');
    });

    test('should resolve specific external namespaces excluding known subjects in store', () => {
      const store = new Store();
      const rdfModel = new RdfModel(store, '2.2.0', null);
      store['_entities'] = {
        'urn:samm:com.external:model:1.0.0#ExtProp': 'urn:samm:com.external:model:1.0.0#ExtProp',
      };

      const result = RdfModelUtil.resolveSpecificExternalNamespaces(rdfModel, false);
      expect(result).toContain('urn:samm:com.external:model:1.0.0#ExtProp');
    });
  });

  describe('splitAspectModelUrnIntoChunks', () => {
    test('should split aspect model URN into 5 chunks', () => {
      const urn = 'urn:samm:org.eclipse.esmf:1.0.0#AspectModel';
      const chunks = RdfModelUtil.splitAspectModelUrnIntoChunks(urn);
      expect(chunks).toEqual(['urn', 'samm', 'org.eclipse.esmf', '1.0.0', 'AspectModel']);
    });

    test('should throw on invalid aspect model URN format', () => {
      expect(() => RdfModelUtil.splitAspectModelUrnIntoChunks('invalid:urn')).toThrow();
    });
  });

  describe('extractCommentsFromRdfContent', () => {
    test('should extract comments prior to @prefix declarations', () => {
      const content = '# Copyright (c) 2026\n# License info\n@prefix : <urn:samm:...> .\n# Ignored comment\n';
      const comments = RdfModelUtil.extractCommentsFromRdfContent(content);

      expect(comments).toEqual(['# Copyright (c) 2026', '# License info']);
    });
  });

  describe('getUrnFromFileName', () => {
    test('should construct URN based on passed file name', () => {
      const fileName = 'namespace_name:1.0.0:Aspect1.ttl';
      const expected = 'urn:samm:namespace_name:1.0.0';
      const expectation = RdfModelUtil.getUrnFromFileName(fileName);
      expect(expectation).toEqual(expected);
    });

    test('should throw on incorrect param', () => {
      const fileName = 'namespace_name';
      const expectation = () => RdfModelUtil.getUrnFromFileName(fileName);
      expect(expectation).toThrow();
    });
  });

  describe('getNamespaceFromRdf', () => {
    test('should return namespace', () => {
      const fileName = 'namespace_name:1.0.0:Aspect1.ttl';
      const expected = 'namespace_name:1.0.0';
      const expectation = RdfModelUtil.getNamespaceFromRdf(fileName);
      expect(expectation).toEqual(expected);
    });

    test('should throw on incorrect param', () => {
      const fileName = 'namespace_name';
      const expectation = () => RdfModelUtil.getNamespaceFromRdf(fileName);
      expect(expectation).toThrow();
    });
  });

  describe('getNamespaceNameFromRdf', () => {
    test('should return namespace name', () => {
      const fileName = 'namespace_name:1.0.0:Aspect1.ttl';
      const expected = 'namespace_name';
      const expectation = RdfModelUtil.getNamespaceNameFromRdf(fileName);
      expect(expectation).toEqual(expected);
    });

    test('should throw on incorrect param', () => {
      const fileName = 'namespace_name';
      const expectation = () => RdfModelUtil.getNamespaceNameFromRdf(fileName);
      expect(expectation).toThrow();
    });
  });

  describe('getNamespaceVersionFromRdf', () => {
    test('should return namespace version', () => {
      const fileName = 'namespace_name:1.0.0:Aspect1.ttl';
      const expected = '1.0.0';
      const expectation = RdfModelUtil.getNamespaceVersionFromRdf(fileName);
      expect(expectation).toEqual(expected);
    });

    test('should throw on incorrect param', () => {
      const fileName = 'namespace_name';
      const expectation = () => RdfModelUtil.getNamespaceVersionFromRdf(fileName);
      expect(expectation).toThrow();
    });
  });

  describe('getFileNameFromRdf', () => {
    test('should return file name', () => {
      const fileName = 'namespace_name:1.0.0:Aspect1.ttl';
      const expected = 'Aspect1.ttl';
      const expectation = RdfModelUtil.getFileNameFromRdf(fileName);
      expect(expectation).toEqual(expected);
    });

    test('should throw on incorrect param', () => {
      const fileName = 'namespace_name';
      const expectation = () => RdfModelUtil.getFileNameFromRdf(fileName);
      expect(expectation).toThrow();
    });
  });

  describe('splitRdfIntoChunks', () => {
    test('should return 3 chunks', () => {
      const fileName = 'namespace_name:1.0.0:Aspect1.ttl';
      const expected = ['namespace_name', '1.0.0', 'Aspect1.ttl'];
      const expectation = RdfModelUtil.splitRdfIntoChunks(fileName);
      expect(expectation).toEqual(expected);
    });

    test('should throw on less chunks', () => {
      const fileName = 'namespace_name:1.0.0';
      const expectation = () => RdfModelUtil.splitRdfIntoChunks(fileName);
      expect(expectation).toThrow();
    });

    test('should throw on more chunks', () => {
      const fileName = 'namespace_name:1.0.0:Aspect1.ttl:something';
      const expectation = () => RdfModelUtil.splitRdfIntoChunks(fileName);
      expect(expectation).toThrow();
    });

    test('should throw on no chunks', () => {
      const fileName = 'namespace_name';
      const expectation = () => RdfModelUtil.splitRdfIntoChunks(fileName);
      expect(expectation).toThrow();
    });

    test('should throw on empty string', () => {
      const fileName = '';
      const expectation = () => RdfModelUtil.splitRdfIntoChunks(fileName);
      expect(expectation).toThrow();
    });

    test('should throw on "null"', () => {
      const fileName = null;
      const expectation = () => RdfModelUtil.splitRdfIntoChunks(fileName);
      expect(expectation).toThrow();
    });
  });

  describe('buildAbsoluteFileName', () => {
    test('should return consolidated file name', () => {
      const namespace = 'namespace_name';
      const namespaceVersion = '1.0.0';
      const fileName = 'Aspect1.ttl';
      const expected = 'namespace_name:1.0.0:Aspect1.ttl';
      const expectation = RdfModelUtil.buildAbsoluteFileName(namespace, namespaceVersion, fileName);
      expect(expectation).toEqual(expected);
    });
  });
});
