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

import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {provideMockObject} from 'src/app/jest-helpers/utils';
import {DefaultAspect} from 'src/app/shared/aspect-meta-model/default-aspect';
import {DefaultEntity} from 'src/app/shared/aspect-meta-model/default-entity';
import {DefaultProperty} from 'src/app/shared/aspect-meta-model/default-property';
import {RdfModel} from 'src/app/shared/model';
import {ModelService} from 'src/app/shared/model.service';
import {MxGraphService} from 'src/app/shared/mx-graph/mx-graph.service';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {PropertyVisitor} from './property-visitor';

describe('Property Visitor', () => {
  let service: PropertyVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;
  let rdfListService: jest.Mocked<RdfListService>;
  let mxGraphService: jest.Mocked<MxGraphService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let property: DefaultProperty;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PropertyVisitor,
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
      ],
    });

    modelService = provideMockObject(ModelService);
    rdfModel = provideMockObject(RdfModel);
    rdfModel.store = new Store();
    modelService.getLoadedAspectModel.mockImplementation(() => ({rdfModel} as any));
    property = new DefaultProperty('1', 'bamm#property1', 'property1', null);

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    rdfListService = TestBed.inject(RdfListService) as jest.Mocked<RdfListService>;
    mxGraphService = TestBed.inject(MxGraphService) as jest.Mocked<MxGraphService>;
    service = TestBed.inject(PropertyVisitor);
  });

  const getPropertyCell = () => ({
    getMetaModelElement: jest.fn(() => property),
  });

  it('should update store width default properties', () => {
    const propertyCell = getPropertyCell();
    service.visit(propertyCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(property, {
      notInPayload: false,
      payloadName: undefined,
      exampleValue: undefined,
      optional: false,
      refines: undefined,
      preferredName: [],
      description: [],
      see: [],
      name: 'property1',
    });
  });

  it('should update the parents parent with the new property reference', () => {
    const propertyCell = getPropertyCell();
    property.name = 'property2';

    const parents = [new DefaultAspect('1', 'aspect', 'aspect', [property]), new DefaultEntity('1', 'entity', 'entity', [property])];
    mxGraphService.resolveParents.mockImplementation(() => parents.map(parent => ({getMetaModelElement: () => parent} as any)));

    expect(property.aspectModelUrn).toBe('bamm#property1');

    service.visit(propertyCell as any);

    expect(property.aspectModelUrn).toBe('bamm#property2');
    expect(rdfListService.remove).toHaveBeenNthCalledWith(1, parents[0], property);
    expect(rdfListService.remove).toHaveBeenNthCalledWith(2, parents[1], property);
    expect(rdfListService.push).toHaveBeenNthCalledWith(1, parents[0], property);
    expect(rdfListService.push).toHaveBeenNthCalledWith(2, parents[1], property);

    expect(rdfNodeService.update).toHaveBeenCalledWith(property, {
      notInPayload: false,
      payloadName: undefined,
      exampleValue: undefined,
      optional: false,
      refines: undefined,
      preferredName: [],
      description: [],
      see: [],
      name: 'property2',
    });
  });
});
