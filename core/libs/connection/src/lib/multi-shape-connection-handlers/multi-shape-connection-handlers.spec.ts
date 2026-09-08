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
import {MaxGraphAttributeService, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ElementCreatorService, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultValue,
} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {
  AbstractEntityAbstractEntityConnectionHandler,
  AbstractEntityAbstractPropertyConnectionHandler,
  AbstractEntityPropertyConnectionHandler,
  AbstractPropertyAbstractPropertyConnectionHandler,
  AspectEventConnectionHandler,
  AspectPropertyConnectionHandler,
  CharacteristicEntityConnectionHandler,
  CharacteristicUnitConnectionHandler,
  CollectionCharacteristicConnectionHandler,
  EitherCharacteristicLeftConnectionHandler,
  EitherCharacteristicRightConnectionHandler,
  EntityAbstractEntityConnectionHandler,
  EntityEntityConnectionHandler,
  EntityPropertyConnectionHandler,
  EnumerationEntityValueConnectionHandler,
  EnumerationValueConnectionHandler,
  EventPropertyConnectionHandler,
  OperationPropertyInputConnectionHandler,
  OperationPropertyOutputConnectionHandler,
  PropertyAbstractPropertyConnectionHandler,
  PropertyCharacteristicConnectionHandler,
  PropertyPropertyConnectionHandler,
  PropertyStructuredValueConnectionHandler,
  PropertyValueConnectionHandler,
  StructuredValueCharacteristicPropertyConnectionHandler,
  TraitWithCharacteristicOrConstraintConnectionHandler,
} from './index';

