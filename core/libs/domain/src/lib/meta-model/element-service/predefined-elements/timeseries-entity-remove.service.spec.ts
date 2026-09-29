import {ElementRelationUtil} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultProperty, PredefinedEntitiesEnum, PredefinedPropertiesEnum} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GraphAdapterPort} from '../../../ports/graph-adapter.port';
import {ModelRootService} from '../model-root.service';
import {TimeSeriesEntityRemoveService} from './timeseries-entity-remove.service';

describe('TimeSeriesEntityRemoveService', () => {
  let service: TimeSeriesEntityRemoveService;
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
        TimeSeriesEntityRemoveService,
        {provide: ModelRootService, useValue: mockModelRootService},
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
      ],
    });

    service = TestBed.inject(TimeSeriesEntityRemoveService);
  });

  it('should remove tree for TimeSeriesEntity', () => {
    const entity = new DefaultEntity({
      name: PredefinedEntitiesEnum.TimeSeriesEntity,
      aspectModelUrn: 'urn:test#TimeSeriesEntity',
      metaModelVersion: '2.2.0',
      isPredefined: true,
    });
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: entity} as any);

    const result = service.delete(cell);
    expect(result).toBe(true);
  });

  it('should remove properties for timestamp/value predefined property', () => {
    const prop = new DefaultProperty({
      name: PredefinedPropertiesEnum.timestamp,
      aspectModelUrn: 'urn:test#timestamp',
      metaModelVersion: '2.2.0',
      isPredefined: true,
    });
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: prop} as any);

    const result = service.delete(cell);
    expect(result).toBe(true);
  });

  it('should decouple TimeSeriesEntity', () => {
    const entity = new DefaultEntity({
      name: PredefinedEntitiesEnum.TimeSeriesEntity,
      aspectModelUrn: 'urn:test#TimeSeriesEntity',
      metaModelVersion: '2.2.0',
      isPredefined: true,
      isAbstract: true,
    });
    const edge = {source: {}} as any;
    ElementRelationUtil.setElementNode(edge.source, {element: entity} as any);

    const result = service.decouple(edge, entity);
    expect(result).toBe(true);
  });
});
