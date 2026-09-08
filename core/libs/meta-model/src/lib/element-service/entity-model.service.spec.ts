import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService, EntityInstanceService} from '@ame/editor';
import {EntityRenderService, MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BaseEntityModelService} from './base-entity-model.service';
import {EntityModelService} from './entity-model.service';

describe('EntityModelService', () => {
  let service: EntityModelService;
  let mockEntityRenderer: any;
  let mockBaseEntityModel: any;
  let mockEntityInstanceService: any;

  beforeEach(() => {
    const graph = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    } as unknown as Graph;
    mockEntityRenderer = {update: vi.fn()};
    mockBaseEntityModel = {checkExtendedElement: vi.fn()};
    mockEntityInstanceService = {onEntityRemove: vi.fn((_, cb) => cb())};

    TestBed.configureTestingModule({
      providers: [
        EntityModelService,
        {
          provide: MaxGraphShapeOverlayService,
          useValue: {
            checkAndAddTopShapeActionIcon: vi.fn(),
            checkAndAddShapeActionIcon: vi.fn(),
            removeComplexTypeShapeOverlays: vi.fn(),
            addBottomShapeOverlay: vi.fn(),
          },
        },
        {provide: EntityInstanceService, useValue: mockEntityInstanceService},
        {provide: MaxGraphService, useValue: {graph, removeCells: vi.fn(), updateEntityValuesWithCellReference: vi.fn()}},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: EntityRenderService, useValue: mockEntityRenderer},
        {provide: SammLanguageSettingsService, useValue: {}},
        {provide: BaseEntityModelService, useValue: mockBaseEntityModel},
        {
          provide: LoadedFilesService,
          useValue: {
            isElementInCurrentFile: vi.fn().mockReturnValue(true),
            currentLoadedFile: {
              namespace: 'ns',
              rdfModel: {getAspectModelUrn: () => 'urn:test#'},
              cachedFile: {updateElementKey: vi.fn(), removeElement: vi.fn(), resolveInstance: vi.fn(e => e)},
            },
          },
        },
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(EntityModelService);
  });

  it('should identify applicable DefaultEntity', () => {
    const entity = new DefaultEntity({name: 'E', aspectModelUrn: 'urn:test#E', metaModelVersion: '2.2.0'});
    expect(service.isApplicable(entity)).toBe(true);
  });

  it('should update entity properties payload', () => {
    const prop = new DefaultProperty({name: 'prop', aspectModelUrn: 'urn:test#prop', metaModelVersion: '2.2.0'});
    const entity = new DefaultEntity({
      name: 'Entity',
      aspectModelUrn: 'urn:test#Entity',
      metaModelVersion: '2.2.0',
      properties: [prop],
    });

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: entity} as any);

    const form = {
      name: 'EntityUpdated',
      editedProperties: {
        'urn:test#prop': {notInPayload: false, optional: true, payloadName: 'p1'},
      },
    };

    service.update(cell, form);
    expect(entity.propertiesPayload['urn:test#prop'].optional).toBe(true);
    expect(mockEntityRenderer.update).toHaveBeenCalledWith({cell});
    expect(mockBaseEntityModel.checkExtendedElement).toHaveBeenCalled();
  });
});
