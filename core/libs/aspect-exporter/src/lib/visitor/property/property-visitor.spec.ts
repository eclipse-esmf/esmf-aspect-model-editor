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
import {MxGraphService} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultProperty, Samm} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {MockProviders} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {PropertyVisitor} from './property-visitor';

describe('Property Visitor', () => {
  let service: PropertyVisitor;

  const rdfModel = {
    store: new Store(),
    SAMM: jest.fn(() => new Samm('')),
    SAMMC: jest.fn(() => ({ConstraintProperty: () => 'constraintProperty'}) as any),
    hasNamespace: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  };
  const property = new DefaultProperty({metaModelVersion: '1', aspectModelUrn: 'samm#property1', name: 'property1', characteristic: null});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PropertyVisitor,
        MockProviders(MxGraphService),
        {
          provide: RdfListService,
          useValue: {
            push: jest.fn(),
          },
        },
        {
          provide: RdfNodeService,
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: RdfService,
          useValue: {
            currentRdfModel: rdfModel,
            externalRdfModels: [],
          },
        },
      ],
    });

    service = TestBed.inject(PropertyVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(property);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(property, {
      exampleValue: undefined,
      preferredName: [],
      description: [],
      see: [],
    });
  });
});
