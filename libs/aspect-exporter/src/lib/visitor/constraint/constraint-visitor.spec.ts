import {TestBed} from '@angular/core/testing';
import {
  DefaultConstraint,
  DefaultRangeConstraint,
  DefaultFixedPointConstraint,
  DefaultLengthConstraint,
  DefaultLanguageConstraint,
  DefaultEncodingConstraint,
  DefaultRegularExpressionConstraint,
  DefaultLocaleConstraint,
  BoundDefinition,
} from '@bame/meta-model';
import {MxGraphService} from '@bame/mx-graph';
import {ModelService} from '@bame/rdf/services';
import {RdfModel} from '@bame/rdf/utils';
import {describe, expect, it} from '@jest/globals';
import {provideMockObject} from 'jest-helpers/utils';
import {Store} from 'n3';
import {RdfListService} from '../../rdf-list';
import {RdfNodeService} from '../../rdf-node/rdf-node.service';
import {ConstraintVisitor} from './constraint-visitor';

describe('Constraint Visitor', () => {
  let service: ConstraintVisitor;
  let rdfNodeService: jest.Mocked<RdfNodeService>;

  let modelService: jest.Mocked<ModelService>;
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
    rdfModel.BAMMC.mockImplementation(() => ({ConstraintProperty: () => 'constraintProperty'} as any));
    modelService.getLoadedAspectModel.mockImplementation(() => ({rdfModel} as any));
    constraint = new DefaultConstraint('1', 'bamm#constraint1', 'constraint1');
    rangeConstraint = new DefaultRangeConstraint(
      '1',
      'bamm#rangeConstraint',
      'rangeConstraint',
      BoundDefinition.AT_MOST,
      BoundDefinition.AT_LEAST,
      0,
      100
    );
    fixedPointConstraint = new DefaultFixedPointConstraint('1', 'bamm#fixedPointConstraint', 'fixedPointConstraint', 1, 2);
    lengthConstraint = new DefaultLengthConstraint('1', 'bamm#lengthConstraint', 'lengthConstraint', 100, 200);
    languageConstraint = new DefaultLanguageConstraint('1', 'bamm#languageConstraint', 'languageConstraint', 'en');
    encodingConstraint = new DefaultEncodingConstraint('1', 'bamm#encodingConstraint', 'encodingConstraint', 'encodingValue');
    regularExpressionConstraint = new DefaultRegularExpressionConstraint(
      '1',
      'bamm#regularExpressionConstraint',
      'regularExpressionConstraint',
      'regularExpressionValue'
    );
    localeConstraint = new DefaultLocaleConstraint('1', 'bamm#localeConstraint', 'localeConstraint', 'en');

    rdfNodeService = TestBed.inject(RdfNodeService) as jest.Mocked<RdfNodeService>;
    rdfNodeService.modelService = modelService;

    service = TestBed.inject(ConstraintVisitor);
  });

  const getConstraintCell = (c: DefaultConstraint) => ({
    getMetaModelElement: jest.fn(() => c),
  });

  it('should update store with default constraint properties', () => {
    const constraintCell = getConstraintCell(constraint);
    service.visit(constraintCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(constraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'constraint1',
    });
  });

  it('should update store with default range constraint properties', () => {
    const constraintCell = getConstraintCell(rangeConstraint);
    service.visit(constraintCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(rangeConstraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'rangeConstraint',
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(rangeConstraint, {
      upperBoundDefinition: BoundDefinition.AT_MOST,
      lowerBoundDefinition: BoundDefinition.AT_LEAST,
      minValue: 0,
      maxValue: 100,
    });
  });

  it('should update store with default fixed point constraint properties', () => {
    const constraintCell = getConstraintCell(fixedPointConstraint);
    service.visit(constraintCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(fixedPointConstraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'fixedPointConstraint',
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(fixedPointConstraint, {
      scale: 1,
      integer: 2,
    });
  });

  it('should update store with default length constraint properties', () => {
    const constraintCell = getConstraintCell(lengthConstraint);
    service.visit(constraintCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(lengthConstraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'lengthConstraint',
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(lengthConstraint, {
      minValue: 100,
      maxValue: 200,
    });
  });

  it('should update store with default language constraint properties', () => {
    const constraintCell = getConstraintCell(languageConstraint);
    service.visit(constraintCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(languageConstraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'languageConstraint',
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(languageConstraint, {
      languageCode: 'en',
    });
  });

  it('should update store with default encoding constraint properties', () => {
    const constraintCell = getConstraintCell(encodingConstraint);
    service.visit(constraintCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(encodingConstraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'encodingConstraint',
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(encodingConstraint, {
      value: 'encodingValue',
    });
  });

  it('should update store with default regular expression constraint properties', () => {
    const constraintCell = getConstraintCell(regularExpressionConstraint);
    service.visit(constraintCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(regularExpressionConstraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'regularExpressionConstraint',
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(regularExpressionConstraint, {
      value: 'regularExpressionValue',
    });
  });

  it('should update store with default locale constraint properties', () => {
    const constraintCell = getConstraintCell(localeConstraint);
    service.visit(constraintCell as any);

    expect(rdfNodeService.update).toHaveBeenCalledWith(localeConstraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'localeConstraint',
    });
    expect(rdfNodeService.update).toHaveBeenCalledWith(localeConstraint, {
      localeCode: 'en',
    });
  });

  it('should update constraint name', () => {
    const constraintCell = getConstraintCell(constraint);
    constraint.name = 'constraint2';
    service.visit(constraintCell as any);
    expect(rdfNodeService.remove).toHaveBeenCalled();
    expect(rdfNodeService.update).toHaveBeenCalledWith(constraint, {
      preferredName: [],
      description: [],
      see: [],
      name: 'constraint2',
    });
    expect(constraint.aspectModelUrn).toBe('bamm#constraint2');
  });
});
