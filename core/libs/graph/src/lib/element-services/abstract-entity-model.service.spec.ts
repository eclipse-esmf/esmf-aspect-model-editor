import {LoadedFilesService, ModelService, SammLanguageSettingsService} from '@ame/domain';
import {ElementRelationUtil} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EntityInstancePort} from '../ports/entity-instance.port';
import {GraphAdapterPort} from '../ports/graph-adapter.port';
import {AbstractEntityModelService} from './abstract-entity-model.service';
import {BaseEntityModelService} from './base-entity-model.service';

describe('AbstractEntityModelService', () => {
  let service: AbstractEntityModelService;
  let mockLoadedFilesService: any;
  let mockBaseEntityModel: any;
  let mockGraphAdapter: any;
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

    mockGraphAdapter = {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      updateCell: vi.fn(),
      removeCells: vi.fn(),
      checkAndAddTopShapeActionIcon: vi.fn(),
      checkAndAddShapeActionIcon: vi.fn(),
      removeComplexTypeShapeOverlays: vi.fn(),
      addBottomShapeOverlay: vi.fn(),
      updateEntityValuesWithCellReference: vi.fn(),
      setCellPropertiesLabel: vi.fn(),
    };

    mockBaseEntityModel = {checkExtendedElement: vi.fn()};
    mockEntityInstanceService = {onEntityRemove: vi.fn((_el, cb) => cb())};

    TestBed.configureTestingModule({
      providers: [
        AbstractEntityModelService,
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
        {provide: EntityInstancePort, useValue: mockEntityInstanceService},
        {provide: BaseEntityModelService, useValue: mockBaseEntityModel},
        {provide: SammLanguageSettingsService, useValue: {addSammLanguageCode: vi.fn(), getSammLanguageCodes: vi.fn(() => [])}},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: ModelService, useValue: {}},
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

    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: entity} as any);

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
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
    expect(mockBaseEntityModel.checkExtendedElement).toHaveBeenCalled();
  });
});
