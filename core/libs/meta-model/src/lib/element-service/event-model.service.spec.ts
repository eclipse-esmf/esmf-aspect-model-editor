import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {EventRenderService, MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultEvent} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EventModelService} from './event-model.service';

describe('EventModelService', () => {
  let service: EventModelService;
  let mockMaxgraphService: any;
  let mockEventRenderer: any;

  beforeEach(() => {
    mockMaxgraphService = {removeCells: vi.fn()};
    mockEventRenderer = {update: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        EventModelService,
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: EventRenderService, useValue: mockEventRenderer},
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

    service = TestBed.inject(EventModelService);
  });

  it('should identify applicable DefaultEvent', () => {
    const event = new DefaultEvent({name: 'Ev', aspectModelUrn: 'urn:test#Ev', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(event)).toBe(true);
  });

  it('should update event and call eventRenderer.update', () => {
    const event = new DefaultEvent({name: 'Ev', aspectModelUrn: 'urn:test#Ev', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: event} as any);

    service.update(cell, {name: 'EvUpdated'});
    expect(event.name).toBe('EvUpdated');
    expect(mockEventRenderer.update).toHaveBeenCalledWith({cell});
  });

  it('should delete event cell', () => {
    const event = new DefaultEvent({name: 'Ev', aspectModelUrn: 'urn:test#Ev', metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: event} as any);

    service.delete(cell);
    expect(mockMaxgraphService.removeCells).toHaveBeenCalledWith([cell]);
  });
});
