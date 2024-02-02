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

import {DefaultAbstractEntity, DefaultProperty, OverWrittenProperty} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {Samm} from '@ame/vocabulary';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {AbstractEntityVisitor} from './abstract-entity';
import {MockProviders} from 'ng-mocks';

describe('Abstract Entity Visitor', () => {
  let service: AbstractEntityVisitor;

  const rdfModel = {
    store: new Store(),
    SAMM: jest.fn(() => new Samm('')),
    hasNamespace: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  };
  const property: OverWrittenProperty = {property: new DefaultProperty('', '', '', null), keys: {}};
  const entity = new DefaultAbstractEntity('1', 'samm#abstractEntity1', 'abstractEntity1', [property]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AbstractEntityVisitor,
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

    service = TestBed.inject(AbstractEntityVisitor);
  });

  it('should update store width default properties', () => {
    service.visit(entity);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfListService.push).toHaveBeenCalledWith(entity, property);
  });

  it('should update entity name', () => {
    entity.name = 'entity2';
    service.visit(entity);
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(entity, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(entity.aspectModelUrn).toBe('samm#entity2');
  });
});
