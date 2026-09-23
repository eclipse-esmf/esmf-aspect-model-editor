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

import {beforeEach, describe, expect, it, Mock, vi} from 'vitest';

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

import {LoadedFilesService, NamespaceFile} from '@ame/cache';
import {TestBed} from '@angular/core/testing';
import {DefaultValue, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfNodeService} from '../../rdf-node';
import {ValueVisitor} from './value-visitor';

describe('ValueVisitor', () => {
  let service: ValueVisitor;
  let rdfNodeServiceUpdate: Mock;

  const store = new Store();
  const addQuadSpy = vi.spyOn(store, 'addQuad');

  const rdfModel: RdfModel = {
    store,
    samm: new Samm(''),
    hasDependency: vi.fn(() => false),
    addPrefix: vi.fn(),
  } as any;

  const defaultValue = new DefaultValue({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#old',
    name: 'value1',
    value: 'http://example.com/value_test',
    isPredefined: false,
    preferredNames: new Map([['en', 'Value EN']]),
    descriptions: new Map([['en', 'Description EN']]),
  } as any);

  beforeEach(() => {
    rdfNodeServiceUpdate = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        ValueVisitor,
        MockProvider(RdfNodeService, {update: rdfNodeServiceUpdate}),
        MockProvider(LoadedFilesService, {
          currentLoadedFile: new NamespaceFile(rdfModel, new ModelElementCache(), null),
          externalFiles: [],
        }),
      ],
    });

    service = TestBed.inject(ValueVisitor);
    addQuadSpy.mockClear();
    rdfNodeServiceUpdate.mockClear();
  });

  it('should update aspectModelUrn to include name and calls rdfNodeService.update', () => {
    const updated = service.visit(defaultValue);

    expect(updated).toBe(defaultValue);
    expect(defaultValue.aspectModelUrn).toBe('samm#value1');
    expect(rdfNodeServiceUpdate).toHaveBeenCalledWith(defaultValue, {
      preferredName: [{language: 'en', value: 'Value EN'}],
      description: [{language: 'en', value: 'Description EN'}],
      see: [],
    });
    expect(addQuadSpy).toHaveBeenCalledWith(
      DataFactory.namedNode('samm#value1'),
      rdfModel.samm.ValueProperty(),
      DataFactory.literal('http://example.com/value_test', DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#string')),
    );
  });

  it('should skip export when value is anonymous and no customSubject is provided', () => {
    const anonValue = new DefaultValue({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#[Value]_1234',
      name: '[Value]',
      value: '42',
      isAnonymous: true,
    } as any);

    const result = service.visit(anonValue);

    expect(result).toBe(anonValue);
    expect(rdfNodeServiceUpdate).not.toHaveBeenCalled();
    expect(addQuadSpy).not.toHaveBeenCalled();
  });

  it('should export with customSubject when value is anonymous', () => {
    const anonValue = new DefaultValue({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#[Value]_1234',
      name: '[Value]',
      value: '42',
      isAnonymous: true,
      preferredNames: new Map([['en', 'The Answer']]),
    } as any);

    const blankNode = DataFactory.blankNode();
    const result = service.visit(anonValue, blankNode);

    expect(result).toBe(anonValue);
    expect(rdfNodeServiceUpdate).toHaveBeenCalledWith(
      anonValue,
      {
        preferredName: [{language: 'en', value: 'The Answer'}],
        description: [],
        see: [],
      },
      blankNode,
    );
    expect(addQuadSpy).toHaveBeenCalledWith(
      blankNode,
      rdfModel.samm.ValueProperty(),
      DataFactory.literal('42', DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#string')),
    );
  });

  it('should export with integer datatype when customDataTypeUrn is integer', () => {
    const anonValue = new DefaultValue({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#[Value]_1234',
      name: '[Value]',
      value: '42',
      isAnonymous: true,
    } as any);

    const blankNode = DataFactory.blankNode();
    service.visit(anonValue, blankNode, 'http://www.w3.org/2001/XMLSchema#integer');

    expect(addQuadSpy).toHaveBeenCalledWith(
      blankNode,
      rdfModel.samm.ValueProperty(),
      DataFactory.literal('42', DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#integer')),
    );
  });
});
