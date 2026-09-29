import {LoadedFilesService, ModelApiService, ModelService, RdfService} from '@ame/infrastructure';
import {setElementNode} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultEvent} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {EventModelService} from './event-model.service';

describe('EventModelService', () => {
  let service: EventModelService;
  let mockGraphAdapter: Partial<GraphAdapterPort>;

  beforeEach(() => {
    mockGraphAdapter = {
      removeCells: vi.fn(),
      updateCell: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        EventModelService,
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
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
    const cell: any = {};
    setElementNode(cell, {element: event});

    service.update(cell, {name: 'EvUpdated'});
    expect(event.name).toBe('EvUpdated');
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
  });

  it('should delete event cell', () => {
    const event = new DefaultEvent({name: 'Ev', aspectModelUrn: 'urn:test#Ev', metaModelVersion: '2.2.0'});
    const cell: any = {};
    setElementNode(cell, {element: event});

    service.delete(cell);
    expect(mockGraphAdapter.removeCells).toHaveBeenCalledWith([cell]);
  });
});
