import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, PredefinedEntitiesEnum} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelRootService} from '../model-root.service';
import {FileResourceRemoveService} from './file-resource-remove.service';

describe('FileResourceRemoveService', () => {
  let service: FileResourceRemoveService;
  let mockModelRootService: any;
  let mockMaxgraphService: any;
  let graph: Graph;

  beforeEach(() => {
    graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      resolveParents: vi.fn().mockReturnValue([]),
    };
    mockModelRootService = {
      isPredefined: vi.fn().mockReturnValue(true),
      getElementModelService: vi.fn().mockReturnValue({delete: vi.fn()}),
    };

    TestBed.configureTestingModule({
      providers: [
        FileResourceRemoveService,
        {provide: ModelRootService, useValue: mockModelRootService},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
      ],
    });

    service = TestBed.inject(FileResourceRemoveService);
  });

  it('should return false if cell is null or not predefined', () => {
    expect(service.delete(null as any)).toBe(false);

    mockModelRootService.isPredefined.mockReturnValue(false);
    const cell = new Cell();
    expect(service.delete(cell)).toBe(false);
  });

  it('should remove tree for FileResource entity', () => {
    mockModelRootService.isPredefined.mockReturnValue(true);
    const entity = new DefaultEntity({
      name: PredefinedEntitiesEnum.FileResource,
      aspectModelUrn: 'urn:test#FileResource',
      metaModelVersion: '2.2.0',
      isPredefined: true,
    });
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: entity} as any);

    const result = service.delete(cell);
    expect(result).toBe(true);
  });

  it('should decouple FileResource entity', () => {
    mockModelRootService.isPredefined.mockReturnValue(true);
    const entity = new DefaultEntity({
      name: PredefinedEntitiesEnum.FileResource,
      aspectModelUrn: 'urn:test#FileResource',
      metaModelVersion: '2.2.0',
      isPredefined: true,
    });
    const edge = new Cell();
    edge.source = new Cell();
    MaxGraphHelper.setElementNode(edge.source, {element: entity} as any);

    const result = service.decouple(edge, entity);
    expect(result).toBe(true);
  });
});
