import {setElementNode} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultProperty, DefaultValue} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LoadedFilesService, ModelService} from '../../model-session';
import {EntityInstancePort} from '../../ports/entity-instance.port';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {SammLanguageSettingsService} from '../../state/settings/samm-language-settings.service';
import {PropertyModelService} from './property-model.service';

describe('PropertyModelService', () => {
  let service: PropertyModelService;
  let mockGraphAdapter: Partial<GraphAdapterPort>;
  let mockEntityInstanceService: any;

  beforeEach(() => {
    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      removeCells: vi.fn(),
      resolveParents: vi.fn().mockReturnValue([]),
      resolveCellByModelElement: vi.fn(),
      updateCell: vi.fn(),
      updateCellLabel: vi.fn(),
      setCellPropertiesLabel: vi.fn(),
    };
    mockEntityInstanceService = {onPropertyRemove: vi.fn((_, cb) => cb())};

    TestBed.configureTestingModule({
      providers: [
        PropertyModelService,
        {provide: EntityInstancePort, useValue: mockEntityInstanceService},
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
        {provide: SammLanguageSettingsService, useValue: {addSammLanguageCode: vi.fn(), getSammLanguageCodes: vi.fn(() => [])}},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(true),
            isElementExtern: vi.fn().mockReturnValue(false),
            currentLoadedFile: {
              namespace: 'ns',
              rdfModel: {getAspectModelUrn: () => 'urn:test#'},
              cachedFile: {updateElementKey: vi.fn(), removeElement: vi.fn(), resolveInstance: vi.fn(e => e), addElement: vi.fn()},
            },
          },
        },
        {provide: ModelService, useValue: {}},
      ],
    });

    service = TestBed.inject(PropertyModelService);
  });

  it('should identify applicable DefaultProperty', () => {
    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(prop)).toBe(true);
  });

  it('should update property with example value and trigger graphAdapter.updateCell', () => {
    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0'});
    const val = new DefaultValue({name: 'Val', aspectModelUrn: 'urn:test#Val', value: '42', metaModelVersion: '2.2.0'});

    const cell: any = {};
    setElementNode(cell, {element: prop});

    service.update(cell, {name: 'PUpdated', exampleValue: val});
    expect(prop.name).toBe('PUpdated');
    expect(prop.exampleValue).toBe(val);
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
  });

  it('should delete property and call onPropertyRemove callback', () => {
    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0'});
    const cell: any = {};
    setElementNode(cell, {element: prop});

    service.delete(cell);
    expect(mockEntityInstanceService.onPropertyRemove).toHaveBeenCalled();
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });

  it('should remove anonymous exampleValue from cache and graph when property is deleted', () => {
    const anonVal = new DefaultValue({
      name: '[Value]',
      aspectModelUrn: 'urn:test#[Value]_1234',
      value: '42',
      metaModelVersion: '2.2.0',
      isAnonymous: true,
    });
    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0', exampleValue: anonVal});
    const cell: any = {};
    setElementNode(cell, {element: prop});
    const anonCell: any = {};
    mockGraphAdapter.resolveCellByModelElement = vi.fn().mockReturnValue(anonCell);

    service.delete(cell);
    const loadedFiles = TestBed.inject(LoadedFilesService);
    expect(loadedFiles.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#[Value]_1234');
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([anonCell]);
  });

  it('should remove anonymous exampleValue when exampleValue is changed or cleared on update', () => {
    const anonVal = new DefaultValue({
      name: '[Value]',
      aspectModelUrn: 'urn:test#[Value]_1234',
      value: '42',
      metaModelVersion: '2.2.0',
      isAnonymous: true,
    });
    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0', exampleValue: anonVal});
    const cell: any = {};
    setElementNode(cell, {element: prop});
    const anonCell: any = {};
    mockGraphAdapter.resolveCellByModelElement = vi.fn().mockReturnValue(anonCell);

    service.update(cell, {name: 'P', exampleValue: null});
    const loadedFiles = TestBed.inject(LoadedFilesService);
    expect(loadedFiles.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#[Value]_1234');
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([anonCell]);
    expect(prop.exampleValue).toBeNull();
  });
});
