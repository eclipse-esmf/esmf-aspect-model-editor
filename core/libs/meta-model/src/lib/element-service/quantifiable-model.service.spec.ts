import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultQuantifiable, DefaultUnit} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {QuantifiableModelService} from './quantifiable-model.service';

describe('QuantifiableModelService', () => {
  let service: QuantifiableModelService;
  let mockMaxgraphService: any;

  beforeEach(() => {
    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      removeCells: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        QuantifiableModelService,
        {provide: MaxGraphShapeOverlayService, useValue: {checkAndAddTopShapeActionIcon: vi.fn(), checkAndAddShapeActionIcon: vi.fn()}},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(true),
            currentLoadedFile: {
              namespace: 'ns',
              rdfModel: {getAspectModelUrn: () => 'urn:test#'},
              cachedFile: {updateElementKey: vi.fn(), removeElement: vi.fn()},
            },
          },
        },
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(QuantifiableModelService);
  });

  it('should identify applicable DefaultQuantifiable', () => {
    const quantifiable = new DefaultQuantifiable({name: 'Q', aspectModelUrn: 'urn:test#Q', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(quantifiable)).toBe(true);
  });

  it('should update unit on quantifiable', () => {
    const quantifiable = new DefaultQuantifiable({name: 'Q', aspectModelUrn: 'urn:test#Q', metaModelVersion: '2.2.0'});
    const unit = new DefaultUnit({name: 'meter', aspectModelUrn: 'urn:test#meter', metaModelVersion: '2.2.0', quantityKinds: []});

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: quantifiable} as any);

    service.update(cell, {unit});
    expect(quantifiable.unit).toBe(unit);
  });

  it('should delete quantifiable cell', () => {
    const quantifiable = new DefaultQuantifiable({name: 'Q', aspectModelUrn: 'urn:test#Q', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: quantifiable} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
