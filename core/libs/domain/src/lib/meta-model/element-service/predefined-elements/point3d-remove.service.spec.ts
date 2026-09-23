import {ElementRelationUtil, GRAPH_ADAPTER} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, PredefinedEntitiesEnum} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ModelRootService} from '../model-root.service';
import {Point3dRemoveService} from './point3d-remove.service';

describe('Point3dRemoveService', () => {
  let service: Point3dRemoveService;
  let mockModelRootService: any;
  let mockGraphAdapter: any;

  beforeEach(() => {
    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
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
        {provide: GRAPH_ADAPTER, useValue: mockGraphAdapter},
      ],
    });

    service = TestBed.inject(Point3dRemoveService);
  });

  it('should return false if cell is not predefined', () => {
    mockModelRootService.isPredefined.mockReturnValue(false);
    const cell = {} as any;
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
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: entity} as any);

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
    const edge = {source: {}} as any;
    ElementRelationUtil.setElementNode(edge.source, {element: entity} as any);

    const result = service.decouple(edge, entity);
    expect(result).toBe(true);
  });
});
