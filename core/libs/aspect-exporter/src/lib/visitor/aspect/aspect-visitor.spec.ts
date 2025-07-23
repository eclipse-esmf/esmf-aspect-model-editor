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
import {DefaultAspect, DefaultProperty, ModelElementCache, RdfModel, Samm} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {MockProvider, MockProviders} from 'ng-mocks';
import {ListProperties, RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {AspectVisitor} from './aspect-visitor';

jest.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

describe('Aspect Visitor', () => {
  let service: AspectVisitor;

  const rdfModel: RdfModel = {
    store: new Store(),
    samm: new Samm(''),
    hasDependency: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  } as any;

  const aspect = new DefaultAspect({metaModelVersion: '1', aspectModelUrn: 'samm#aspect', name: 'aspect1'});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AspectVisitor,
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

    service = TestBed.inject(AspectVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(aspect);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(aspect, {
      preferredName: [],
      description: [],
      see: [],
    });

    expect(service.rdfListService.createEmpty).toHaveBeenCalledWith(aspect, ListProperties.properties);
    expect(service.rdfListService.createEmpty).toHaveBeenCalledWith(aspect, ListProperties.operations);
    expect(service.rdfListService.createEmpty).toHaveBeenCalledWith(aspect, ListProperties.events);

    const property = new DefaultProperty({metaModelVersion: '2', aspectModelUrn: 'samm#property', name: 'property1'});
    aspect.properties = [property];

    service.visit(aspect);

    expect(service.rdfListService.push).toHaveBeenCalledWith(aspect, property);
  });

  it('should update aspect name', () => {
    service.visit(aspect);
    aspect.name = 'aspect2';

    service.visit(aspect);
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(aspect, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(aspect.aspectModelUrn).toBe('samm#aspect2');
  });
});
