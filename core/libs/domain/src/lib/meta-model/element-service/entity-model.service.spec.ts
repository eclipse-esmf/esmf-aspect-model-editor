import {LoadedFilesService, ModelApiService, ModelService, RdfService} from '@ame/infrastructure';
import {ElementRelationUtil} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {EntityInstancePort} from '../../ports/entity-instance.port';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {SammLanguageSettingsService} from '../../state/settings/samm-language-settings.service';
import {BaseEntityModelService} from './base-entity-model.service';
import {EntityModelService} from './entity-model.service';

describe('EntityModelService', () => {
  let service: EntityModelService;
  let mockGraphAdapter: any;
  let mockBaseEntityModel: any;
  let mockEntityInstanceService: any;

  beforeEach(() => {
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
    mockEntityInstanceService = {onEntityRemove: vi.fn((_, cb) => cb())};

    TestBed.configureTestingModule({
      providers: [
        EntityModelService,
        {provide: GraphAdapterPort, useValue: mockGraphAdapter},
        {provide: EntityInstancePort, useValue: mockEntityInstanceService},
        {provide: SammLanguageSettingsService, useValue: {addSammLanguageCode: vi.fn(), getSammLanguageCodes: vi.fn(() => [])}},
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

    const cell = {} as any;
    ElementRelationUtil.setElementNode(cell, {element: entity} as any);

    const form = {
      name: 'EntityUpdated',
      editedProperties: {
        'urn:test#prop': {notInPayload: false, optional: true, payloadName: 'p1'},
      },
    };

    service.update(cell, form);
    expect(entity.propertiesPayload['urn:test#prop'].optional).toBe(true);
    expect(mockGraphAdapter.updateCell).toHaveBeenCalledWith(cell);
    expect(mockBaseEntityModel.checkExtendedElement).toHaveBeenCalled();
  });
});
