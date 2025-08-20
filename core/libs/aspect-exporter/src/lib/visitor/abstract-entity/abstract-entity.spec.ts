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
import {MxGraphService} from '@ame/mx-graph';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultProperty, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {MockProvider, MockProviders} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {AbstractEntityVisitor} from './abstract-entity';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

describe('Abstract Entity Visitor', () => {
  let service: AbstractEntityVisitor;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    hasDependency: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  } as any;
  const property: DefaultProperty = new DefaultProperty({name: '', metaModelVersion: '', aspectModelUrn: '', characteristic: null});
  const entity = new DefaultEntity({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#abstractEntity1',
    name: 'abstractEntity1',
    properties: [property],
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AbstractEntityVisitor,
        MockProviders(MxGraphService),
        MockProvider(RdfListService, {
          push: jest.fn(),
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

    service = TestBed.inject(AbstractEntityVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(entity);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfListService.push).toHaveBeenCalledWith(entity, property);
  });

  it('should update entity name', () => {
    entity.name = 'entity2';
    service.visit(entity);
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(entity.aspectModelUrn).toBe('samm#entity2');
  });
});
