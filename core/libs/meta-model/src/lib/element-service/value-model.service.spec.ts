import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {MaxGraphHelper, MaxGraphService, ValueRenderService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultValue} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ValueModelService} from './value-model.service';

describe('ValueModelService', () => {
  let service: ValueModelService;
  let mockMaxgraphService: any;
  let mockValueRenderer: any;

  beforeEach(() => {
    mockMaxgraphService = {removeCells: vi.fn()};
    mockValueRenderer = {update: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        ValueModelService,
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: ValueRenderService, useValue: mockValueRenderer},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(true),
            currentLoadedFile: {
              namespace: 'ns',
              rdfModel: {getAspectModelUrn: () => 'urn:test#'},
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

    service = TestBed.inject(ValueModelService);
  });

  it('should identify applicable DefaultValue', () => {
    const val = new DefaultValue({name: 'V', aspectModelUrn: 'urn:test#V', value: '42', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(val)).toBe(true);
  });

  it('should update value and call valueRenderer.update', () => {
    const val = new DefaultValue({name: 'V', aspectModelUrn: 'urn:test#V', value: '42', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: val} as any);

    const form = {name: 'VUpdated', value: '100'};
    service.update(cell, form);
    expect(val.name).toBe('VUpdated');
    expect(val.value).toBe('100');
    expect(mockValueRenderer.update).toHaveBeenCalledWith({cell, form});
  });

  it('should delete value cell', () => {
    const val = new DefaultValue({name: 'V', aspectModelUrn: 'urn:test#V', value: '42', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: val} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
