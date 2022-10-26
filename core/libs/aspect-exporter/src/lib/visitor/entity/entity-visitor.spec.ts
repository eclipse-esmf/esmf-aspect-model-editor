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

import {DefaultEntity, DefaultProperty, OverWrittenProperty} from '@ame/meta-model';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {provideMockObject} from 'jest-helpers';
import {Store} from 'n3';
import {MxGraphService} from '@ame/mx-graph';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '@ame/aspect-exporter';
import {EntityVisitor} from './entity-visitor';
import {Bamm} from '@ame/vocabulary';

describe('Entity Visitor', () => {
  let service: EntityVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;
  let rdfListService: jest.Mocked<RdfListService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let rdfService: jest.Mocked<RdfService>;
  let entity: DefaultEntity;
  let property: DefaultProperty;
  let overwrittenProperty: OverWrittenProperty;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntityVisitor,
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
      BAMM: jest.fn(() => new Bamm('')),
      BAMMC: jest.fn(() => ({ConstraintProperty: () => 'constraintProperty'} as any)),
      hasNamespace: jest.fn(() => false),
      addPrefix: jest.fn(() => {}),
    } as any;
    modelService.getLoadedAspectModel.mockImplementation(() => ({rdfModel} as any));
    entity = new DefaultEntity('1', 'bamm#entity1', 'entity1', null);
    property = new DefaultProperty('1', 'bamm#property1', 'property1', null);
    overwrittenProperty = {property: property, keys: {}};
    entity.properties = [overwrittenProperty];

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    rdfService = TestBed.inject(RdfService) as jest.Mocked<RdfService>;
    rdfService.currentRdfModel = rdfModel;
    rdfService.externalRdfModels = [];

    rdfListService = TestBed.inject(RdfListService) as jest.Mocked<RdfListService>;
    service = TestBed.inject(EntityVisitor);
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
    });
    expect(rdfListService.push).toHaveBeenCalledWith(entity, {property: property, keys: {}});
  });
});
