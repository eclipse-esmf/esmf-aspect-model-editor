import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {FiltersService} from '@ame/loader-filters';
import {
  ConstraintRenderService,
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphService,
  MaxGraphShapeOverlayService,
} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
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
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ConstraintModelService} from './constraint-model.service';

describe('ConstraintModelService', () => {
  let service: ConstraintModelService;
  let mockConstraintRenderer: any;
  let mockMaxgraphService: any;
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

    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      removeCells: vi.fn(),
    };
    mockConstraintRenderer = {update: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        ConstraintModelService,
        {provide: MaxGraphShapeOverlayService, useValue: {checkAndAddTopShapeActionIcon: vi.fn(), checkAndAddShapeActionIcon: vi.fn()}},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: ConstraintRenderService, useValue: mockConstraintRenderer},
        {provide: FiltersService, useValue: {createNode: vi.fn()}},
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
    const cell1 = new Cell();
    MaxGraphHelper.setElementNode(cell1, {element: fixed} as any);
    service.update(cell1, {name: 'fixed', scale: 2, integer: 4});
    expect(fixed.scale).toBe(2);
    expect(fixed.integer).toBe(4);

    const enc = new DefaultEncodingConstraint({name: 'enc', aspectModelUrn: 'urn:test#enc', metaModelVersion: '2.2.0', value: 'ASCII'});
    const cell2 = new Cell();
    MaxGraphHelper.setElementNode(cell2, {element: enc} as any);
    service.update(cell2, {name: 'enc', value: 'UTF-8'});
    expect(enc.value).toBe('UTF-8');

    const lang = new DefaultLanguageConstraint({
      name: 'lang',
      aspectModelUrn: 'urn:test#lang',
      metaModelVersion: '2.2.0',
      languageCode: 'en',
    });
    const cell3 = new Cell();
    MaxGraphHelper.setElementNode(cell3, {element: lang} as any);
    service.update(cell3, {name: 'lang', languageCode: 'de'});
    expect(lang.languageCode).toBe('de');

    const len = new DefaultLengthConstraint({name: 'len', aspectModelUrn: 'urn:test#len', metaModelVersion: '2.2.0'});
    const cell4 = new Cell();
    MaxGraphHelper.setElementNode(cell4, {element: len} as any);
    service.update(cell4, {name: 'len', minValue: 1, maxValue: 10});
    expect(len.minValue).toBe(1);
    expect(len.maxValue).toBe(10);

    const loc = new DefaultLocaleConstraint({name: 'loc', aspectModelUrn: 'urn:test#loc', metaModelVersion: '2.2.0', localeCode: 'de-DE'});
    const cell5 = new Cell();
    MaxGraphHelper.setElementNode(cell5, {element: loc} as any);
    service.update(cell5, {name: 'loc', localeCode: 'en-US'});
    expect(loc.localeCode).toBe('en-US');

    const range = new DefaultRangeConstraint({name: 'range', aspectModelUrn: 'urn:test#range', metaModelVersion: '2.2.0'});
    const cell6 = new Cell();
    MaxGraphHelper.setElementNode(cell6, {element: range} as any);
    service.update(cell6, {name: 'range', minValue: 5, maxValue: 20, upperBoundDefinition: 'LESS_THAN', lowerBoundDefinition: 'AT_LEAST'});
    expect(range.minValue).toBe(5);
    expect(range.maxValue).toBe(20);

    const regex = new DefaultRegularExpressionConstraint({
      name: 'regex',
      aspectModelUrn: 'urn:test#regex',
      metaModelVersion: '2.2.0',
      value: '.*',
    });
    const cell7 = new Cell();
    MaxGraphHelper.setElementNode(cell7, {element: regex} as any);
    service.update(cell7, {name: 'regex', value: '^[0-9]+$'});
    expect(regex.value).toBe('^[0-9]+$');
  });

  it('should delete constraint cell', () => {
    const constraint = new DefaultConstraint({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: constraint} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
