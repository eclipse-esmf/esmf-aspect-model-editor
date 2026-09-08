import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {ShapeConnectorService} from '@ame/connection';
import {EditorService} from '@ame/editor';
import {FiltersService} from '@ame/loader-filters';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, OperationRenderService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultOperation, DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {OperationModelService} from './operation-model.service';

describe('OperationModelService', () => {
  let service: OperationModelService;
  let mockMaxgraphService: any;
  let mockOperationRenderer: any;

  beforeEach(() => {
    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      removeCells: vi.fn(),
      resolveCellByModelElement: vi.fn(),
      renderModelElement: vi.fn(),
    };
    mockOperationRenderer = {update: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        OperationModelService,
        {provide: FiltersService, useValue: {createNode: vi.fn()}},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: ShapeConnectorService, useValue: {connectShapes: vi.fn()}},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: OperationRenderService, useValue: mockOperationRenderer},
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
        {provide: EditorService, useValue: {}},
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

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: op} as any);

    service.update(cell, {
      name: 'OpUpdated',
      inputChipList: [inProp],
      outputValue: outProp,
    });

    expect(op.name).toBe('OpUpdated');
    expect(op.input).toEqual([inProp]);
    expect(op.output).toBe(outProp);
    expect(mockOperationRenderer.update).toHaveBeenCalledWith({cell});
  });

  it('should delete operation cell', () => {
    const op = new DefaultOperation({name: 'Op', aspectModelUrn: 'urn:test#Op', metaModelVersion: '2.2.0', input: []});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: op} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
