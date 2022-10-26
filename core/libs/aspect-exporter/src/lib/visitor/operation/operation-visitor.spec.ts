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
import {provideMockObject} from '../../../../../../jest-helpers';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '@ame/aspect-exporter';
import {OperationVisitor} from './operation-visitor';
import {DefaultOperation} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {RdfModel} from '@ame/rdf/utils';
import {ModelService, RdfService} from '@ame/rdf/services';
import {Bamm} from '@ame/vocabulary';

describe('Operation Visitor', () => {
  let service: OperationVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;
  let rdfService: jest.Mocked<RdfService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let operation: DefaultOperation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OperationVisitor,
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
    operation = new DefaultOperation('1', 'bamm#operation1', 'operation1', [], null);

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    rdfService = TestBed.inject(RdfService) as jest.Mocked<RdfService>;
    rdfService.currentRdfModel = rdfModel;
    rdfService.externalRdfModels = [];

    service = TestBed.inject(OperationVisitor);
  });

  const getOperationCell = () => ({
    getMetaModelElement: jest.fn(() => operation),
  });

  it('should update store width default operations', () => {
    const propertyCell = getOperationCell();
    service.visit(propertyCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(operation, {
      preferredName: [],
      description: [],
      see: [],
    });
  });
});
