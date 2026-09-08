import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService} from '@ame/editor';
import {EntityValueRenderService, MaxGraphHelper} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultEntityInstance, DefaultProperty, DefaultScalar} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EntityValueModelService} from './entity-value-model.service';

describe('EntityValueModelService', () => {
  let service: EntityValueModelService;
  let mockEntityValueRenderer: any;

  beforeEach(() => {
    mockEntityValueRenderer = {update: vi.fn(), delete: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        EntityValueModelService,
        {provide: EntityValueRenderService, useValue: mockEntityValueRenderer},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(true),
            currentLoadedFile: {
              namespace: 'ns',
              rdfModel: {getAspectModelUrn: () => 'urn:test#'},
              cachedFile: {
                updateElementKey: vi.fn(),
                removeElement: vi.fn(),
                resolveInstance: vi.fn(e => e),
                getByName: vi.fn().mockReturnValue([]),
              },
            },
          },
        },
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(EntityValueModelService);
  });

  it('should identify applicable DefaultEntityInstance', () => {
    const entity = new DefaultEntity({name: 'E', aspectModelUrn: 'urn:test#E', metaModelVersion: '2.2.0'});
    const ev = new DefaultEntityInstance({name: 'EV', aspectModelUrn: 'urn:test#EV', type: entity, metaModelVersion: '2.2.0'});
    expect(service.isApplicable(ev)).toBe(true);
  });

  it('should update entity instance with simple values and call entityValueRenderer.update', () => {
    const prop = new DefaultProperty({
      name: 'strProp',
      aspectModelUrn: 'urn:test#strProp',
      metaModelVersion: '2.2.0',
      characteristic: {dataType: new DefaultScalar({urn: 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion: '2.2.0'})} as any,
    });
    const entity = new DefaultEntity({
      name: 'E',
      aspectModelUrn: 'urn:test#E',
      metaModelVersion: '2.2.0',
      properties: [prop],
    });
    const ev = new DefaultEntityInstance({
      name: 'EV1',
      aspectModelUrn: 'urn:test#EV1',
      type: entity,
      metaModelVersion: '2.2.0',
    });

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: ev} as any);

    const form = {
      name: 'EV1Updated',
      entityValueProperties: {
        strProp: [{value: 'Hello', language: 'en'}],
      },
    };

    service.update(cell, form);

    expect(ev.name).toBe('EV1Updated');
    expect(ev.assertions.get('urn:test#strProp')).toBeDefined();
    expect(mockEntityValueRenderer.update).toHaveBeenCalledWith({cell, form});
  });

  it('should call entityValueRenderer.delete on delete', () => {
    const entity = new DefaultEntity({name: 'E', aspectModelUrn: 'urn:test#E', metaModelVersion: '2.2.0'});
    const ev = new DefaultEntityInstance({name: 'EV', aspectModelUrn: 'urn:test#EV', type: entity, metaModelVersion: '2.2.0'});
    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: ev} as any);

    service.delete(cell);
    expect(mockEntityValueRenderer.delete).toHaveBeenCalledWith(cell);
  });
});
