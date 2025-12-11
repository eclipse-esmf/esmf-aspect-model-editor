/*
 * Copyright (c) 2025 Robert Bosch Manufacturing Solutions GmbH
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
import {TestBed} from '@angular/core/testing';
import {DefaultValue, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {DataFactory, Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfNodeService} from '../../rdf-node';
import {ValueVisitor} from './value-visitor';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

jest.mock('@esmf/aspect-model-loader', () => {
  class NamedElement {}
  class Samm {
    constructor(public base: string) {}
    ValueProperty() {
      return DataFactory.namedNode('http://samm/value');
    }
  }
  class DefaultValue extends NamedElement {
    metaModelVersion!: string;
    aspectModelUrn!: string;
    name!: string;
    value!: string;
    isPredefined?: boolean;

    constructor(data: any) {
      super();
      Object.assign(this, data);
    }
    getPreferredName(lang: string) {
      if (lang === 'en') return 'Value EN';
      return undefined;
    }
    getDescription(lang: string) {
      if (lang === 'en') return 'Description EN';
      return undefined;
    }
    getSee() {
      return [];
    }

    getValue() {
      return this.value;
    }
  }
  class ModelElementCache {}
  return {DefaultValue, Samm, ModelElementCache};
});

jest.mock('@ame/utils', () => ({
  getPreferredNamesLocales: (v: any) => ['en'],
  getDescriptionsLocales: (v: any) => ['en'],
}));

describe('ValueVisitor', () => {
  let service: ValueVisitor;
  let rdfNodeServiceUpdate: jest.Mock;

  const store = new Store();
  const addQuadSpy = jest.spyOn(store, 'addQuad');

  const rdfModel: RdfModel = {
    store,
    samm: new Samm(''),
    hasDependency: jest.fn(() => false),
    addPrefix: jest.fn(),
  } as any;

  const defaultValue = new DefaultValue({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#old',
    name: 'value1',
    value: 'http://example.com/value_test',
    isPredefined: false,
  });

  beforeEach(() => {
    rdfNodeServiceUpdate = jest.fn();

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
  });
});