describe('Multi Shape Connection Handlers', () => {
  const mockMaxGraphService = {
    graph: {
      getIncomingEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      labelChanged: vi.fn(),
    },
    assignToParent: vi.fn(),
    formatCell: vi.fn(),
    formatShapes: vi.fn(),
    removeCells: vi.fn(),
    resolveParents: vi.fn().mockReturnValue([]),
    resolveCellByModelElement: vi.fn().mockImplementation(() => new Cell()),
  };

  const mockNotificationsService = {
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  };

  const mockTranslate = {
    language: {
      notificationService: {
        childForPredefinedElementError: 'Child cannot be added to predefined element',
        recursiveElements: 'Recursive elements',
        circularConnectionMessage: 'Circular connection detected',
        missingParentEntity: 'Missing parent entity',
        abstractPropertyParentRequirement: 'Abstract property parent requirement',
        illegalOperationMessage: 'Illegal operation',
        propertyExtensionConflict: 'Property extension conflict',
      },
    },
  };

  const mockLoadedFiles = {
    currentLoadedFile: {
      namespace: 'urn:test',
      cachedFile: {
        resolveInstance: vi.fn().mockImplementation(el => el),
        removeElement: vi.fn(),
      },
    },
  };

  const mockElementCreator = {
    createEmptyElement: vi.fn().mockImplementation((type: any) => {
      if (type === DefaultCharacteristic) {
        return new DefaultCharacteristic({aspectModelUrn: 'urn:test#char', name: 'char', metaModelVersion: '2.0.0'});
      }
      return null;
    }),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AbstractEntityAbstractEntityConnectionHandler,
        AbstractEntityAbstractPropertyConnectionHandler,
        AbstractEntityPropertyConnectionHandler,
        AbstractPropertyAbstractPropertyConnectionHandler,
        AspectEventConnectionHandler,
        AspectPropertyConnectionHandler,
        CharacteristicEntityConnectionHandler,
        CharacteristicUnitConnectionHandler,
        CollectionCharacteristicConnectionHandler,
        EitherCharacteristicLeftConnectionHandler,
        EitherCharacteristicRightConnectionHandler,
        EntityAbstractEntityConnectionHandler,
        EntityEntityConnectionHandler,
        EntityPropertyConnectionHandler,
        EnumerationEntityValueConnectionHandler,
        EnumerationValueConnectionHandler,
        EventPropertyConnectionHandler,
        OperationPropertyInputConnectionHandler,
        OperationPropertyOutputConnectionHandler,
        PropertyAbstractPropertyConnectionHandler,
        PropertyCharacteristicConnectionHandler,
        PropertyPropertyConnectionHandler,
        PropertyStructuredValueConnectionHandler,
        PropertyValueConnectionHandler,
        StructuredValueCharacteristicPropertyConnectionHandler,
        TraitWithCharacteristicOrConstraintConnectionHandler,
        FiltersService,
        {provide: EntityInstanceService, useValue: {onNewProperty: vi.fn()}},
        {provide: MaxGraphService, useValue: mockMaxGraphService},
        {provide: MaxGraphAttributeService, useValue: {graph: mockMaxGraphService.graph}},
        {provide: NotificationsService, useValue: mockNotificationsService},
        {provide: LanguageTranslationService, useValue: mockTranslate},
        {provide: SammLanguageSettingsService, useValue: {currentLanguage: 'en'}},
        {provide: LoadedFilesService, useValue: mockLoadedFiles},
        {provide: ElementCreatorService, useValue: mockElementCreator},
        {
          provide: MaxGraphShapeOverlayService,
          useValue: {
            removeOverlay: vi.fn(),
            addComplexEnumerationShapeOverlay: vi.fn(),
            addBottomShapeOverlay: vi.fn(),
            removeComplexTypeShapeOverlays: vi.fn(),
          },
        },
      ],
    });
  });

  const createMockCell = () => {
    const cell = new Cell();
    (cell as any).configuration = {fields: []};
    return cell;
  };

  it('AspectEventConnectionHandler should connect event to aspect', () => {
    const handler = TestBed.inject(AspectEventConnectionHandler);
    const aspect = new DefaultAspect({aspectModelUrn: 'urn:test#aspect', name: 'aspect', metaModelVersion: '2.0.0', events: []});
    const event = new DefaultEvent({aspectModelUrn: 'urn:test#evt', name: 'evt', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(aspect, event, parentCell, childCell);

    expect(aspect.events.length).toBe(1);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalledWith(childCell, parentCell);
  });

  it('AspectPropertyConnectionHandler should connect property and operation to aspect', () => {
    const handler = TestBed.inject(AspectPropertyConnectionHandler);
    const aspect = new DefaultAspect({
      aspectModelUrn: 'urn:test#aspect',
      name: 'aspect',
      metaModelVersion: '2.0.0',
      properties: [],
      operations: [],
    });
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const op = new DefaultOperation({aspectModelUrn: 'urn:test#op', name: 'op', metaModelVersion: '2.0.0', input: []});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(aspect, prop, parentCell, childCell);
    expect(aspect.properties.length).toBe(1);

    handler.connect(aspect, op, parentCell, childCell);
    expect(aspect.operations.length).toBe(1);
  });

  it('EntityPropertyConnectionHandler should connect property to entity', () => {
    const handler = TestBed.inject(EntityPropertyConnectionHandler);
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test#entity', name: 'entity', metaModelVersion: '2.0.0', properties: []});
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(entity, prop, parentCell, childCell);

    expect(entity.properties.length).toBe(1);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalledWith(childCell, parentCell);
  });

  it('AbstractEntityPropertyConnectionHandler should connect property if parent is abstract entity', () => {
    const handler = TestBed.inject(AbstractEntityPropertyConnectionHandler);
    const entity = new DefaultEntity({aspectModelUrn: 'urn:test#abEntity', name: 'abEntity', metaModelVersion: '2.0.0', properties: []});
    vi.spyOn(entity, 'isAbstractEntity').mockReturnValue(true);
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(entity, prop, parentCell, childCell);

    expect(entity.properties.length).toBe(1);
  });

  it('EventPropertyConnectionHandler should connect property to event', () => {
    const handler = TestBed.inject(EventPropertyConnectionHandler);
    const event = new DefaultEvent({aspectModelUrn: 'urn:test#evt', name: 'evt', metaModelVersion: '2.0.0', properties: []});
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(event, prop, parentCell, childCell);

    expect(event.properties.length).toBe(1);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalledWith(childCell, parentCell);
  });

  it('OperationPropertyInputConnectionHandler and OutputConnectionHandler should connect input/output', () => {
    const inputHandler = TestBed.inject(OperationPropertyInputConnectionHandler);
    const outputHandler = TestBed.inject(OperationPropertyOutputConnectionHandler);
    const op = new DefaultOperation({aspectModelUrn: 'urn:test#op', name: 'op', metaModelVersion: '2.0.0', input: []});
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    inputHandler.connect(op, prop, parentCell, childCell);
    expect(op.input.length).toBe(1);

    outputHandler.connect(op, prop, parentCell, childCell);
    expect(op.output).toBe(prop);
  });

  it('CollectionCharacteristicConnectionHandler should connect characteristic to collection', () => {
    const handler = TestBed.inject(CollectionCharacteristicConnectionHandler);
    const coll = new DefaultCollection({aspectModelUrn: 'urn:test#coll', name: 'coll', metaModelVersion: '2.0.0'});
    const char = new DefaultCharacteristic({aspectModelUrn: 'urn:test#char', name: 'char', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(coll, char, parentCell, childCell);

    expect(coll.elementCharacteristic).toBe(char);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalledWith(childCell, parentCell);
  });

  it('EitherCharacteristicLeftConnectionHandler and RightConnectionHandler should set either sides', () => {
    const leftHandler = TestBed.inject(EitherCharacteristicLeftConnectionHandler);
    const rightHandler = TestBed.inject(EitherCharacteristicRightConnectionHandler);
    const either = new DefaultEither({
      aspectModelUrn: 'urn:test#either',
      name: 'either',
      metaModelVersion: '2.0.0',
      left: null as any,
      right: null as any,
    });
    const char1 = new DefaultCharacteristic({aspectModelUrn: 'urn:test#c1', name: 'c1', metaModelVersion: '2.0.0'});
    const char2 = new DefaultCharacteristic({aspectModelUrn: 'urn:test#c2', name: 'c2', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    leftHandler.connect(either, char1, parentCell, childCell);
    expect(either.left).toBe(char1);

    rightHandler.connect(either, char2, parentCell, childCell);
    expect(either.right).toBe(char2);
  });

  it('EnumerationEntityValueConnectionHandler and EnumerationValueConnectionHandler should connect values', () => {
    const entityValueHandler = TestBed.inject(EnumerationEntityValueConnectionHandler);
    const valueHandler = TestBed.inject(EnumerationValueConnectionHandler);

    const enumModel = new DefaultEnumeration({aspectModelUrn: 'urn:test#enum', name: 'enum', metaModelVersion: '2.0.0', values: []});
    const entityInst = new DefaultEntityInstance({aspectModelUrn: 'urn:test#inst', name: 'inst', metaModelVersion: '2.0.0'});
    const val = new DefaultValue({aspectModelUrn: 'urn:test#val', name: 'val', metaModelVersion: '2.0.0', value: 'val'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    entityValueHandler.connect(enumModel, entityInst, parentCell, childCell);
    expect(enumModel.values.length).toBe(1);

    valueHandler.connect(enumModel, val, parentCell, childCell);
    expect(enumModel.values.length).toBe(2);
  });

  it('PropertyCharacteristicConnectionHandler should connect characteristic to property', () => {
    const handler = TestBed.inject(PropertyCharacteristicConnectionHandler);
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const char = new DefaultCharacteristic({aspectModelUrn: 'urn:test#char', name: 'char', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(prop, char, parentCell, childCell);

    expect(prop.characteristic).toBe(char);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalledWith(childCell, parentCell);
  });

  it('PropertyStructuredValueConnectionHandler should prevent recursive connections', () => {
    const handler = TestBed.inject(PropertyStructuredValueConnectionHandler);
    const prop = new DefaultProperty({aspectModelUrn: 'urn:test#prop', name: 'prop', metaModelVersion: '2.0.0'});
    const sv = new DefaultStructuredValue({
      aspectModelUrn: 'urn:test#sv',
      name: 'sv',
      metaModelVersion: '2.0.0',
      elements: [],
      deconstructionRule: 'rule',
    });
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(prop, sv, parentCell, childCell);
    expect(mockMaxGraphService.assignToParent).toHaveBeenCalledWith(childCell, parentCell);
  });

  it('TraitWithCharacteristicOrConstraintConnectionHandler should connect constraint or characteristic', () => {
    const handler = TestBed.inject(TraitWithCharacteristicOrConstraintConnectionHandler);
    const trait = new DefaultTrait({aspectModelUrn: 'urn:test#trait', name: 'trait', metaModelVersion: '2.0.0', constraints: []});
    const constraint = new DefaultConstraint({aspectModelUrn: 'urn:test#constraint', name: 'constraint', metaModelVersion: '2.0.0'});
    const char = new DefaultCharacteristic({aspectModelUrn: 'urn:test#char', name: 'char', metaModelVersion: '2.0.0'});
    const parentCell = createMockCell();
    const childCell = createMockCell();

    handler.connect(trait, constraint, parentCell, childCell);
    expect(trait.constraints.length).toBe(1);

    handler.connect(trait, char, parentCell, childCell);
    expect(trait.baseCharacteristic).toBe(char);
  });
});
