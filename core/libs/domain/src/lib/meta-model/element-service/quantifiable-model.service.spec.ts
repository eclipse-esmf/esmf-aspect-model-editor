import {LoadedFilesService, ModelApiService, ModelService, RdfService} from '@ame/infrastructure';
import {setElementNode} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultQuantifiable, DefaultUnit} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {QuantifiableModelService} from './quantifiable-model.service';

describe('QuantifiableModelService', () => {
  let service: QuantifiableModelService;
  let mockGraphAdapter: Partial<GraphAdapterPort>;

  beforeEach(() => {
    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      removeCells: vi.fn(),
      checkAndAddTopShapeActionIcon: vi.fn(),
      checkAndAddShapeActionIcon: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        QuantifiableModelService,
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
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

    const cell: any = {};
    setElementNode(cell, {element: quantifiable});

    service.update(cell, {unit});
    expect(quantifiable.unit).toBe(unit);
  });

  it('should delete quantifiable cell', () => {
    const quantifiable = new DefaultQuantifiable({name: 'Q', aspectModelUrn: 'urn:test#Q', metaModelVersion: '2.2.0'});
    const cell: any = {};
    setElementNode(cell, {element: quantifiable});

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
