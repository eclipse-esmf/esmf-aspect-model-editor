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
  AspectConnectionHandler,
  AspectPropertyConnectionHandler,
  CharacteristicConnectionHandler,
  CharacteristicEntityConnectionHandler,
  CollectionCharacteristicConnectionHandler,
  ConstraintConnectionHandler,
  EntityConnectionHandler,
  EntityPropertyConnectionHandler,
  PropertyCharacteristicConnectionHandler,
  PropertyConnectionHandler,
  ShapeConnectorService,
  TraitConnectionHandler,
  TraitWithCharacteristicOrConstraintConnectionHandler,
} from '@ame/connection';
import {TestBed} from '@angular/core/testing';
import {LogService} from '../log.service';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEntity,
  DefaultProperty,
  DefaultTrait,
} from '@ame/meta-model';
import {provideMockObject} from 'jest-helpers/utils';
import {NotificationsService} from '@ame/shared';

describe('Test Shape connector service', () => {
  let service: ShapeConnectorService;
  let logService: jest.Mocked<LogService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let aspectConnectionHandler: jest.Mocked<AspectConnectionHandler>;
  let propertyConnectionHandler: jest.Mocked<PropertyConnectionHandler>;
  let characteristicConnectionHandler: jest.Mocked<CharacteristicConnectionHandler>;
  let entityConnectionHandler: jest.Mocked<EntityConnectionHandler>;
  let aspectPropertyConnectionHandler: jest.Mocked<AspectPropertyConnectionHandler>;
  let propertyCharacteristicConnectionHandler: jest.Mocked<PropertyCharacteristicConnectionHandler>;
  let characteristicEntityConnectionHandler: jest.Mocked<CharacteristicEntityConnectionHandler>;
  let traitWithCharacteristicOrConstraintConnectionHandler: jest.Mocked<TraitWithCharacteristicOrConstraintConnectionHandler>;
  let collectionCharacteristicConnectionHandler: jest.Mocked<CollectionCharacteristicConnectionHandler>;
  let entityPropertyConnectionHandler: jest.Mocked<EntityPropertyConnectionHandler>;
  let traitConnectionHandler: jest.Mocked<TraitConnectionHandler>;

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
          provide: PropertyConnectionHandler,
          useValue: provideMockObject(PropertyConnectionHandler),
        },
        {
          provide: CharacteristicConnectionHandler,
          useValue: provideMockObject(CharacteristicConnectionHandler),
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
      ],
    });
    logService = TestBed.inject(LogService) as jest.Mocked<LogService>;
    notificationsService = TestBed.inject(NotificationsService) as jest.Mocked<NotificationsService>;
    aspectConnectionHandler = TestBed.inject(AspectConnectionHandler) as jest.Mocked<AspectConnectionHandler>;
    propertyConnectionHandler = TestBed.inject(PropertyConnectionHandler) as jest.Mocked<PropertyConnectionHandler>;
    entityConnectionHandler = TestBed.inject(EntityConnectionHandler) as jest.Mocked<EntityConnectionHandler>;
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
