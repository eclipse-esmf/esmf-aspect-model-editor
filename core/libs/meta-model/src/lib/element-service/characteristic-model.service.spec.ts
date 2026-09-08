import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {FiltersService} from '@ame/loader-filters';
import {
  CharacteristicRenderService,
  EnumerationRenderService,
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphService,
  MaxGraphShapeOverlayService,
} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {
  DefaultCharacteristic,
  DefaultEnumeration,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultStructuredValue,
  DefaultUnit,
} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {CharacteristicModelService} from './characteristic-model.service';

describe('CharacteristicModelService', () => {
  let service: CharacteristicModelService;
  let mockMaxgraphShapeOverlayService: any;
  let mockMaxgraphService: any;
  let mockCharacteristicRenderer: any;
  let mockEnumerationRenderer: any;
  let mockLoadedFilesService: any;

  beforeEach(() => {
    mockLoadedFilesService = {
      isElementInCurrentFile: vi.fn().mockReturnValue(true),
      currentLoadedFile: {
        namespace: 'org.eclipse.esmf.test',
        rdfModel: {
          getAspectModelUrn: () => 'urn:samm:org.eclipse.esmf.test:1.0.0#',
        },
        cachedFile: {
          updateElementKey: vi.fn(),
          removeElement: vi.fn(),
          resolveInstance: vi.fn(el => el),
          addElement: vi.fn(),
        },
      },
    };

    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      removeCells: vi.fn(),
      resolveCellByModelElement: vi.fn(),
    };

    mockMaxgraphShapeOverlayService = {
      checkAndAddTopShapeActionIcon: vi.fn(),
      checkAndAddShapeActionIcon: vi.fn(),
    };

    mockCharacteristicRenderer = {update: vi.fn()};
    mockEnumerationRenderer = {update: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        CharacteristicModelService,
        {provide: MaxGraphShapeOverlayService, useValue: mockMaxgraphShapeOverlayService},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: CharacteristicRenderService, useValue: mockCharacteristicRenderer},
        {provide: EnumerationRenderService, useValue: mockEnumerationRenderer},
        {provide: FiltersService, useValue: {createNode: vi.fn()}},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(CharacteristicModelService);
  });

  it('should identify applicable DefaultCharacteristic', () => {
    const char = new DefaultCharacteristic({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(char)).toBe(true);
  });

  it('should update regular characteristic and call characteristicRenderer', () => {
    const char = new DefaultCharacteristic({name: 'Char1', aspectModelUrn: 'urn:test#Char1', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: char} as any);

    service.update(cell, {name: 'CharUpdated'});
    expect(mockCharacteristicRenderer.update).toHaveBeenCalled();
  });

  it('should update enumeration and call enumerationRenderer', () => {
    const enumeration = new DefaultEnumeration({name: 'Enum1', aspectModelUrn: 'urn:test#Enum1', metaModelVersion: '2.2.0', values: []});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: enumeration} as any);

    service.update(cell, {name: 'EnumUpdated', enumValues: []});
    expect(mockEnumerationRenderer.update).toHaveBeenCalled();
  });

  it('should handle structured value properties', () => {
    const sv = new DefaultStructuredValue({
      name: 'SV',
      aspectModelUrn: 'urn:test#SV',
      metaModelVersion: '2.2.0',
      elements: [],
      deconstructionRule: '',
    });
    const prop = new DefaultProperty({name: 'p', aspectModelUrn: 'urn:test#p', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: sv} as any);

    service.update(cell, {
      name: 'SVUpdated',
      deconstructionRule: '([a-z]+)',
      elements: [prop],
    });

    expect(sv.deconstructionRule).toBe('([a-z]+)');
    expect(sv.elements).toEqual([prop]);
  });

  it('should handle quantifiable unit', () => {
    const unit = new DefaultUnit({name: 'meter', aspectModelUrn: 'urn:test#meter', metaModelVersion: '2.2.0', quantityKinds: []});
    const quantifiable = new DefaultQuantifiable({
      name: 'Q',
      aspectModelUrn: 'urn:test#Q',
      metaModelVersion: '2.2.0',
      unit,
    });
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: quantifiable} as any);

    service.update(cell, {name: 'QUpdated', unit});
    expect(quantifiable.unit).toBe(unit);
  });

  it('should delete characteristic and trigger overlays and cleanup', () => {
    const char = new DefaultCharacteristic({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: char} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
