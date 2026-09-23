import {GRAPH_ADAPTER, IGraphAdapter, NotificationsService, SHAPE_CONNECTOR_SERVICE} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {DefaultEntity} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BaseEntityModelService} from './base-entity-model.service';

describe('BaseEntityModelService', () => {
  let service: BaseEntityModelService;
  let mockNotificationService: any;
  let mockShapeConnectorService: any;
  let mockGraphAdapter: Partial<IGraphAdapter>;
  let mockTranslate: any;

  beforeEach(() => {
    mockNotificationService = {warning: vi.fn()};
    mockShapeConnectorService = {connectShapes: vi.fn()};
    mockGraphAdapter = {
      resolveCellByModelElement: vi.fn(),
      isEntityCycleInheritance: vi.fn(),
    };
    mockTranslate = {
      language: {
        notificationService: {
          recursiveElements: 'Recursive',
          circularConnectionMessage: 'Circular',
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [
        BaseEntityModelService,
        {provide: NotificationsService, useValue: mockNotificationService},
        {provide: SHAPE_CONNECTOR_SERVICE, useValue: mockShapeConnectorService},
        {provide: GRAPH_ADAPTER, useValue: mockGraphAdapter},
        {provide: LanguageTranslationService, useValue: mockTranslate},
      ],
    });

    service = TestBed.inject(BaseEntityModelService);
  });

  it('should ignore if extendedElement is not DefaultEntity', () => {
    const entity = new DefaultEntity({name: 'E', aspectModelUrn: 'urn:test#E', metaModelVersion: '2.2.0'});
    service.checkExtendedElement(entity, null as any);
    expect(entity.extends_).toBeUndefined();
  });

  it('should warn on cyclic inheritance', () => {
    const entityA = new DefaultEntity({name: 'A', aspectModelUrn: 'urn:test#A', metaModelVersion: '2.2.0'});
    const entityB = new DefaultEntity({name: 'B', aspectModelUrn: 'urn:test#B', metaModelVersion: '2.2.0'});

    const cellB: any = {};
    (mockGraphAdapter.resolveCellByModelElement as any).mockReturnValue(cellB);
    (mockGraphAdapter.isEntityCycleInheritance as any).mockReturnValue(true);

    service.checkExtendedElement(entityA, entityB);
    expect(mockNotificationService.warning).toHaveBeenCalled();
  });

  it('should connect shapes and set extends_ for valid abstract entity', () => {
    const entityA = new DefaultEntity({name: 'A', aspectModelUrn: 'urn:test#A', metaModelVersion: '2.2.0'});
    const entityB = new DefaultEntity({
      name: 'B',
      aspectModelUrn: 'urn:test#B',
      metaModelVersion: '2.2.0',
      isAbstract: true,
      isPredefined: false,
    });

    const cellA: any = {};
    const cellB: any = {};
    (mockGraphAdapter.resolveCellByModelElement as any).mockImplementation((el: any) => (el === entityA ? cellA : cellB));
    (mockGraphAdapter.isEntityCycleInheritance as any).mockReturnValue(false);

    service.checkExtendedElement(entityA, entityB);
    expect(mockShapeConnectorService.connectShapes).toHaveBeenCalledWith(entityA, entityB, cellA, cellB);
    expect(entityA.extends_).toBe(entityB);
  });
});
