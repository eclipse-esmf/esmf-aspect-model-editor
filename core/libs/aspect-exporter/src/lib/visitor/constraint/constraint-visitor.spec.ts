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
import {
  BoundDefinition,
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
} from '@ame/meta-model';
import {MxGraphService} from '@ame/mx-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {RdfModel} from '@ame/rdf/utils';
import {describe, expect, it} from '@jest/globals';
import {provideMockObject} from 'jest-helpers/utils';
import {Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '@ame/aspect-exporter';
import {ConstraintVisitor} from './constraint-visitor';
import {Samm} from '@ame/vocabulary';

describe('Constraint Visitor', () => {
  let service: ConstraintVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;

  let modelService: jest.Mocked<ModelService>;
  let rdfService: jest.Mocked<RdfService>;
  let rdfModel: jest.Mocked<RdfModel>;
  let constraint: DefaultConstraint;
  let rangeConstraint: DefaultRangeConstraint;
  let fixedPointConstraint: DefaultFixedPointConstraint;
  let lengthConstraint: DefaultLengthConstraint;
  let languageConstraint: DefaultLanguageConstraint;
  let encodingConstraint: DefaultEncodingConstraint;
  let regularExpressionConstraint: DefaultRegularExpressionConstraint;
  let localeConstraint: DefaultLocaleConstraint;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConstraintVisitor,
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
      SAMM: jest.fn(() => new Samm('')),
      SAMMC: jest.fn(() => ({ConstraintProperty: () => 'constraintProperty'} as any)),
      hasNamespace: jest.fn(() => false),
      addPrefix: jest.fn(() => {}),
    } as any;
    modelService.getLoadedAspectModel.mockImplementation(() => ({rdfModel} as any));

    rdfService = TestBed.inject(RdfService) as jest.Mocked<RdfService>;
    rdfService.currentRdfModel = rdfModel;
    rdfService.externalRdfModels = [];

    constraint = new DefaultConstraint('1', 'samm#constraint1', 'constraint1');
    rangeConstraint = new DefaultRangeConstraint(
      '1',
      'samm#rangeConstraint',
      'rangeConstraint',
      BoundDefinition.AT_MOST,
      BoundDefinition.AT_LEAST,
      0,
      100
    );
    fixedPointConstraint = new DefaultFixedPointConstraint('1', 'samm#fixedPointConstraint', 'fixedPointConstraint', 1, 2);
    lengthConstraint = new DefaultLengthConstraint('1', 'samm#lengthConstraint', 'lengthConstraint', 100, 200);
    languageConstraint = new DefaultLanguageConstraint('1', 'samm#languageConstraint', 'languageConstraint', 'en');
    encodingConstraint = new DefaultEncodingConstraint('1', 'samm#encodingConstraint', 'encodingConstraint', 'encodingValue');
    regularExpressionConstraint = new DefaultRegularExpressionConstraint(
      '1',
      'samm#regularExpressionConstraint',
      'regularExpressionConstraint',
      'regularExpressionValue'
    );
    localeConstraint = new DefaultLocaleConstraint('1', 'samm#localeConstraint', 'localeConstraint', 'en');

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    service = TestBed.inject(ConstraintVisitor);
  });

  it('should update store with default constraint properties', () => {
    service.visit(constraint);

    expect(rdfNodeService.update).toHaveBeenCalledWith(constraint, {
      preferredName: [],
      description: [],
      see: [],
    });
  });

  it('should update store with default range constraint properties', () => {
    service.visit(rangeConstraint);

    expect(rdfNodeService.update).toHaveBeenCalledWith(rangeConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(rangeConstraint, {
      upperBoundDefinition: BoundDefinition.AT_MOST,
      lowerBoundDefinition: BoundDefinition.AT_LEAST,
      minValue: 0,
      maxValue: 100,
    });
  });

  it('should update store with default fixed point constraint properties', () => {
    service.visit(fixedPointConstraint);

    expect(rdfNodeService.update).toHaveBeenCalledWith(fixedPointConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(fixedPointConstraint, {
      scale: 1,
      integer: 2,
    });
  });

  it('should update store with default length constraint properties', () => {
    service.visit(lengthConstraint);

    expect(rdfNodeService.update).toHaveBeenCalledWith(lengthConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(lengthConstraint, {
      minValue: 100,
      maxValue: 200,
    });
  });

  it('should update store with default language constraint properties', () => {
    service.visit(languageConstraint);

    expect(rdfNodeService.update).toHaveBeenCalledWith(languageConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(languageConstraint, {
      languageCode: 'en',
    });
  });

  it('should update store with default encoding constraint properties', () => {
    service.visit(encodingConstraint);

    expect(rdfNodeService.update).toHaveBeenCalledWith(encodingConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(encodingConstraint, {
      value: 'encodingValue',
    });
  });

  it('should update store with default regular expression constraint properties', () => {
    service.visit(regularExpressionConstraint);

    expect(rdfNodeService.update).toHaveBeenCalledWith(regularExpressionConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(regularExpressionConstraint, {
      value: 'regularExpressionValue',
    });
  });

  it('should update store with default locale constraint properties', () => {
    service.visit(localeConstraint);

    expect(rdfNodeService.update).toHaveBeenCalledWith(localeConstraint, {
      preferredName: [],
      description: [],
      see: [],
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(localeConstraint, {
      localeCode: 'en',
    });
  });
});
