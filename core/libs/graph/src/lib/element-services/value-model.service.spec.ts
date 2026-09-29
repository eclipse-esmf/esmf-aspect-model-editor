import {LoadedFilesService, ModelService} from '@ame/domain';
import {setElementNode} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultValue} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GraphAdapterPort} from '../ports/graph-adapter.port';
import {ValueModelService} from './value-model.service';

describe('ValueModelService', () => {
  let service: ValueModelService;
  let mockGraphAdapter: Partial<GraphAdapterPort>;

  beforeEach(() => {
    mockGraphAdapter = {
      removeCells: vi.fn(),
      updateCell: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ValueModelService,
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
        {provide: ModelService, useValue: {}},
      ],
    });

    service = TestBed.inject(ValueModelService);
  });

  it('should identify applicable DefaultValue', () => {
    const val = new DefaultValue({name: 'V', aspectModelUrn: 'urn:test#V', value: '42', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(val)).toBe(true);
  });

  it('should update value and call valueRenderer.update', () => {
    const val = new DefaultValue({name: 'V', aspectModelUrn: 'urn:test#V', value: '42', metaModelVersion: '2.2.0'});
    const cell: any = {};
    setElementNode(cell, {element: val});

    const form = {name: 'VUpdated', value: '100'};
    service.update(cell, form);
    expect(val.name).toBe('VUpdated');
    expect(val.value).toBe('100');
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
  });

  it('should delete value cell', () => {
    const val = new DefaultValue({name: 'V', aspectModelUrn: 'urn:test#V', value: '42', metaModelVersion: '2.2.0'});
    const cell: any = {};
    setElementNode(cell, {element: val});

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
