/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {beforeEach, describe, expect, Mocked, test, vi} from 'vitest';

vi.mock('@ame/loader-filters', () => ({
  ModelFilter: {
    DEFAULT: 'mock-default',
  },
}));

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
}));

import {
  AbstractEntityAbstractEntityConnectionHandler,
  AbstractEntityAbstractPropertyConnectionHandler,
  AbstractEntityConnectionHandler,
  AbstractEntityPropertyConnectionHandler,
  AbstractPropertyAbstractPropertyConnectionHandler,
  AspectConnectionHandler,
  AspectEventConnectionHandler,
  AspectPropertyConnectionHandler,
  CharacteristicConnectionHandler,
  CharacteristicEntityConnectionHandler,
  CharacteristicUnitConnectionHandler,
  CollectionCharacteristicConnectionHandler,
  ConstraintConnectionHandler,
  EitherCharacteristicLeftConnectionHandler,
  EitherCharacteristicRightConnectionHandler,
  EitherConnectionHandler,
  EntityAbstractEntityConnectionHandler,
  EntityConnectionHandler,
  EntityEntityConnectionHandler,
  EntityPropertyConnectionHandler,
  EntityValueConnectionHandler,
  EnumerationEntityValueConnectionHandler,
  EnumerationValueConnectionHandler,
  EventConnectionHandler,
  EventPropertyConnectionHandler,
  OperationConnectionHandler,
  OperationPropertyInputConnectionHandler,
  OperationPropertyOutputConnectionHandler,
  PropertyAbstractPropertyConnectionHandler,
  PropertyCharacteristicConnectionHandler,
  PropertyConnectionHandler,
  PropertyPropertyConnectionHandler,
  PropertyValueConnectionHandler,
  ShapeConnectorService,
  StructuredValueCharacteristicPropertyConnectionHandler,
  StructuredValueConnectionHandler,
  TraitConnectionHandler,
  TraitWithCharacteristicOrConstraintConnectionHandler,
} from '@ame/connection';
import {MaxGraphAttributeService, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {NotificationsService} from '@ame/shared';
import {provideMockObject} from '@ame/test-helpers';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEntity,
  DefaultProperty,
  DefaultTrait,
} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';

