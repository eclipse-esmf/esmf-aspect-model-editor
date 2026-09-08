import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService, EntityInstanceService} from '@ame/editor';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, PropertyRenderService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {TestBed} from '@angular/core/testing';
import {DefaultProperty, DefaultValue} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {PropertyModelService} from './property-model.service';

describe('PropertyModelService', () => {
  let service: PropertyModelService;
  let mockPropertyRenderer: any;
  let mockMaxgraphService: any;
  let mockEntityInstanceService: any;

  beforeEach(() => {
    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockMaxgraphService = {
      graph,
      removeCells: vi.fn(),
      resolveParents: vi.fn().mockReturnValue([]),
    };
    mockPropertyRenderer = {update: vi.fn()};
    mockEntityInstanceService = {onPropertyRemove: vi.fn((_, cb) => cb())};

    TestBed.configureTestingModule({
      providers: [
        PropertyModelService,
        {provide: EntityInstanceService, useValue: mockEntityInstanceService},
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: SammLanguageSettingsService, useValue: {}},
        {provide: PropertyRenderService, useValue: mockPropertyRenderer},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(true),
            currentLoadedFile: {
              namespace: 'ns',
              rdfModel: {getAspectModelUrn: () => 'urn:test#'},
              cachedFile: {updateElementKey: vi.fn(), removeElement: vi.fn(), resolveInstance: vi.fn(e => e), addElement: vi.fn()},
            },
          },
        },
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(PropertyModelService);
  });

  it('should identify applicable DefaultProperty', () => {
    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(prop)).toBe(true);
  });

  it('should update property with example value and trigger propertyRenderer.update', () => {
    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0'});
    const val = new DefaultValue({name: 'Val', aspectModelUrn: 'urn:test#Val', value: '42', metaModelVersion: '2.2.0'});

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    service.update(cell, {name: 'PUpdated', exampleValue: val});
    expect(prop.name).toBe('PUpdated');
    expect(prop.exampleValue).toBe(val);
    expect(mockPropertyRenderer.update).toHaveBeenCalledWith({cell});
  });

  it('should delete property and call onPropertyRemove callback', () => {
    const prop = new DefaultProperty({name: 'P', aspectModelUrn: 'urn:test#P', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);

    service.delete(cell);
    expect(mockEntityInstanceService.onPropertyRemove).toHaveBeenCalled();
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
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
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);
    const anonCell = new Cell();
    mockMaxgraphService.resolveCellByModelElement = vi.fn().mockReturnValue(anonCell);

    service.delete(cell);
    const loadedFiles = TestBed.inject(LoadedFilesService);
    expect(loadedFiles.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#[Value]_1234');
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([anonCell]);
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
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: prop} as any);
    const anonCell = new Cell();
    mockMaxgraphService.resolveCellByModelElement = vi.fn().mockReturnValue(anonCell);

    service.update(cell, {name: 'P', exampleValue: null});
    const loadedFiles = TestBed.inject(LoadedFilesService);
    expect(loadedFiles.currentLoadedFile.cachedFile.removeElement).toHaveBeenCalledWith('urn:test#[Value]_1234');
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([anonCell]);
    expect(prop.exampleValue).toBeNull();
  });
});
