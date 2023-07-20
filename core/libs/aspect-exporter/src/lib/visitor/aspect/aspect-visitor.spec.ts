/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {TestBed} from '@angular/core/testing';
import {DefaultAspect, DefaultProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {ListProperties, RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {AspectVisitor} from './aspect-visitor';
import {provideMockObject} from 'jest-helpers/utils';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {Samm} from '@ame/vocabulary';

describe('Aspect Visitor', () => {
  let service: AspectVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;
  let rdfService: jest.Mocked<RdfService>;
  let rdfListService: jest.Mocked<RdfListService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let aspect: DefaultAspect;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AspectVisitor,
        {
          provide: RdfNodeService,
          useValue: provideMockObject(RdfNodeService),
        },
        {
          provide: RdfService,
          useValue: provideMockObject(RdfService),
        },
        {
          provide: RdfListService,
          useValue: provideMockObject(RdfListService),
        },
        {
          provide: MxGraphService,
          useValue: provideMockObject(MxGraphService),
        },
      ],
    });

    modelService = provideMockObject(ModelService);
    rdfModel = {
      store: new Store(),
      SAMM: jest.fn(() => new Samm('')),
      hasNamespace: jest.fn(() => false),
      addPrefix: jest.fn(() => {}),
    } as any;
    modelService.getLoadedAspectModel.mockImplementation(() => ({rdfModel} as any));
    aspect = new DefaultAspect('1', 'samm#aspect', 'aspect1', null);

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    rdfService = TestBed.inject(RdfService) as jest.Mocked<RdfService>;
    rdfService.currentRdfModel = rdfModel;
    rdfService.externalRdfModels = [];

    rdfListService = TestBed.inject(RdfListService) as jest.Mocked<RdfListService>;
    service = TestBed.inject(AspectVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(aspect);

    expect(rdfNodeService.update).toHaveBeenCalledWith(aspect, {
      preferredName: [],
      description: [],
      see: [],
    });

    expect(rdfListService.createEmpty).toHaveBeenCalledWith(aspect, ListProperties.properties);
    expect(rdfListService.createEmpty).toHaveBeenCalledWith(aspect, ListProperties.operations);
    expect(rdfListService.createEmpty).toHaveBeenCalledWith(aspect, ListProperties.events);

    const property = new DefaultProperty('2', 'samm#property', 'property1', null);
    aspect.properties = [{property, keys: {}}];

    service.visit(aspect);

    expect(rdfListService.push).toHaveBeenCalledWith(aspect, {property, keys: {}});
  });

  it('should update aspect name', () => {
    service.visit(aspect);
    aspect.name = 'aspect2';
    service.visit(aspect);
    expect(rdfNodeService.update).toHaveBeenCalledWith(aspect, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(aspect.aspectModelUrn).toBe('samm#aspect2');
  });
});
