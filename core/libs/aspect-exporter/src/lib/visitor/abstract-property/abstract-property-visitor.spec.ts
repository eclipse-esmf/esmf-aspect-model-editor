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

import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, RdfModel, Samm} from '@esmf/aspect-model-loader';
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
  let abstractProperty: DefaultEntity;

  beforeEach(() => {
    rdfModel = {
      store: new Store(),
      SAMM: jest.fn(() => new Samm('')),
      hasNamespace: jest.fn(() => false),
      addPrefix: jest.fn(() => {}),
    } as any;

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
        {
          provide: ModelService,
          useValue: {
            get currentRdfModel() {
              return rdfModel;
            },
          },
        },
      ],
    });

    modelService = TestBed.inject(ModelService) as jest.Mocked<ModelService>;
    abstractProperty = new DefaultEntity({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#abstractProperty1',
      name: 'abstractProperty1',
      isAbstract: true,
    });

    rdfService = TestBed.inject(RdfService) as jest.Mocked<RdfService>;
    rdfService.currentRdfModel = rdfModel;
    rdfService.externalRdfModels = [];

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
