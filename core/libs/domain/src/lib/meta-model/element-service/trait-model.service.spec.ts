import {LoadedFilesService, ModelApiService, ModelService, RdfService} from '@ame/infrastructure';
import {GRAPH_ADAPTER, IGraphAdapter, setElementNode} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultTrait} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TraitModelService} from './trait-model.service';

describe('TraitModelService', () => {
  let service: TraitModelService;
  let mockGraphAdapter: Partial<IGraphAdapter>;

  beforeEach(() => {
    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      removeCells: vi.fn(),
      updateCell: vi.fn(),
      checkAndAddTopShapeActionIcon: vi.fn(),
      checkAndAddShapeActionIcon: vi.fn(),
      reconnectTraitShape: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        TraitModelService,
        {provide: GRAPH_ADAPTER, useValue: mockGraphAdapter},
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
    const cell: any = {};
    setElementNode(cell, {element: trait});

    service.update(cell, {name: 'TUpdated'});
    expect(trait.name).toBe('TUpdated');
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
  });

  it('should delete trait cell', () => {
    const trait = new DefaultTrait({name: 'T', aspectModelUrn: 'urn:test#T', metaModelVersion: '2.2.0'});
    const cell: any = {};
    setElementNode(cell, {element: trait});

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
