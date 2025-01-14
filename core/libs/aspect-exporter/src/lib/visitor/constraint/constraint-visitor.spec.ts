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

import {TestBed} from '@angular/core/testing';

import {RdfNodeService} from '@ame/aspect-exporter';
import {BoundDefinition} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {RdfService} from '@ame/rdf/services';
import {
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
  Samm,
} from '@esmf/aspect-model-loader';
import {describe, expect, it} from '@jest/globals';
import {Store} from 'n3';
import {MockProviders} from 'ng-mocks';
import {RdfListService} from '../../rdf-list';
import {ConstraintVisitor} from './constraint-visitor';

describe('Constraint Visitor', () => {
  let service: ConstraintVisitor;

  const rdfModel = {
    store: new Store(),
    SAMM: jest.fn(() => new Samm('')),
    SAMMC: jest.fn(() => ({ConstraintProperty: () => 'constraintProperty'}) as any),
    hasNamespace: jest.fn(() => false),
    addPrefix: jest.fn(() => {}),
  };
  const constraint = new DefaultConstraint({metaModelVersion: '1', aspectModelUrn: 'samm#constraint1', name: 'constraint1'});
  const rangeConstraint = new DefaultRangeConstraint({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#rangeConstraint',
    name: 'rangeConstraint',
    upperBoundDefinition: BoundDefinition.AT_MOST,
    lowerBoundDefinition: BoundDefinition.AT_LEAST,
    minValue: 0,
    maxValue: 100,
  });
  const fixedPointConstraint = new DefaultFixedPointConstraint({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#fixedPointConstraint',
    name: 'fixedPointConstraint',
    scale: 1,
    integer: 2,
  });
  const lengthConstraint = new DefaultLengthConstraint({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#lengthConstraint',
    name: 'lengthConstraint',
    minValue: 100,
    maxValue: 200,
  });
  const languageConstraint = new DefaultLanguageConstraint({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#languageConstraint',
    name: 'languageConstraint',
    languageCode: 'en',
  });
  const encodingConstraint = new DefaultEncodingConstraint({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#encodingConstraint',
    name: 'encodingConstraint',
    value: 'encodingValue',
  });
  const regularExpressionConstraint = new DefaultRegularExpressionConstraint({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#regularExpressionConstraint',
    name: 'regularExpressionConstraint',
    value: 'regularExpressionValue',
  });
  const localeConstraint = new DefaultLocaleConstraint({
    metaModelVersion: '1',
    aspectModelUrn: 'samm#localeConstraint',
    name: 'localeConstraint',
    localeCode: 'en',
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConstraintVisitor,
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

    service = TestBed.inject(ConstraintVisitor);
  });

  it('should update store with default constraint properties', () => {
    service.visit(constraint);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(constraint, {
      preferredName: [],
      description: [],
      see: [],
    });
  });

  it('should update store with default range constraint properties', () => {
    service.visit(rangeConstraint);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(rangeConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(rangeConstraint, {
      upperBoundDefinition: BoundDefinition.AT_MOST,
      lowerBoundDefinition: BoundDefinition.AT_LEAST,
      minValue: 0,
      maxValue: 100,
    });
  });

  it('should update store with default fixed point constraint properties', () => {
    service.visit(fixedPointConstraint);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(fixedPointConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(fixedPointConstraint, {
      scale: 1,
      integer: 2,
    });
  });

  it('should update store with default length constraint properties', () => {
    service.visit(lengthConstraint);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(lengthConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(lengthConstraint, {
      minValue: 100,
      maxValue: 200,
    });
  });

  it('should update store with default language constraint properties', () => {
    service.visit(languageConstraint);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(languageConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(languageConstraint, {
      languageCode: 'en',
    });
  });

  it('should update store with default encoding constraint properties', () => {
    service.visit(encodingConstraint);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(encodingConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(encodingConstraint, {
      value: 'encodingValue',
    });
  });

  it('should update store with default regular expression constraint properties', () => {
    service.visit(regularExpressionConstraint);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(regularExpressionConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(regularExpressionConstraint, {
      value: 'regularExpressionValue',
    });
  });

  it('should update store with default locale constraint properties', () => {
    service.visit(localeConstraint);

    expect(service.rdfNodeService.update).toHaveBeenCalledWith(localeConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(service.rdfNodeService.update).toHaveBeenCalledWith(localeConstraint, {
      localeCode: 'en',
    });
  });
});
