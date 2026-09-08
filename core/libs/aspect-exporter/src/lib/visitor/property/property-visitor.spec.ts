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

import {RdfNodeService} from '@ame/aspect-exporter';
import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {DefaultCharacteristic, DefaultProperty, DefaultValue, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {CharacteristicVisitor} from '../characteristic/characteristic-visitor';
import {ValueVisitor} from '../value/value-visitor';
import {PropertyVisitor} from './property-visitor';

describe('Property Visitor', () => {
  let service: PropertyVisitor;
  let characteristicVisitor: CharacteristicVisitor;
  let valueVisitor: ValueVisitor;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    sammC: {ConstraintProperty: () => 'constraintProperty'} as any,
    hasDependency: vi.fn(() => false),
    addPrefix: vi.fn(() => {}),
  } as any;
  const property = new DefaultProperty({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#property1',
    name: 'property1',
    characteristic: null,
    exampleValue: null,
  });

  beforeEach(() => {
    rdfModel.store.removeQuads(rdfModel.store.getQuads(null, null, null, null));

    TestBed.configureTestingModule({
      providers: [
        PropertyVisitor,
        MockProvider(RdfListService, {
          push: vi.fn(),
          createEmpty: vi.fn(),
        }),
        MockProvider(RdfNodeService, {
          update: vi.fn(),
        }),
        MockProvider(CharacteristicVisitor, {
          visit: vi.fn(),
        }),
        MockProvider(ValueVisitor, {
          visit: vi.fn(),
        }),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, new ModelElementCache(), null),
          externalFiles: [],
        }),
      ],
    });

    service = TestBed.inject(PropertyVisitor);
    characteristicVisitor = TestBed.inject(CharacteristicVisitor);
    valueVisitor = TestBed.inject(ValueVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(property);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(property, {
      preferredName: [],
      description: [],
      see: [],
    });
  });

  it('should export anonymous characteristic using blank node and characteristicVisitor', () => {
    const anonChar = new DefaultCharacteristic({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#_b0',
      name: '[Characteristic]',
      isAnonymous: true,
    });
    const propWithAnon = new DefaultProperty({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#property1',
      name: 'property1',
      characteristic: anonChar,
    });

    service.visit(propWithAnon);

    expect(characteristicVisitor.visit).toHaveBeenCalled();
    const quads = rdfModel.store.getQuads(null, rdfModel.samm.CharacteristicProperty(), null, null);
    expect(quads).toHaveLength(1);
    expect(quads[0].object.termType).toBe('BlankNode');
  });

  it('should export named DefaultValue exampleValue as named node', () => {
    const namedVal = new DefaultValue({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#myVal',
      name: 'myVal',
      value: '42',
      isAnonymous: false,
    } as any);
    const prop = new DefaultProperty({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#property1',
      name: 'property1',
      exampleValue: namedVal,
    });

    service.visit(prop);

    const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#property1'), rdfModel.samm.ExampleValueProperty(), null, null);
    expect(quads).toHaveLength(1);
    expect(quads[0].object.termType).toBe('NamedNode');
    expect(quads[0].object.value).toBe('samm#myVal');
    expect(valueVisitor.visit).not.toHaveBeenCalled();
  });

  it('should export anonymous DefaultValue exampleValue using blank node and valueVisitor', () => {
    const anonVal = new DefaultValue({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#[Value]_1234',
      name: '[Value]',
      value: '42',
      isAnonymous: true,
    } as any);
    const prop = new DefaultProperty({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#property1',
      name: 'property1',
      exampleValue: anonVal,
    });

    service.visit(prop);

    const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#property1'), rdfModel.samm.ExampleValueProperty(), null, null);
    expect(quads).toHaveLength(1);
    expect(quads[0].object.termType).toBe('BlankNode');
    expect(valueVisitor.visit).toHaveBeenCalledWith(anonVal, quads[0].object, expect.any(String));
  });

  it('should pass characteristic integer dataType to exampleValue', () => {
    const intChar = {
      aspectModelUrn: 'samm#characteristic1',
      dataType: {
        urn: 'http://www.w3.org/2001/XMLSchema#integer',
      },
    } as any;
    const anonVal = new DefaultValue({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#[Value]_1234',
      name: '[Value]',
      value: '42',
      isAnonymous: true,
    } as any);
    const prop = new DefaultProperty({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#property1',
      name: 'property1',
      characteristic: intChar,
      exampleValue: anonVal,
    });

    service.visit(prop);

    const quads = rdfModel.store.getQuads(DataFactory.namedNode('samm#property1'), rdfModel.samm.ExampleValueProperty(), null, null);
    expect(quads).toHaveLength(1);
    expect(valueVisitor.visit).toHaveBeenCalledWith(anonVal, quads[0].object, 'http://www.w3.org/2001/XMLSchema#integer');
  });
});
