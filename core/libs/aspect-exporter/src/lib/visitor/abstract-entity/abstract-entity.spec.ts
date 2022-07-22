/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {DefaultAbstractEntity, DefaultProperty, OverWrittenProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {provideMockObject} from 'jest-helpers';
import {Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {AbstractEntityVisitor} from './abstract-entity';

describe('Abstract Entity Visitor', () => {
  let service: AbstractEntityVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;
  let rdfListService: jest.Mocked<RdfListService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let rdfService: jest.Mocked<RdfService>;
  let entity: DefaultAbstractEntity;
  const property: OverWrittenProperty = {property: new DefaultProperty('', '', '', null, ''), keys: {}};

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AbstractEntityVisitor,
        {
          provide: RdfNodeService,
          useValue: provideMockObject(RdfNodeService),
        },
        {
          provide: RdfListService,
          useValue: provideMockObject(RdfListService),
        },
        {
          provide: MxGraphService,
          useValue: provideMockObject(MxGraphService),
        },
        {
          provide: RdfService,
          useValue: provideMockObject(RdfService),
        },
      ],
    });

    modelService = provideMockObject(ModelService);
    rdfModel = provideMockObject(RdfModel);
    rdfModel.store = new Store();
    modelService.getLoadedAspectModel.mockImplementation(() => ({rdfModel} as any));
    entity = new DefaultAbstractEntity('1', 'bamm#abstractEntity1', 'abstractEntity1', null);
    entity.properties = [property];

    rdfService = TestBed.inject(RdfService) as jest.Mocked<RdfService>;
    rdfService.currentRdfModel = rdfModel;
    rdfService.externalRdfModels = [];

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    rdfListService = TestBed.inject(RdfListService) as jest.Mocked<RdfListService>;
    service = TestBed.inject(AbstractEntityVisitor);
  });

  const getEntityCell = () => ({
    getMetaModelElement: jest.fn(() => entity),
  });

  it('should update store width default properties', () => {
    const entityCell = getEntityCell();
    service.visit(entityCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
      name: 'abstractEntity1',
    });
    expect(rdfListService.push).toHaveBeenCalledWith(entity, property);
  });

  it('should update entity name', () => {
    const entityCell = getEntityCell();
    entity.name = 'entity2';
    service.visit(entityCell as any);
    expect(rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
      name: 'entity2',
    });
    expect(entity.aspectModelUrn).toBe('bamm#entity2');
  });
});
