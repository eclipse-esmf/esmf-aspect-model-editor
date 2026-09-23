import {LoadedFilesService, ModelApiService, ModelService, RdfService} from '@ame/infrastructure';
import {ElementRelationUtil, GRAPH_ADAPTER} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultOperation, DefaultProperty} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {OperationModelService} from './operation-model.service';

describe('OperationModelService', () => {
  let service: OperationModelService;
  let mockGraphAdapter: any;

  beforeEach(() => {
    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      updateCell: vi.fn(),
      removeCells: vi.fn(),
      connectOperationProperty: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        OperationModelService,
        {provide: GRAPH_ADAPTER, useValue: mockGraphAdapter},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(true),
            currentLoadedFile: {
              namespace: 'ns',
              rdfModel: {getAspectModelUrn: () => 'urn:test#'},
              cachedFile: {updateElementKey: vi.fn(), removeElement: vi.fn(), resolveInstance: vi.fn(e => e)},
            },
          },
        },
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(OperationModelService);
  });

  it('should identify applicable DefaultOperation', () => {
    const op = new DefaultOperation({name: 'Op', aspectModelUrn: 'urn:test#Op', metaModelVersion: '2.2.0', input: []});
    expect(service.isApplicable(op)).toBe(true);
  });

  it('should update operation with inputs and outputs', () => {
    const op = new DefaultOperation({name: 'Op', aspectModelUrn: 'urn:test#Op', metaModelVersion: '2.2.0', input: []});
    const inProp = new DefaultProperty({name: 'inProp', aspectModelUrn: 'urn:test#inProp', metaModelVersion: '2.2.0'});
    const outProp = new DefaultProperty({name: 'outProp', aspectModelUrn: 'urn:test#outProp', metaModelVersion: '2.2.0'});

    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: op} as any);

    service.update(cell, {
      name: 'OpUpdated',
      inputChipList: [inProp],
      outputValue: outProp,
    });

    expect(op.name).toBe('OpUpdated');
    expect(op.input).toEqual([inProp]);
    expect(op.output).toBe(outProp);
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
  });

  it('should delete operation cell', () => {
    const op = new DefaultOperation({name: 'Op', aspectModelUrn: 'urn:test#Op', metaModelVersion: '2.2.0', input: []});
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: op} as any);

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
