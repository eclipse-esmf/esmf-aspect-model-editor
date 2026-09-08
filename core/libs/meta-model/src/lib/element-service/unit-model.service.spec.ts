import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphShapeOverlayService, UnitRenderService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultUnit} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {UnitModelService} from './unit-model.service';

describe('UnitModelService', () => {
  let service: UnitModelService;
  let mockMaxgraphService: any;
  let mockUnitRenderer: any;

  beforeEach(() => {
    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      removeCells: vi.fn(),
    };
    mockUnitRenderer = {update: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        UnitModelService,
        {provide: MaxGraphShapeOverlayService, useValue: {checkAndAddTopShapeActionIcon: vi.fn(), checkAndAddShapeActionIcon: vi.fn()}},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: UnitRenderService, useValue: mockUnitRenderer},
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
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
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
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: unit} as any);

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
    expect(mockUnitRenderer.update).toHaveBeenCalledWith({cell, form});
  });

  it('should delete unit cell', () => {
    const unit = new DefaultUnit({name: 'U', aspectModelUrn: 'urn:test#U', metaModelVersion: '2.2.0', quantityKinds: []});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: unit} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
