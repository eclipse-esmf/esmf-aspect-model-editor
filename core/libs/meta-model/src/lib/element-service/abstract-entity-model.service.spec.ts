import {ModelApiService} from '@ame/api';
import {LoadedFilesService} from '@ame/cache';
import {EditorService, EntityInstanceService} from '@ame/editor';
import {
  AbstractEntityRenderService,
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphService,
  MaxGraphShapeOverlayService,
} from '@ame/max-graph';
import {ModelService, RdfService} from '@ame/rdf/services';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {Cell, Graph} from '@maxgraph/core';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AbstractEntityModelService} from './abstract-entity-model.service';
import {BaseEntityModelService} from './base-entity-model.service';

describe('AbstractEntityModelService', () => {
  let service: AbstractEntityModelService;
  let mockLoadedFilesService: any;
  let mockAbstractEntityRenderer: any;
  let mockBaseEntityModel: any;
  let mockMaxgraphService: any;
  let mockEntityInstanceService: any;

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
      updateEntityValuesWithCellReference: vi.fn(),
    };

    mockAbstractEntityRenderer = {update: vi.fn()};
    mockBaseEntityModel = {checkExtendedElement: vi.fn()};
    mockEntityInstanceService = {onEntityRemove: vi.fn((_el, cb) => cb())};

    TestBed.configureTestingModule({
      providers: [
        AbstractEntityModelService,
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
        {provide: MaxGraphService, useValue: mockMaxgraphService},
        {provide: MaxGraphAttributeService, useValue: {graph}},
        {provide: AbstractEntityRenderService, useValue: mockAbstractEntityRenderer},
        {provide: BaseEntityModelService, useValue: mockBaseEntityModel},
        {provide: SammLanguageSettingsService, useValue: {}},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: RdfService, useValue: {}},
        {provide: ModelService, useValue: {}},
        {provide: EditorService, useValue: {}},
        {provide: ModelApiService, useValue: {}},
      ],
    });

    service = TestBed.inject(AbstractEntityModelService);
  });

  it('should identify applicable abstract entity', () => {
    const abstractEntity = new DefaultEntity({
      name: 'AbstractE',
      aspectModelUrn: 'urn:test#AbstractE',
      metaModelVersion: '2.2.0',
      isAbstract: true,
    });
    const concreteEntity = new DefaultEntity({
      name: 'ConcreteE',
      aspectModelUrn: 'urn:test#ConcreteE',
      metaModelVersion: '2.2.0',
    });

    expect(service.isApplicable(abstractEntity)).toBe(true);
    expect(service.isApplicable(concreteEntity)).toBe(false);
  });

  it('should update abstract entity and its properties payload', () => {
    const prop = new DefaultProperty({name: 'prop1', aspectModelUrn: 'urn:test#prop1', metaModelVersion: '2.2.0'});
    const entity = new DefaultEntity({
      name: 'AbstractE',
      aspectModelUrn: 'urn:test#AbstractE',
      metaModelVersion: '2.2.0',
      isAbstract: true,
      properties: [prop],
    });

    const cell = new Cell();
    MaxGraphHelper.setElementNode(cell, {element: entity} as any);

    const form = {
      name: 'AbstractEUpdated',
      editedProperties: {
        'urn:test#prop1': {
          notInPayload: true,
          optional: true,
          payloadName: 'propOne',
        },
      },
    };

    service.update(cell, form);

    expect(entity.propertiesPayload['urn:test#prop1'].notInPayload).toBe(true);
    expect(entity.propertiesPayload['urn:test#prop1'].optional).toBe(true);
    expect(entity.propertiesPayload['urn:test#prop1'].payloadName).toBe('propOne');
    expect(mockAbstractEntityRenderer.update).toHaveBeenCalledWith({cell});
    expect(mockBaseEntityModel.checkExtendedElement).toHaveBeenCalled();
  });
});
