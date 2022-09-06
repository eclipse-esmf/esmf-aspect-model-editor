/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {describe, expect} from '@jest/globals';
import {
  AbstractEntityAbstractEntityConnectionHandler,
  AbstractEntityAbstractPropertyConnectionHandler,
  AbstractEntityConnectionHandler,
  AbstractEntityPropertyConnectionHandler,
  AbstractEntityAbstractPropertyConnectionHandler,
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
  EventConnectionHandler,
  EventPropertyConnectionHandler,
  OperationConnectionHandler,
  OperationPropertyInputConnectionHandler,
  OperationPropertyOutputConnectionHandler,
  PropertyAbstractPropertyConnectionHandler,
  PropertyCharacteristicConnectionHandler,
  PropertyConnectionHandler,
  PropertyPropertyConnectionHandler,
  ShapeConnectorService,
  StructuredValueCharacteristicPropertyConnectionHandler,
  StructuredValueConnectionHandler,
  TraitConnectionHandler,
  TraitWithCharacteristicOrConstraintConnectionHandler,
} from '@ame/connection';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEntity,
  DefaultProperty,
  DefaultTrait,
} from '@ame/meta-model';
import {provideMockObject} from 'jest-helpers/utils';
import {LogService, NotificationsService} from '@ame/shared';

