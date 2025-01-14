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

import {RdfNodeService} from '@ame/aspect-exporter';
import {RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultOperation} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {RdfListService} from '../../rdf-list';
import {OperationVisitor} from './operation-visitor';

describe('Operation Visitor', () => {
  let service: OperationVisitor;
  let rdfNodeService: RdfNodeService;
  let operation: DefaultOperation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OperationVisitor,
        {
          provide: RdfNodeService,
          useValue: {update: jest.fn()},
        },
        {
          provide: RdfService,
          useValue: {
            currentRdfModel: {hasNamespace: jest.fn(() => true)},
            externalRdfModels: [],
          },
        },
        {
          provide: RdfListService,
          useValue: {
            createEmpty: jest.fn(),
          },
        },
      ],
    });

    rdfNodeService = TestBed.inject(RdfNodeService);
    operation = new DefaultOperation({
      metaModelVersion: '1',
      aspectModelUrn: 'samm#operation1',
      name: 'operation1',
      input: [],
      output: null,
    });
    service = TestBed.inject(OperationVisitor);
  });

  it('should update store width default operations', () => {
    service.visit(operation);

    expect(rdfNodeService.update).toHaveBeenCalledWith(operation, {
      preferredName: [],
      description: [],
      see: [],
    });
  });
});
