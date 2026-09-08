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

import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@ame/loader-filters', () => ({
  ModelFilter: {
    DEFAULT: 'mock-default',
  },
  FiltersService: class {
    createNode(element: any, options: any) {
      return {element, options};
    }
  },
}));

vi.mock('@ame/editor', () => ({
  ModelElementEditorComponent: class {},
  EntityInstanceService: class {
    onNewProperty = vi.fn();
  },
}));

import {LoadedFilesService} from '@ame/cache';
import {EntityInstanceService} from '@ame/editor';
import {FiltersService} from '@ame/loader-filters';
import {MaxGraphAttributeService, MaxGraphService, MaxGraphShapeOverlayService, ModelInfo} from '@ame/max-graph';
import {ModelElementNamingService} from '@ame/meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultTrait,
} from '@esmf/aspect-model-loader';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {Cell} from '@maxgraph/core';
import {EntityPropertyConnectionHandler, PropertyAbstractPropertyConnectionHandler} from '../multi-shape-connection-handlers';
import {
  AbstractEntityConnectionHandler,
  AspectConnectionHandler,
  CharacteristicConnectionHandler,
  ConstraintConnectionHandler,
  EitherConnectionHandler,
  EntityConnectionHandler,
  EntityValueConnectionHandler,
  EventConnectionHandler,
  OperationConnectionHandler,
  PropertyConnectionHandler,
  StructuredValueConnectionHandler,
  TraitConnectionHandler,
} from './index';

