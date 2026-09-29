import {setElementNode} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultUnit} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LoadedFilesService, ModelService} from '../../model-session';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {UnitModelService} from './unit-model.service';

describe('UnitModelService', () => {
  let service: UnitModelService;
  let mockGraphAdapter: Partial<GraphAdapterPort>;

  beforeEach(() => {
    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      removeCells: vi.fn(),
      updateCell: vi.fn(),
      checkAndAddTopShapeActionIcon: vi.fn(),
      checkAndAddShapeActionIcon: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        UnitModelService,
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(true),
            currentLoadedFile: {
              namespace: 'ns',
              rdfModel: {getAspectModelUrn: () => 'urn:test#', sammU: {getNamespace: () => 'urn:samm:org.eclipse.esmf.samm:unit:2.1.0#'}},
              cachedFile: {updateElementKey: vi.fn(), removeElement: vi.fn()},
            },
          },
        },
        {provide: ModelService, useValue: {}},
      ],
    });

    service = TestBed.inject(UnitModelService);
  });

  it('should identify applicable DefaultUnit', () => {
    const unit = new DefaultUnit({name: 'U', aspectModelUrn: 'urn:test#U', metaModelVersion: '2.2.0', quantityKinds: []});
    expect(service.isApplicable(unit)).toBe(true);
  });

  it('should update unit properties and call unitRenderer.update', () => {
    const unit = new DefaultUnit({name: 'U', aspectModelUrn: 'urn:test#U', metaModelVersion: '2.2.0', quantityKinds: []});
    const cell: any = {};
    setElementNode(cell, {element: unit});

    const form = {
      name: 'UUpdated',
      code: 'KMT',
      symbol: 'km',
      conversionFactor: '1000',
      quantityKindsChipList: [],
    };

    service.update(cell, form);
    expect(unit.name).toBe('UUpdated');
    expect(unit.code).toBe('KMT');
    expect(unit.symbol).toBe('km');
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
  });

  it('should delete unit cell', () => {
    const unit = new DefaultUnit({name: 'U', aspectModelUrn: 'urn:test#U', metaModelVersion: '2.2.0', quantityKinds: []});
    const cell: any = {};
    setElementNode(cell, {element: unit});

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
