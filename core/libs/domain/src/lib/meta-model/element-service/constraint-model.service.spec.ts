import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {ModelService, RdfService} from '@ame/rdf';
import {ElementRelationUtil, GRAPH_ADAPTER} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {
  DefaultConstraint,
  DefaultEncodingConstraint,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConstraintModelService} from './constraint-model.service';

describe('ConstraintModelService', () => {
  let service: ConstraintModelService;
  let mockGraphAdapter: any;
  let mockLoadedFilesService: any;

  beforeEach(() => {
    mockLoadedFilesService = {
      isElementInCurrentFile: vi.fn().mockReturnValue(true),
      currentLoadedFile: {
        namespace: 'org.eclipse.esmf.test',
        rdfModel: {
          getAspectModelUrn: () => 'urn:samm:org.eclipse.esmf.test:1.0.0#',
        },
        cachedFile: {
          updateElementKey: vi.fn(),
          removeElement: vi.fn(),
          resolveInstance: vi.fn(el => el),
        },
      },
    };

    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      updateCell: vi.fn(),
      removeCells: vi.fn(),
      checkAndAddTopShapeActionIcon: vi.fn(),
      checkAndAddShapeActionIcon: vi.fn(),
      resolveCellByModelElement: vi.fn(),
      setElementFilterNode: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ConstraintModelService,
        {provide: GRAPH_ADAPTER, useValue: mockGraphAdapter},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(ConstraintModelService);
  });

  it('should identify applicable DefaultConstraint', () => {
    const constraint = new DefaultConstraint({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(constraint)).toBe(true);
  });

  it('should update specific constraint fields', () => {
    const fixed = new DefaultFixedPointConstraint({
      name: 'fixed',
      aspectModelUrn: 'urn:test#fixed',
      metaModelVersion: '2.2.0',
      scale: 0,
      integer: 0,
    });
    const cell1 = {} as any;
    ElementRelationUtil.setElementNode(cell1, {element: fixed} as any);
    service.update(cell1, {name: 'fixed', scale: 2, integer: 4});
    expect(fixed.scale).toBe(2);
    expect(fixed.integer).toBe(4);

    const enc = new DefaultEncodingConstraint({name: 'enc', aspectModelUrn: 'urn:test#enc', metaModelVersion: '2.2.0', value: 'ASCII'});
    const cell2 = {} as any;
    ElementRelationUtil.setElementNode(cell2, {element: enc} as any);
    service.update(cell2, {name: 'enc', value: 'UTF-8'});
    expect(enc.value).toBe('UTF-8');

    const lang = new DefaultLanguageConstraint({
      name: 'lang',
      aspectModelUrn: 'urn:test#lang',
      metaModelVersion: '2.2.0',
      languageCode: 'en',
    });
    const cell3 = {} as any;
    ElementRelationUtil.setElementNode(cell3, {element: lang} as any);
    service.update(cell3, {name: 'lang', languageCode: 'de'});
    expect(lang.languageCode).toBe('de');

    const len = new DefaultLengthConstraint({name: 'len', aspectModelUrn: 'urn:test#len', metaModelVersion: '2.2.0'});
    const cell4 = {} as any;
    ElementRelationUtil.setElementNode(cell4, {element: len} as any);
    service.update(cell4, {name: 'len', minValue: 1, maxValue: 10});
    expect(len.minValue).toBe(1);
    expect(len.maxValue).toBe(10);

    const loc = new DefaultLocaleConstraint({name: 'loc', aspectModelUrn: 'urn:test#loc', metaModelVersion: '2.2.0', localeCode: 'de-DE'});
    const cell5 = {} as any;
    ElementRelationUtil.setElementNode(cell5, {element: loc} as any);
    service.update(cell5, {name: 'loc', localeCode: 'en-US'});
    expect(loc.localeCode).toBe('en-US');

    const range = new DefaultRangeConstraint({name: 'range', aspectModelUrn: 'urn:test#range', metaModelVersion: '2.2.0'});
    const cell6 = {} as any;
    ElementRelationUtil.setElementNode(cell6, {element: range} as any);
    service.update(cell6, {name: 'range', minValue: 5, maxValue: 20, upperBoundDefinition: 'LESS_THAN', lowerBoundDefinition: 'AT_LEAST'});
    expect(range.minValue).toBe(5);
    expect(range.maxValue).toBe(20);

    const regex = new DefaultRegularExpressionConstraint({
      name: 'regex',
      aspectModelUrn: 'urn:test#regex',
      metaModelVersion: '2.2.0',
      value: '.*',
    });
    const cell7 = {} as any;
    ElementRelationUtil.setElementNode(cell7, {element: regex} as any);
    service.update(cell7, {name: 'regex', value: '^[0-9]+$'});
    expect(regex.value).toBe('^[0-9]+$');
  });

  it('should delete constraint cell', () => {
    const constraint = new DefaultConstraint({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.2.0'});
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: constraint} as any);

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