describe('Test Shape connector service', () => {
  let service: ShapeConnectorService;
  let logService: jest.Mocked<LogService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let aspectConnectionHandler: jest.Mocked<AspectConnectionHandler>;
  let propertyConnectionHandler: jest.Mocked<PropertyConnectionHandler>;
  let characteristicConnectionHandler: jest.Mocked<CharacteristicConnectionHandler>;
  let entityConnectionHandler: jest.Mocked<EntityConnectionHandler>;
  let abstractEntityConnectionHandler: jest.Mocked<AbstractEntityConnectionHandler>;
  let aspectPropertyConnectionHandler: jest.Mocked<AspectPropertyConnectionHandler>;
  let propertyCharacteristicConnectionHandler: jest.Mocked<PropertyCharacteristicConnectionHandler>;
  let characteristicEntityConnectionHandler: jest.Mocked<CharacteristicEntityConnectionHandler>;
  let traitWithCharacteristicOrConstraintConnectionHandler: jest.Mocked<TraitWithCharacteristicOrConstraintConnectionHandler>;
  let collectionCharacteristicConnectionHandler: jest.Mocked<CollectionCharacteristicConnectionHandler>;
  let entityPropertyConnectionHandler: jest.Mocked<EntityPropertyConnectionHandler>;
  let traitConnectionHandler: jest.Mocked<TraitConnectionHandler>;
  let abstractEntityConnectionHandler: jest.Mocked<AbstractEntityConnectionHandler>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ShapeConnectorService,
        {
          provide: LogService,
          useValue: provideMockObject(LogService),
        },
        {
          provide: NotificationsService,
          useValue: provideMockObject(NotificationsService),
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
      ],
    });
    logService = TestBed.inject(LogService) as jest.Mocked<LogService>;
    notificationsService = TestBed.inject(NotificationsService) as jest.Mocked<NotificationsService>;
    aspectConnectionHandler = TestBed.inject(AspectConnectionHandler) as jest.Mocked<AspectConnectionHandler>;
    aspectPropertyConnectionHandler = TestBed.inject(AspectPropertyConnectionHandler) as jest.Mocked<AspectPropertyConnectionHandler>;
    propertyConnectionHandler = TestBed.inject(PropertyConnectionHandler) as jest.Mocked<PropertyConnectionHandler>;
    characteristicConnectionHandler = TestBed.inject(CharacteristicConnectionHandler) as jest.Mocked<CharacteristicConnectionHandler>;
    entityConnectionHandler = TestBed.inject(EntityConnectionHandler) as jest.Mocked<EntityConnectionHandler>;
    abstractEntityConnectionHandler = TestBed.inject(AbstractEntityConnectionHandler) as jest.Mocked<AbstractEntityConnectionHandler>;
    propertyCharacteristicConnectionHandler = TestBed.inject(
      PropertyCharacteristicConnectionHandler
    ) as jest.Mocked<PropertyCharacteristicConnectionHandler>;
    characteristicEntityConnectionHandler = TestBed.inject(
      CharacteristicEntityConnectionHandler
    ) as jest.Mocked<CharacteristicEntityConnectionHandler>;
    traitWithCharacteristicOrConstraintConnectionHandler = TestBed.inject(
      TraitWithCharacteristicOrConstraintConnectionHandler
    ) as jest.Mocked<TraitWithCharacteristicOrConstraintConnectionHandler>;
    collectionCharacteristicConnectionHandler = TestBed.inject(
      CollectionCharacteristicConnectionHandler
    ) as jest.Mocked<CollectionCharacteristicConnectionHandler>;
    entityPropertyConnectionHandler = TestBed.inject(EntityPropertyConnectionHandler) as jest.Mocked<EntityPropertyConnectionHandler>;
    traitConnectionHandler = TestBed.inject(TraitConnectionHandler) as jest.Mocked<TraitConnectionHandler>;

    service = TestBed.inject(ShapeConnectorService);
  });

  describe('createAndConnectShape', () => {
    test('should connect DefaultAspect', () => {
      const element = new DefaultAspect(null, null, null);

      service.createAndConnectShape(element, null);

      expect(aspectConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultProperty', () => {
      const element = DefaultProperty.createInstance();

      service.createAndConnectShape(element, null);

      expect(propertyConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultTrait', () => {
      const element = new DefaultTrait(null, null, null);

      service.createAndConnectShape(element, null);

      expect(traitConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultCharacteristic', () => {
      const element = new DefaultCharacteristic(null, null, null);

      service.createAndConnectShape(element, null);

      expect(characteristicConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultEntity', () => {
      const element = new DefaultEntity(null, null, null);

      service.createAndConnectShape(element, null);

      expect(entityConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect DefaultAbstractEntity', () => {
      const element = new DefaultAbstractEntity(null, null, null);

      service.createAndConnectShape(element, null);

      expect(abstractEntityConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should only log in case of no metaModel', () => {
      service.createAndConnectShape(null, null);

      expect(logService.logInfo).toHaveBeenCalled();
    });
  });
  describe('connectShapes', () => {
    test('should connect aspect with property', () => {
      const parentModel = new DefaultAspect(null, null, null);
      const childModel = DefaultProperty.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(aspectPropertyConnectionHandler.connect).toHaveBeenCalled();
    });
    test('should connect trait with constraint', () => {
      const parentModel = DefaultTrait.createInstance();
      const childModel = DefaultConstraint.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(traitWithCharacteristicOrConstraintConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect trait with characteristic', () => {
      const parentModel = DefaultTrait.createInstance();
      const childModel = DefaultCharacteristic.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(traitWithCharacteristicOrConstraintConnectionHandler.connect).toHaveBeenCalled();
    });
    test('should not connect trait with characteristic if trait has already a base characteristic', () => {
      const parentModel = DefaultTrait.createInstance();
      const childModel = DefaultCharacteristic.createInstance();

      parentModel.baseCharacteristic = DefaultCharacteristic.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });
    test('should not connect trait with trait', () => {
      const parentModel = DefaultTrait.createInstance();
      const childModel = DefaultTrait.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });
    test('should connect property with characteristic', () => {
      const parentModel = DefaultProperty.createInstance();
      const childModel = DefaultCharacteristic.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(propertyCharacteristicConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect characteristic with entity', () => {
      const parentModel = DefaultCharacteristic.createInstance();
      const childModel = DefaultEntity.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(characteristicEntityConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect entity with property', () => {
      const parentModel = DefaultEntity.createInstance();
      const childModel = DefaultProperty.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(entityPropertyConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect collection with characteristic', () => {
      const parentModel = DefaultCollection.createInstance();
      const childModel = DefaultCharacteristic.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(collectionCharacteristicConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect Property with Property', () => {
      const parentModel = DefaultProperty.createInstance();
      const childModel = DefaultProperty.createInstance();
      const propertyPropertyConnectionHandler = TestBed.inject(PropertyPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(propertyPropertyConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect Property with AbstractProperty', () => {
      const parentModel = DefaultProperty.createInstance();
      const childModel = DefaultAbstractProperty.createInstance();
      const propertyAbstractPropertyConnectionHandler = TestBed.inject(PropertyAbstractPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(propertyAbstractPropertyConnectionHandler.connect).toHaveBeenCalled();
    });

    test('should connect Property with AbstractEntity', () => {
      const parentModel = DefaultAbstractEntity.createInstance();
      const childModel = DefaultProperty.createInstance();
      const connector = TestBed.inject(AbstractEntityPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should connect AbstractProperty with AbstractEntity', () => {
      const parentModel = DefaultAbstractEntity.createInstance();
      const childModel = DefaultAbstractProperty.createInstance();
      const connector = TestBed.inject(AbstractEntityAbstractPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should connect AbstractProperty with AbstractEntity', () => {
      const parentModel = DefaultAbstractProperty.createInstance();
      const childModel = DefaultAbstractProperty.createInstance();
      const connector = TestBed.inject(AbstractPropertyAbstractPropertyConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should connect AbstractEntity with AbstractEntity', () => {
      const parentModel = DefaultAbstractEntity.createInstance();
      const childModel = DefaultAbstractEntity.createInstance();
      const connector = TestBed.inject(AbstractEntityAbstractEntityConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should connect Entity with AbstractEntity', () => {
      const parentModel = DefaultEntity.createInstance();
      const childModel = DefaultAbstractEntity.createInstance();
      const connector = TestBed.inject(EntityAbstractEntityConnectionHandler);

      service.connectShapes(parentModel, childModel, null, null);

      expect(connector.connect).toHaveBeenCalled();
    });

    test('should not connect characteristic with collection', () => {
      const parentModel = DefaultCharacteristic.createInstance();
      const childModel = DefaultCollection.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });

    test('should not connect aspect with characteristic', () => {
      const parentModel = new DefaultAspect(null, null, null);
      const childModel = DefaultCharacteristic.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });

    test('should not connect property with constraint', () => {
      const parentModel = DefaultProperty.createInstance();
      const childModel = DefaultConstraint.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });

    test('should not connect property with entity', () => {
      const parentModel = DefaultProperty.createInstance();
      const childModel = DefaultEntity.createInstance();

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });

    test('should not connect Trait with Aspect', () => {
      const parentModel = DefaultTrait.createInstance();
      const childModel = new DefaultAspect(null, null, null);

      service.connectShapes(parentModel, childModel, null, null);

      expect(notificationsService.warning).toHaveBeenCalled();
    });
  });
});