describe('Test Shape connector service', () => {
  let service: ShapeConnectorService;
  let notificationsService: Mocked<NotificationsService>;
  let aspectConnectionHandler: Mocked<AspectConnectionHandler>;
  let propertyConnectionHandler: Mocked<PropertyConnectionHandler>;
  let characteristicConnectionHandler: Mocked<CharacteristicConnectionHandler>;
  let entityConnectionHandler: Mocked<EntityConnectionHandler>;
  let aspectPropertyConnectionHandler: Mocked<AspectPropertyConnectionHandler>;
  let propertyCharacteristicConnectionHandler: Mocked<PropertyCharacteristicConnectionHandler>;
  let characteristicEntityConnectionHandler: Mocked<CharacteristicEntityConnectionHandler>;
  let traitWithCharacteristicOrConstraintConnectionHandler: Mocked<TraitWithCharacteristicOrConstraintConnectionHandler>;
  let collectionCharacteristicConnectionHandler: Mocked<CollectionCharacteristicConnectionHandler>;
  let entityPropertyConnectionHandler: Mocked<EntityPropertyConnectionHandler>;
  let traitConnectionHandler: Mocked<TraitConnectionHandler>;
  let abstractEntityConnectionHandler: Mocked<AbstractEntityConnectionHandler>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}})],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        ShapeConnectorService,
        {
          provide: MaxGraphShapeOverlayService,
          useValue: provideMockObject(MaxGraphShapeOverlayService),
        },
        {
          provide: NotificationsService,
          useValue: provideMockObject(NotificationsService),
        },
        {
          provide: MaxGraphService,
          useValue: provideMockObject(MaxGraphService),
        },
        {
          provide: MaxGraphAttributeService,
          useValue: provideMockObject(MaxGraphAttributeService),
        },
        {
          provide: AspectConnectionHandler,
          useValue: provideMockObject(AspectConnectionHandler),
        },
        {
          provide: AspectEventConnectionHandler,
          useValue: provideMockObject(AspectEventConnectionHandler),
        },
        {
          provide: OperationConnectionHandler,
          useValue: provideMockObject(OperationConnectionHandler),
        },
        {
          provide: OperationPropertyInputConnectionHandler,
          useValue: provideMockObject(OperationPropertyInputConnectionHandler),
        },
        {
          provide: OperationPropertyOutputConnectionHandler,
          useValue: provideMockObject(OperationPropertyOutputConnectionHandler),
        },
        {
          provide: PropertyConnectionHandler,
          useValue: provideMockObject(PropertyConnectionHandler),
        },
        {
          provide: EventConnectionHandler,
          useValue: provideMockObject(EventConnectionHandler),
        },
        {
          provide: EventPropertyConnectionHandler,
          useValue: provideMockObject(EventPropertyConnectionHandler),
        },
        {
          provide: CharacteristicConnectionHandler,
          useValue: provideMockObject(CharacteristicConnectionHandler),
        },
        {
          provide: EitherCharacteristicLeftConnectionHandler,
          useValue: provideMockObject(EitherCharacteristicLeftConnectionHandler),
        },
        {
          provide: EitherCharacteristicRightConnectionHandler,
          useValue: provideMockObject(EitherCharacteristicRightConnectionHandler),
        },
        {
          provide: EitherConnectionHandler,
          useValue: provideMockObject(EitherConnectionHandler),
        },
        {
          provide: StructuredValueConnectionHandler,
          useValue: provideMockObject(StructuredValueConnectionHandler),
        },
        {
          provide: StructuredValueCharacteristicPropertyConnectionHandler,
          useValue: provideMockObject(StructuredValueCharacteristicPropertyConnectionHandler),
        },
        {
          provide: ConstraintConnectionHandler,
          useValue: provideMockObject(ConstraintConnectionHandler),
        },
        {
          provide: EntityConnectionHandler,
          useValue: provideMockObject(EntityConnectionHandler),
        },
        {
          provide: EntityValueConnectionHandler,
          useValue: provideMockObject(EntityConnectionHandler),
        },
        {
          provide: EnumerationEntityValueConnectionHandler,
          useValue: provideMockObject(EnumerationEntityValueConnectionHandler),
        },
        {
          provide: AspectPropertyConnectionHandler,
          useValue: provideMockObject(AspectPropertyConnectionHandler),
        },
        {
          provide: PropertyCharacteristicConnectionHandler,
          useValue: provideMockObject(PropertyCharacteristicConnectionHandler),
        },
        {
          provide: CharacteristicEntityConnectionHandler,
          useValue: provideMockObject(CharacteristicEntityConnectionHandler),
        },
        {
          provide: CharacteristicUnitConnectionHandler,
          useValue: provideMockObject(CharacteristicUnitConnectionHandler),
        },
        {
          provide: TraitWithCharacteristicOrConstraintConnectionHandler,
          useValue: provideMockObject(TraitWithCharacteristicOrConstraintConnectionHandler),
        },
        {
          provide: CollectionCharacteristicConnectionHandler,
          useValue: provideMockObject(CollectionCharacteristicConnectionHandler),
        },
        {
          provide: EntityPropertyConnectionHandler,
          useValue: provideMockObject(EntityPropertyConnectionHandler),
        },
        {
          provide: TraitConnectionHandler,
          useValue: provideMockObject(TraitConnectionHandler),
        },
        {
          provide: AbstractEntityConnectionHandler,
          useValue: provideMockObject(AbstractEntityConnectionHandler),
        },
        {
          provide: AbstractEntityAbstractEntityConnectionHandler,
          useValue: provideMockObject(AbstractEntityAbstractEntityConnectionHandler),
        },
        {
          provide: EntityAbstractEntityConnectionHandler,
          useValue: provideMockObject(EntityAbstractEntityConnectionHandler),
        },
        {
          provide: EntityEntityConnectionHandler,
          useValue: provideMockObject(EntityEntityConnectionHandler),
        },
        {
          provide: AbstractEntityPropertyConnectionHandler,
          useValue: provideMockObject(AbstractEntityPropertyConnectionHandler),
        },
        {
          provide: PropertyPropertyConnectionHandler,
          useValue: provideMockObject(PropertyPropertyConnectionHandler),
        },
        {
          provide: PropertyAbstractPropertyConnectionHandler,
          useValue: provideMockObject(PropertyAbstractPropertyConnectionHandler),
        },
        {
          provide: AbstractEntityAbstractPropertyConnectionHandler,
          useValue: provideMockObject(AbstractEntityAbstractPropertyConnectionHandler),
        },
        {
          provide: AbstractPropertyAbstractPropertyConnectionHandler,
          useValue: provideMockObject(AbstractPropertyAbstractPropertyConnectionHandler),
        },
        {
          provide: PropertyValueConnectionHandler,
          useValue: provideMockObject(PropertyValueConnectionHandler),
        },
        {
          provide: EnumerationValueConnectionHandler,
          useValue: provideMockObject(EnumerationValueConnectionHandler),
        },
      ],
    });

    notificationsService = TestBed.inject(NotificationsService) as Mocked<NotificationsService>;
    aspectConnectionHandler = TestBed.inject(AspectConnectionHandler) as Mocked<AspectConnectionHandler>;
    aspectPropertyConnectionHandler = TestBed.inject(AspectPropertyConnectionHandler) as Mocked<AspectPropertyConnectionHandler>;
    propertyConnectionHandler = TestBed.inject(PropertyConnectionHandler) as Mocked<PropertyConnectionHandler>;
    characteristicConnectionHandler = TestBed.inject(CharacteristicConnectionHandler) as Mocked<CharacteristicConnectionHandler>;
    entityConnectionHandler = TestBed.inject(EntityConnectionHandler) as Mocked<EntityConnectionHandler>;
    abstractEntityConnectionHandler = TestBed.inject(AbstractEntityConnectionHandler) as Mocked<AbstractEntityConnectionHandler>;
    propertyCharacteristicConnectionHandler = TestBed.inject(
      PropertyCharacteristicConnectionHandler,
    ) as Mocked<PropertyCharacteristicConnectionHandler>;
    characteristicEntityConnectionHandler = TestBed.inject(
      CharacteristicEntityConnectionHandler,
    ) as Mocked<CharacteristicEntityConnectionHandler>;
    traitWithCharacteristicOrConstraintConnectionHandler = TestBed.inject(
      TraitWithCharacteristicOrConstraintConnectionHandler,
    ) as Mocked<TraitWithCharacteristicOrConstraintConnectionHandler>;
    collectionCharacteristicConnectionHandler = TestBed.inject(
      CollectionCharacteristicConnectionHandler,
    ) as Mocked<CollectionCharacteristicConnectionHandler>;
    entityPropertyConnectionHandler = TestBed.inject(EntityPropertyConnectionHandler) as Mocked<EntityPropertyConnectionHandler>;
    traitConnectionHandler = TestBed.inject(TraitConnectionHandler) as Mocked<TraitConnectionHandler>;

    service = TestBed.inject(ShapeConnectorService);
  });

  describe('createAndConnectShape', () => {
    test('should connect DefaultAspect', () => {
      const element = new DefaultAspect({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});

      service.createAndConnectShape(element, null);

      expect(aspectConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultProperty', () => {
      const element = new DefaultProperty({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});

      service.createAndConnectShape(element, null);

      expect(propertyConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultTrait', () => {
      const element = new DefaultTrait({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});

      service.createAndConnectShape(element, null);

      expect(traitConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultCharacteristic', () => {
      const element = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});

      service.createAndConnectShape(element, null);

      expect(characteristicConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultEntity', () => {
      const element = new DefaultEntity({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});

      service.createAndConnectShape(element, null);

      expect(entityConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultAbstractEntity', () => {
      const element = new DefaultEntity({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null, isAbstract: true});

      service.createAndConnectShape(element, null);

      expect(abstractEntityConnectionHandler.connect).toHaveBeenCalled();
    });
  });
  describe('connectShapes', () => {
    test('should connect aspect with property', () => {
      const parentModel = new DefaultAspect({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(aspectPropertyConnectionHandler.connect).toHaveBeenCalled();
    });
    test('should connect trait with constraint', () => {
      const parentModel = new DefaultTrait({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultConstraint({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(traitWithCharacteristicOrConstraintConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect trait with characteristic', () => {
      const parentModel = new DefaultTrait({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(traitWithCharacteristicOrConstraintConnectionHandler.connect).toHaveBeenCalled();
    });
    test('should not connect trait with characteristic if trait has already a base characteristic', () => {
      const parentModel = new DefaultTrait({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      parentModel.baseCharacteristic = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });
    test('should not connect trait with trait', () => {
      const parentModel = new DefaultTrait({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultTrait({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });
    test('should connect property with characteristic', () => {
      const parentModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(propertyCharacteristicConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect characteristic with entity', () => {
      const parentModel = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(characteristicEntityConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect entity with property', () => {
      const parentModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(entityPropertyConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect collection with characteristic', () => {
      const parentModel = new DefaultCollection({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(collectionCharacteristicConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect Property with Property', () => {
      const parentModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});
      const propertyPropertyConnectionHandler = TestBed.inject(PropertyPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(propertyPropertyConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect Property with AbstractProperty', () => {
      const parentModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null, isAbstract: true});
      const propertyAbstractPropertyConnectionHandler = TestBed.inject(PropertyAbstractPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(propertyAbstractPropertyConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect Property with AbstractEntity', () => {
      const parentModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null, isAbstract: true});
      const childModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});
      const connector = TestBed.inject(AbstractEntityPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should connect AbstractProperty with AbstractEntity', () => {
      const parentModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null, isAbstract: true});
      const childModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null, isAbstract: true});
      const connector = TestBed.inject(AbstractEntityAbstractPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should connect AbstractProperty with AbstractProperty', () => {
      const parentModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null, isAbstract: true});
      const childModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null, isAbstract: true});
      const connector = TestBed.inject(AbstractPropertyAbstractPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should connect AbstractEntity with AbstractEntity', () => {
      const parentModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null, isAbstract: true});
      const childModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null, isAbstract: true});
      const connector = TestBed.inject(AbstractEntityAbstractEntityConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should connect Entity with AbstractEntity', () => {
      const parentModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null, isAbstract: true});
      const connector = TestBed.inject(EntityAbstractEntityConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should not connect characteristic with collection', () => {
      const parentModel = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultCollection({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });

    test('should not connect aspect with characteristic', () => {
      const parentModel = new DefaultAspect({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultCharacteristic({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });

    test('should not connect property with constraint', () => {
      const parentModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultConstraint({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });

    test('should not connect property with entity', () => {
      const parentModel = new DefaultProperty({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultEntity({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });

    test('should not connect Trait with Aspect', () => {
      const parentModel = new DefaultTrait({name: null, aspectModelUrn: 'urn#model', metaModelVersion: null});
      const childModel = new DefaultAspect({name: null, aspectModelUrn: 'urn#child', metaModelVersion: null});

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });
  });
});
