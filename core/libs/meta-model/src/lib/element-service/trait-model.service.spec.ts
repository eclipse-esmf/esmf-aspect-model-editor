import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {ShapeConnectorService} from '@ame/connection';
import {EditorService} from '@ame/editor';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphShapeOverlayService, TraitRenderService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultTrait} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TraitModelService} from './trait-model.service';

describe('TraitModelService', () => {
  let service: TraitModelService;
  let mockMaxgraphService: any;
  let mockTraitRenderer: any;

  beforeEach(() => {
    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      removeCells: vi.fn(),
      formatShapes: vi.fn(),
    };
    mockTraitRenderer = {update: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        TraitModelService,
        {
          provide: MaxGraphShapeOverlayService,
          useValue: {
            checkAndAddTopShapeActionIcon: vi.fn(),
            checkAndAddShapeActionIcon: vi.fn(),
            removeOverlay: vi.fn(),
            removeOverlaysByConnection: vi.fn(),
            addTopShapeOverlay: vi.fn(),
            addBottomShapeOverlay: vi.fn(),
          },
        },
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: ShapeConnectorService, useValue: {connectShapes: vi.fn()}},
        {provide: TraitRenderService, useValue: mockTraitRenderer},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(false),
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

    service = TestBed.inject(TraitModelService);
  });

  it('should identify applicable DefaultTrait', () => {
    const trait = new DefaultTrait({name: 'T', aspectModelUrn: 'urn:test#T', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(trait)).toBe(true);
  });

  it('should update trait and call traitRenderer.update', () => {
    const trait = new DefaultTrait({name: 'T', aspectModelUrn: 'urn:test#T', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: trait} as any);

    service.update(cell, {name: 'TUpdated'});
    expect(trait.name).toBe('TUpdated');
    expect(mockTraitRenderer.update).toHaveBeenCalledWith({cell});
  });

  it('should delete trait cell', () => {
    const trait = new DefaultTrait({name: 'T', aspectModelUrn: 'urn:test#T', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: trait} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
