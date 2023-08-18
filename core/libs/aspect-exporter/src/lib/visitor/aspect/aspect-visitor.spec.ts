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
import {RdfService} from '@ame/rdf/services';
import {Samm} from '@ame/vocabulary';
import {MockProviders} from 'ng-mocks';

describe('Aspect Visitor', () => {
  let service: AspectVisitor;

  const rdfModel = {
    store: new Store(),
    SAMM: jest.fn(() => new Samm('')),
    hasNamespace: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  };
  const aspect = new DefaultAspect('1', 'samm#aspect', 'aspect1', null);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AspectVisitor,
        MockProviders(MxGraphService),
        {
          provide: RdfListService,
          useValue: {
            push: jest.fn(),
            createEmpty: jest.fn(),
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

    const property = new DefaultProperty('2', 'samm#property', 'property1', null);
    aspect.properties = [{property, keys: {}}];

    service.visit(aspect);

    expect(service.rdfListService.push).toHaveBeenCalledWith(aspect, {property, keys: {}});
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
