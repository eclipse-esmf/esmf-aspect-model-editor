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

import {DefaultAbstractProperty} from '@ame/meta-model';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {Bamm} from '@ame/vocabulary';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {provideMockObject} from 'jest-helpers';
import {Store} from 'n3';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {AbstractPropertyVisitor} from './abstract-property-visitor';

describe('Property Visitor', () => {
  let service: AbstractPropertyVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let rdfService: jest.Mocked<RdfService>;
  let abstractProperty: DefaultAbstractProperty;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AbstractPropertyVisitor,
        {
          provide: RdfNodeService,
          useValue: provideMockObject(RdfNodeService),
        },
        {
          provide: RdfService,
          useValue: provideMockObject(RdfService),
        },
      ],
    });

    modelService = provideMockObject(ModelService);
    rdfModel = {
      store: new Store(),
      BAMM: jest.fn(() => new Bamm('')),
      hasNamespace: jest.fn(() => false),
      addPrefix: jest.fn(() => {}),
    } as any;

    modelService.getLoadedAspectModel.mockImplementation(() => ({rdfModel} as any));
    abstractProperty = new DefaultAbstractProperty('1', 'bamm#abstractProperty1', 'abstractProperty1', null);

    rdfService = TestBed.inject(RdfService) as jest.Mocked<RdfService>;
    rdfService.currentRdfModel = rdfModel;
    rdfService.externalRdfModels = [];

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    service = TestBed.inject(AbstractPropertyVisitor);
  });

  const getPropertyCell = () => ({
    getMetaModelElement: jest.fn(() => abstractProperty),
  });

  it('should update store width default properties', () => {
    const propertyCell = getPropertyCell();
    service.visit(propertyCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(abstractProperty, {
      description: [],
      exampleValue: null,
      preferredName: [],
      see: [],
    });
  });
});
