import {LoadedFilesService, ModelApiService, ModelService, RdfService} from '@ame/infrastructure';
import {ElementRelationUtil, GRAPH_ADAPTER} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {
  DefaultCharacteristic,
  DefaultEnumeration,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultStructuredValue,
  DefaultUnit,
  DefaultValue,
} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {CharacteristicModelService} from './characteristic-model.service';

describe('CharacteristicModelService', () => {
  let service: CharacteristicModelService;
  let mockGraphAdapter: any;
  let mockLoadedFilesService: any;

  beforeEach(() => {
    mockLoadedFilesService = {
      isElementInCurrentFile: vi.fn().mockReturnValue(true),
      isElementExtern: vi.fn().mockReturnValue(false),
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

    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      updateCell: vi.fn(),
      removeCells: vi.fn(),
      resolveCellByModelElement: vi.fn(),
      checkAndAddTopShapeActionIcon: vi.fn(),
      checkAndAddShapeActionIcon: vi.fn(),
      setCellPropertiesLabel: vi.fn(),
      setElementFilterNode: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CharacteristicModelService,
        {provide: GRAPH_ADAPTER, useValue: mockGraphAdapter},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
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
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: char} as any);

    service.update(cell, {name: 'CharUpdated'});
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
  });

  it('should update enumeration and call enumerationRenderer', () => {
    const enumeration = new DefaultEnumeration({name: 'Enum1', aspectModelUrn: 'urn:test#Enum1', metaModelVersion: '2.2.0', values: []});
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: enumeration} as any);

    service.update(cell, {name: 'EnumUpdated', enumValues: []});
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
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
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: sv} as any);

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
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: quantifiable} as any);

    service.update(cell, {name: 'QUpdated', unit});
    expect(quantifiable.unit).toBe(unit);
  });

  it('should update enumeration and not add external DefaultValue to local cache', () => {
    const enumeration = new DefaultEnumeration({name: 'Enum1', aspectModelUrn: 'urn:test#Enum1', metaModelVersion: '2.2.0', values: []});
    const externalVal = new DefaultValue({name: 'ExtVal', aspectModelUrn: 'urn:ext#ExtVal', value: 'value', metaModelVersion: '2.2.0'});
    const localVal = new DefaultValue({name: 'LocalVal', aspectModelUrn: 'urn:test#LocalVal', value: 'value', metaModelVersion: '2.2.0'});

    mockLoadedFilesService.isElementExtern.mockImplementation(el => el.aspectModelUrn.startsWith('urn:ext'));

    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: enumeration} as any);

    service.update(cell, {name: 'EnumUpdated', enumValues: [externalVal, localVal]});
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.addElement).not.toHaveBeenCalledWith(
      externalVal.aspectModelUrn,
      externalVal,
    );
    expect(mockLoadedFilesService.currentLoadedFile.cachedFile.addElement).toHaveBeenCalledWith(localVal.aspectModelUrn, localVal);
    expect(enumeration.values).toEqual([externalVal, localVal]);
  });

  it('should delete characteristic and trigger overlays and cleanup', () => {
    const char = new DefaultCharacteristic({name: 'C', aspectModelUrn: 'urn:test#C', metaModelVersion: '2.2.0'});
    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: char} as any);

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
