import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, PredefinedEntitiesEnum} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelRootService} from '../model-root.service';
import {Point3dRemoveService} from './point3d-remove.service';

describe('Point3dRemoveService', () => {
  let service: Point3dRemoveService;
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
        Point3dRemoveService,
        {provide: ModelRootService, useValue: mockModelRootService},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
      ],
    });

    service = TestBed.inject(Point3dRemoveService);
  });

  it('should return false if cell is not predefined', () => {
    mockModelRootService.isPredefined.mockReturnValue(false);
    const cell = new Cell();
    expect(service.delete(cell)).toBe(false);
  });

  it('should remove tree for Point3d entity', () => {
    mockModelRootService.isPredefined.mockReturnValue(true);
    const entity = new DefaultEntity({
      name: PredefinedEntitiesEnum.Point3d,
      aspectModelUrn: 'urn:test#Point3d',
      metaModelVersion: '2.2.0',
      isPredefined: true,
    });
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: entity} as any);

    const result = service.delete(cell);
    expect(result).toBe(true);
  });

  it('should decouple Point3d entity', () => {
    mockModelRootService.isPredefined.mockReturnValue(true);
    const entity = new DefaultEntity({
      name: PredefinedEntitiesEnum.Point3d,
      aspectModelUrn: 'urn:test#Point3d',
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