describe('Single Shape Connection Handlers', () => {
  let abstractEntityHandler: AbstractEntityConnectionHandler;
  let aspectHandler: AspectConnectionHandler;
  let propertyHandler: PropertyConnectionHandler;
  let characteristicHandler: CharacteristicConnectionHandler;
  let constraintHandler: ConstraintConnectionHandler;
  let eitherHandler: EitherConnectionHandler;
  let entityHandler: EntityConnectionHandler;
  let entityValueHandler: EntityValueConnectionHandler;
  let eventHandler: EventConnectionHandler;
  let operationHandler: OperationConnectionHandler;
  let structuredValueHandler: StructuredValueConnectionHandler;
  let traitHandler: TraitConnectionHandler;

  const mockMaxGraphService = {
    graph: {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    },
    assignToParent: vi.fn(),
    formatCell: vi.fn(),
    formatShapes: vi.fn(),
    renderModelElement: vi.fn().mockImplementation(() => {
      const cell = new Cell();
      (cell as any).configuration = {};
      return cell;
    }),
    resolveCellByModelElement: vi.fn().mockImplementation(() => new Cell()),
    moveCells: vi.fn(),
  };

  const mockNotificationsService = {
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  };

  const mockElementCreator = {
    createEmptyElement: vi.fn().mockImplementation((type: any, options?: any) => {
      if (type === DefaultProperty) {
        return new DefaultProperty({
          aspectModelUrn: options?.isAbstract ? 'urn:test#abstractProp' : 'urn:test#prop',
          name: options?.isAbstract ? 'abstractProp' : 'prop',
          metaModelVersion: '2.0.0',
          isAbstract: options?.isAbstract || false,
        });
      }
      if (type === DefaultCharacteristic) {
        return new DefaultCharacteristic({aspectModelUrn: 'urn:test#char', name: 'char', metaModelVersion: '2.0.0'});
      }
      if (type === DefaultConstraint) {
        return new DefaultConstraint({aspectModelUrn: 'urn:test#constraint', name: 'constraint', metaModelVersion: '2.0.0'});
      }
      if (type === DefaultEntity) {
        return new DefaultEntity({aspectModelUrn: 'urn:test#entity', name: 'entity', metaModelVersion: '2.0.0'});
      }
      return null;
    }),
  };

  const mockLoadedFilesService = {
    isElementExtern: vi.fn().mockReturnValue(false),
    currentLoadedFile: {
      namespace: 'urn:test',
      cachedFile: {
        resolveInstance: vi.fn().mockImplementation(el => el),
        removeElement: vi.fn(),
      },
    },
  };

  const mockEntityPropertyConnector = {
    connect: vi.fn(),
  };

  const mockPropertyAbstractPropertyConnector = {
    connect: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot({langs: {en: {}}})],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        AbstractEntityConnectionHandler,
        AspectConnectionHandler,
        PropertyConnectionHandler,
        CharacteristicConnectionHandler,
        ConstraintConnectionHandler,
        EitherConnectionHandler,
        EntityConnectionHandler,
        EntityValueConnectionHandler,
        EventConnectionHandler,
        OperationConnectionHandler,
        StructuredValueConnectionHandler,
        TraitConnectionHandler,
        FiltersService,
        {provide: EntityInstanceService, useValue: {onNewProperty: vi.fn()}},
        {provide: MaxGraphService, useValue: mockMaxGraphService},
        {provide: ElementCreatorService, useValue: mockElementCreator},
        {provide: NotificationsService, useValue: mockNotificationsService},
        {provide: MaxGraphAttributeService, useValue: {graph: mockMaxGraphService.graph}},
        {provide: MaxGraphShapeOverlayService, useValue: {removeOverlay: vi.fn(), checkComplexEnumerationOverlays: vi.fn()}},
        {provide: SammLanguageSettingsService, useValue: {currentLanguage: 'en'}},
        {provide: LanguageTranslationService, useValue: {language: {notificationService: {childForPredefinedElementError: 'err'}}}},
        {provide: LoadedFilesService, useValue: mockLoadedFilesService},
        {provide: ModelElementNamingService, useValue: {resolveMetaModelElement: vi.fn().mockImplementation(el => el)}},
        {provide: EntityPropertyConnectionHandler, useValue: mockEntityPropertyConnector},
        {provide: PropertyAbstractPropertyConnectionHandler, useValue: mockPropertyAbstractPropertyConnector},
      ],
    });

    abstractEntityHandler = TestBed.inject(AbstractEntityConnectionHandler);
    aspectHandler = TestBed.inject(AspectConnectionHandler);
    propertyHandler = TestBed.inject(PropertyConnectionHandler);
    characteristicHandler = TestBed.inject(CharacteristicConnectionHandler);
    constraintHandler = TestBed.inject(ConstraintConnectionHandler);
    eitherHandler = TestBed.inject(EitherConnectionHandler);
    entityHandler = TestBed.inject(EntityConnectionHandler);
    entityValueHandler = TestBed.inject(EntityValueConnectionHandler);
    eventHandler = TestBed.inject(EventConnectionHandler);
    operationHandler = TestBed.inject(OperationConnectionHandler);
    structuredValueHandler = TestBed.inject(StructuredValueConnectionHandler);
    traitHandler = TestBed.inject(TraitConnectionHandler);
  });

  const createMockCell = () => {
    const cell = new Cell();
    (cell as any).configuration = {};
    return cell;
  };

  it('AspectConnectionHandler should create property and add to aspect', () => {
    const aspect = new DefaultAspect({
      aspectModelUrn: 'urn:test#Aspect',
      name: 'Aspect',
      metaModelVersion: '2.0.0',
      properties: [],
      operations: [],
      events: [],
    });

    const sourceCell = createMockCell();
    vi.spyOn(aspectHandler as any, 'renderTree').mockReturnValue(createMockCell());

    aspectHandler.connect(aspect, sourceCell);

    expect(aspect.properties.length).toBe(1);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
  });

  it('AbstractEntityConnectionHandler should create abstract property and propagate to child entities', () => {
    const abstractEntity = new DefaultEntity({
      aspectModelUrn: 'urn:test#AbstractEntity',
      name: 'AbstractEntity',
      metaModelVersion: '2.0.0',
      properties: [],
    });

    const sourceCell = createMockCell();
    vi.spyOn(abstractEntityHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(abstractEntityHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    abstractEntityHandler.connect(abstractEntity, sourceCell);

    expect(abstractEntity.properties.length).toBe(1);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
    expect(mockMaxGraphService.formatShapes).toHaveBeenCalled();
  });

  it('EntityConnectionHandler should create property and add to entity', () => {
    const entity = new DefaultEntity({
      aspectModelUrn: 'urn:test#Entity',
      name: 'Entity',
      metaModelVersion: '2.0.0',
      properties: [],
    });

    const sourceCell = createMockCell();
    vi.spyOn(entityHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(entityHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    entityHandler.connect(entity, sourceCell);

    expect(entity.properties.length).toBe(1);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
  });

  it('PropertyConnectionHandler should create characteristic and assign to property', () => {
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#prop',
      name: 'prop',
      metaModelVersion: '2.0.0',
    });

    const sourceCell = createMockCell();
    vi.spyOn(propertyHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(propertyHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    propertyHandler.connect(prop, sourceCell);

    expect(prop.characteristic).toBeDefined();
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
  });

  it('PropertyConnectionHandler should not recreate characteristic if already present', () => {
    const char = new DefaultCharacteristic({aspectModelUrn: 'urn:test#char', name: 'char', metaModelVersion: '2.0.0'});
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#prop',
      name: 'prop',
      metaModelVersion: '2.0.0',
      characteristic: char,
    });

    const sourceCell = createMockCell();
    propertyHandler.connect(prop, sourceCell);
    expect(prop.characteristic).toBe(char);
  });

  it('EitherConnectionHandler should set left and right characteristics', () => {
    const either = new DefaultEither({
      aspectModelUrn: 'urn:test#either',
      name: 'either',
      metaModelVersion: '2.0.0',
      left: null as any,
      right: null as any,
    });

    const sourceCell = createMockCell();
    vi.spyOn(eitherHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(eitherHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    eitherHandler.connect(either, sourceCell, ModelInfo.IS_EITHER_LEFT);
    expect(either.left).toBeDefined();

    // Already defined warning
    eitherHandler.connect(either, sourceCell, ModelInfo.IS_EITHER_LEFT);
    expect(mockNotificationsService.warning).toHaveBeenCalled();

    eitherHandler.connect(either, sourceCell, ModelInfo.IS_EITHER_RIGHT);
    expect(either.right).toBeDefined();

    eitherHandler.connect(either, sourceCell, ModelInfo.IS_EITHER_RIGHT);
    expect(mockNotificationsService.warning).toHaveBeenCalled();
  });

  it('EntityValueConnectionHandler should assign to parent and format', () => {
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test#Entity', name: 'Entity', metaModelVersion: '2.0.0'});
    const entityValue = new DefaultEntityInstance({
      aspectModelUrn: 'urn:test#inst',
      name: 'inst',
      metaModelVersion: '2.0.0',
    });
    entityValue.type = entity;

    const sourceCell = createMockCell();
    entityValueHandler.connect(entityValue, sourceCell);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
    expect(mockMaxGraphService.formatShapes).toHaveBeenCalled();
  });

  it('StructuredValueConnectionHandler should create property and update deconstructionRule', () => {
    const sv = new DefaultStructuredValue({
      aspectModelUrn: 'urn:test#sv',
      name: 'sv',
      metaModelVersion: '2.0.0',
      elements: [],
      deconstructionRule: 'rule',
    });

    const sourceCell = createMockCell();
    vi.spyOn(structuredValueHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(structuredValueHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    structuredValueHandler.connect(sv, sourceCell);

    expect(sv.elements.length).toBe(1);
    expect(sv.deconstructionRule).toBe('rule(regex)');
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
  });

  it('OperationConnectionHandler should create input property and add to operation', () => {
    const operation = new DefaultOperation({
      aspectModelUrn: 'urn:test#op',
      name: 'op',
      metaModelVersion: '2.0.0',
      input: [],
    });

    const sourceCell = createMockCell();
    vi.spyOn(operationHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(operationHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    operationHandler.connect(operation, sourceCell, ModelInfo.IS_OPERATION_INPUT);

    expect(operation.input.length).toBe(1);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
  });

  it('OperationConnectionHandler should create output property when IS_OPERATION_OUTPUT', () => {
    const operation = new DefaultOperation({
      aspectModelUrn: 'urn:test#op',
      name: 'op',
      metaModelVersion: '2.0.0',
      input: [],
    });

    const sourceCell = createMockCell();
    vi.spyOn(operationHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(operationHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    operationHandler.connect(operation, sourceCell, ModelInfo.IS_OPERATION_OUTPUT);

    expect(operation.output).toBeDefined();
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();

    // Already defined output
    operationHandler.connect(operation, sourceCell, ModelInfo.IS_OPERATION_OUTPUT);
    expect(mockNotificationsService.warning).toHaveBeenCalled();
  });

  it('EventConnectionHandler should create parameter property and add to event', () => {
    const event = new DefaultEvent({
      aspectModelUrn: 'urn:test#evt',
      name: 'evt',
      metaModelVersion: '2.0.0',
      properties: [],
    });

    const sourceCell = createMockCell();
    vi.spyOn(eventHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(eventHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    eventHandler.connect(event, sourceCell);

    expect(event.properties.length).toBe(1);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
  });

  it('TraitConnectionHandler should create base characteristic if not present', () => {
    const trait = new DefaultTrait({
      aspectModelUrn: 'urn:test#trait',
      name: 'trait',
      metaModelVersion: '2.0.0',
    });

    const sourceCell = createMockCell();
    sourceCell.geometry = {x: 0, y: 0} as any;
    vi.spyOn(traitHandler as any, 'renderTree').mockReturnValue(createMockCell());
    vi.spyOn(traitHandler as any, 'refreshPropertiesLabel').mockImplementation(() => {});

    traitHandler.connect(trait, sourceCell);

    expect(trait.baseCharacteristic).toBeDefined();
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalled();
  });

  it('CharacteristicConnectionHandler should handle connection with modelInfo', () => {
    const char = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test#char',
      name: 'char',
      metaModelVersion: '2.0.0',
    });

    const sourceCell = createMockCell();
    vi.spyOn(characteristicHandler as any, 'createTrait').mockImplementation(() => {});

    characteristicHandler.connect(char, sourceCell, ModelInfo.IS_CHARACTERISTIC);

    expect(mockMaxGraphService.formatCell).toHaveBeenCalled();
  });

  it('CharacteristicConnectionHandler should handle IS_CHARACTERISTIC_DATATYPE with entity', () => {
    const char = new DefaultCharacteristic({
      aspectModelUrn: 'urn:test#char',
      name: 'char',
      metaModelVersion: '2.0.0',
    });

    const sourceCell = createMockCell();
    vi.spyOn(characteristicHandler as any, 'createEntity').mockImplementation(() => {});

    characteristicHandler.connect(char, sourceCell, ModelInfo.IS_CHARACTERISTIC_DATATYPE);
    expect((characteristicHandler as any).createEntity).toHaveBeenCalled();
  });

  it('ConstraintConnectionHandler should do nothing on connect as constraint children are not allowed', () => {
    const constraint = new DefaultConstraint({
      aspectModelUrn: 'urn:test#constraint',
      name: 'constraint',
      metaModelVersion: '2.0.0',
    });

    const sourceCell = createMockCell();

    expect(() => constraintHandler.connect(constraint, sourceCell)).not.toThrow();
  });
});
