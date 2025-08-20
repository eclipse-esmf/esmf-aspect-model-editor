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
import {ModelService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultProperty, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {MockProvider} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {AbstractPropertyVisitor} from './abstract-property-visitor';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

describe('Property Visitor', () => {
  let service: AbstractPropertyVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;

  let modelService: jest.Mocked<ModelService>;
  let abstractProperty: DefaultProperty;

  beforeEach(() => {
    const rdfModel: RdfModel = {
      store: new Store(),
      samm: new Samm(''),
      hasDependency: jest.fn(() => false),
      addPrefix: jest.fn(() => {}),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AbstractPropertyVisitor,
        MockProvider(MxGraphService),
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

    abstractProperty = new DefaultProperty({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#abstractProperty1',
      name: 'abstractProperty1',
      isAbstract: true,
    });

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    service = TestBed.inject(AbstractPropertyVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(abstractProperty);

    expect(rdfNodeService.update).toHaveBeenCalledWith(abstractProperty, {
      description: [],
      exampleValue: null,
      preferredName: [],
      see: [],
    });
  });
});
