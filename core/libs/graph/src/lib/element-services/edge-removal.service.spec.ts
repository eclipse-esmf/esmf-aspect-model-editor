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

import {FiltersService, LoadedFilesService} from '@ame/domain';
import {ElementRelationUtil, LanguageTranslationService, ModelFilter, NotificationsService} from '@ame/shared';
import {TestBed} from '@angular/core/testing';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  NamedElement,
} from '@esmf/aspect-model-loader';
import {beforeEach, describe, expect, it, Mock, vi} from 'vitest';
import {EntityInstancePort} from '../ports/entity-instance.port';
import {GraphAdapterPort} from '../ports/graph-adapter.port';
import {EdgeRemovalService, RemoveElementFn} from './edge-removal.service';
import {ModelRootService} from './model-root.service';

const VERSION = '2.2.0';
const urn = (name: string) => `urn:samm:org.eclipse.esmf.test:1.0.0#${name}`;

function cellOf(element: NamedElement): any {
  const cell = {id: element.aspectModelUrn, isEdge: () => false};
  ElementRelationUtil.setElementNode(cell as any, {element} as any);
  return cell;
}

function edgeBetween(source: any, target: any): any {
  return {id: `${source.id}->${target.id}`, isEdge: () => true, source, target};
}

describe('EdgeRemovalService', () => {
  let service: EdgeRemovalService;
  let graphAdapter: Record<string, Mock>;
  let loadedFilesService: any;
  let filtersService: any;
  let entityInstancePort: any;
  let modelRootService: any;
  let notificationsService: any;
  let removeElement: Mock<RemoveElementFn>;

  const configure = (withEntityInstancePort = true) => {
    TestBed.configureTestingModule({
      providers: [
        EdgeRemovalService,
        {provide: GraphAdapterPort, useValue: graphAdapter},
        {provide: LoadedFilesService, useValue: loadedFilesService},
        {provide: FiltersService, useValue: filtersService},
        {provide: ModelRootService, useValue: modelRootService},
        {provide: NotificationsService, useValue: notificationsService},
        ...(withEntityInstancePort ? [{provide: EntityInstancePort, useValue: entityInstancePort}] : []),
        {
          provide: LanguageTranslationService,
          useValue: {
            language: {
              notificationService: {
                cannotDeleteEdgeTitle: 'Cannot remove connection',
                cannotDeleteEdgeMessage: 'extern',
                cannotDeleteEdgeFilteredMessage: 'filtered',
              },
            },
          },
        },
      ],
    });
    service = TestBed.inject(EdgeRemovalService);
  };

  beforeEach(() => {
    graphAdapter = {
      containsCell: vi.fn().mockReturnValue(true),
      removeCells: vi.fn(),
      resolveParents: vi.fn().mockReturnValue([]),
      resolveCellByModelElement: vi.fn().mockReturnValue(null),
      updateCellLabel: vi.fn(),
      notifyGraphModelChanged: vi.fn(),
      checkAndAddShapeActionIcon: vi.fn(),
      findObsoleteEntityValueCells: vi.fn().mockReturnValue([]),
      removeComplexTypeShapeOverlays: vi.fn(),
      updateEntityValuesWithCellReference: vi.fn(),
    };
    loadedFilesService = {
      isElementExtern: vi.fn().mockReturnValue(false),
      currentLoadedFile: {cachedFile: {removeElement: vi.fn()}},
    };
    filtersService = {currentFilter: {filterType: ModelFilter.DEFAULT}};
    entityInstancePort = {
      onPropertyRemove: vi.fn((_property, callback) => callback()),
      onEntityDisconnect: vi.fn((_enumeration, _entity, callback) => callback()),
    };
    modelRootService = {getPredefinedService: vi.fn().mockReturnValue(null)};
    notificationsService = {warning: vi.fn()};
    removeElement = vi.fn<RemoveElementFn>();
  });

  describe('guards', () => {
    beforeEach(() => configure());

    it('should ignore cells which are no edges or are not part of the graph anymore', () => {
      const aspect = new DefaultAspect({name: 'A', aspectModelUrn: urn('A'), metaModelVersion: VERSION});
      const property = new DefaultProperty({name: 'p', aspectModelUrn: urn('p'), metaModelVersion: VERSION});
      const edge = edgeBetween(cellOf(aspect), cellOf(property));

      service.removeEdge(cellOf(aspect), removeElement);
      graphAdapter['containsCell'].mockReturnValue(false);
      service.removeEdge(edge, removeElement);

      expect(graphAdapter['removeCells']).not.toHaveBeenCalled();
      expect(notificationsService.warning).not.toHaveBeenCalled();
    });

    it('should warn and keep the connection while the model is filtered', () => {
      filtersService.currentFilter.filterType = ModelFilter.PROPERTIES;
      const aspect = new DefaultAspect({name: 'A', aspectModelUrn: urn('A'), metaModelVersion: VERSION, properties: []});
      const property = new DefaultProperty({name: 'p', aspectModelUrn: urn('p'), metaModelVersion: VERSION});
      aspect.properties.push(property);

      service.removeEdge(edgeBetween(cellOf(aspect), cellOf(property)), removeElement);

      expect(notificationsService.warning).toHaveBeenCalledWith(expect.objectContaining({message: 'filtered'}));
      expect(aspect.properties).toContain(property);
      expect(graphAdapter['removeCells']).not.toHaveBeenCalled();
    });

    it('should warn and keep the connection when the source element is extern', () => {
      loadedFilesService.isElementExtern.mockReturnValue(true);
      const property = new DefaultProperty({name: 'p', aspectModelUrn: urn('p'), metaModelVersion: VERSION});
      const characteristic = new DefaultCharacteristic({name: 'C', aspectModelUrn: urn('C'), metaModelVersion: VERSION});
      property.characteristic = characteristic;

      service.removeEdge(edgeBetween(cellOf(property), cellOf(characteristic)), removeElement);

      expect(notificationsService.warning).toHaveBeenCalledWith(expect.objectContaining({message: 'extern'}));
      expect(property.characteristic).toBe(characteristic);
    });
  });

  describe('generic connections', () => {
    beforeEach(() => configure());

    it('should remove a property from the aspect and keep both elements', () => {
      const aspect = new DefaultAspect({name: 'A', aspectModelUrn: urn('A'), metaModelVersion: VERSION, properties: []});
      const property = new DefaultProperty({name: 'p', aspectModelUrn: urn('p'), metaModelVersion: VERSION});
      aspect.properties.push(property);
      property.addParent(aspect);
      const edge = edgeBetween(cellOf(aspect), cellOf(property));

      service.removeEdge(edge, removeElement);

      expect(aspect.properties).not.toContain(property);
      expect(property.parents.some(parent => parent.aspectModelUrn === aspect.aspectModelUrn)).toBe(false);
      expect(graphAdapter['checkAndAddShapeActionIcon']).toHaveBeenCalledWith([edge], property);
      expect(graphAdapter['removeCells']).toHaveBeenCalledWith([edge]);
      expect(graphAdapter['updateCellLabel']).toHaveBeenCalledWith(edge.source);
      expect(graphAdapter['notifyGraphModelChanged']).toHaveBeenCalled();
      expect(removeElement).not.toHaveBeenCalled();
    });

    it('should remove the characteristic of a property', () => {
      const property = new DefaultProperty({name: 'p', aspectModelUrn: urn('p'), metaModelVersion: VERSION});
      const characteristic = new DefaultCharacteristic({name: 'C', aspectModelUrn: urn('C'), metaModelVersion: VERSION});
      property.characteristic = characteristic;
      const edge = edgeBetween(cellOf(property), cellOf(characteristic));

      service.removeEdge(edge, removeElement);

      expect(property.characteristic).toBeFalsy();
      expect(graphAdapter['removeCells']).toHaveBeenCalledWith([edge]);
    });

    it('should let predefined elements decouple their connection themselves', () => {
      const characteristic = new DefaultCharacteristic({name: 'C', aspectModelUrn: urn('C'), metaModelVersion: VERSION});
      const property = new DefaultProperty({name: 'p', aspectModelUrn: urn('p'), metaModelVersion: VERSION});
      Object.defineProperty(characteristic, 'isPredefined', {get: () => true});
      const decouple = vi.fn().mockReturnValue(true);
      modelRootService.getPredefinedService.mockReturnValue({decouple});
      const edge = edgeBetween(cellOf(characteristic), cellOf(property));

      service.removeEdge(edge, removeElement);

      expect(decouple).toHaveBeenCalledWith(edge, characteristic);
      expect(graphAdapter['removeCells']).not.toHaveBeenCalled();
      expect(graphAdapter['notifyGraphModelChanged']).toHaveBeenCalled();
    });
  });

  describe('inheritance', () => {
    beforeEach(() => configure());

    it('should remove the entity inheritance together with the refining properties', () => {
      const abstractProperty = new DefaultProperty({name: 'ap', aspectModelUrn: urn('ap'), metaModelVersion: VERSION});
      const abstractEntity = new DefaultEntity({
        name: 'AE',
        aspectModelUrn: urn('AE'),
        metaModelVersion: VERSION,
        properties: [abstractProperty],
      });
      const refiningProperty = new DefaultProperty({name: '[ap]', aspectModelUrn: urn('refining'), metaModelVersion: VERSION});
      refiningProperty.extends_ = abstractProperty;
      const ownProperty = new DefaultProperty({name: 'own', aspectModelUrn: urn('own'), metaModelVersion: VERSION});
      const entity = new DefaultEntity({
        name: 'E',
        aspectModelUrn: urn('E'),
        metaModelVersion: VERSION,
        properties: [refiningProperty, ownProperty],
      });
      entity.extends_ = abstractEntity;
      const refiningCell = cellOf(refiningProperty);
      graphAdapter['resolveCellByModelElement'].mockImplementation((element: NamedElement) =>
        element === refiningProperty ? refiningCell : null,
      );
      const edge = edgeBetween(cellOf(entity), cellOf(abstractEntity));

      service.removeEdge(edge, removeElement);

      expect(entity.extends_).toBeNull();
      expect(removeElement).toHaveBeenCalledWith(refiningCell);
      expect(removeElement).toHaveBeenCalledTimes(1);
      expect(graphAdapter['removeCells']).toHaveBeenCalledWith([edge]);
    });

    it('should remove an anonymous property extending an abstract property from its parents', () => {
      const abstractProperty = new DefaultProperty({name: 'ap', aspectModelUrn: urn('ap'), metaModelVersion: VERSION});
      Object.defineProperty(abstractProperty, 'isAbstract', {get: () => true});
      const extendingProperty = new DefaultProperty({name: '[ap]', aspectModelUrn: urn('extending'), metaModelVersion: VERSION});
      extendingProperty.extends_ = abstractProperty;
      const entity = new DefaultEntity({name: 'E', aspectModelUrn: urn('E'), metaModelVersion: VERSION, properties: [extendingProperty]});
      const entityCell = cellOf(entity);
      graphAdapter['resolveParents'].mockReturnValue([entityCell]);
      const edge = edgeBetween(cellOf(extendingProperty), cellOf(abstractProperty));

      service.removeEdge(edge, removeElement);

      expect(entity.properties).not.toContain(extendingProperty);
      expect(removeElement).toHaveBeenCalledWith(edge.source);
    });
  });

  describe('entity and entity instance connections', () => {
    let entity: DefaultEntity;
    let property: DefaultProperty;

    beforeEach(() => {
      property = new DefaultProperty({name: 'p', aspectModelUrn: urn('p'), metaModelVersion: VERSION});
      entity = new DefaultEntity({name: 'E', aspectModelUrn: urn('E'), metaModelVersion: VERSION, properties: [property]});
    });

    it('should remove an entity property after the entity instance confirmation', () => {
      configure();
      const edge = edgeBetween(cellOf(entity), cellOf(property));

      service.removeEdge(edge, removeElement);

      expect(entityInstancePort.onPropertyRemove).toHaveBeenCalledWith(property, expect.any(Function));
      expect(entity.properties).not.toContain(property);
      expect(graphAdapter['removeCells']).toHaveBeenCalledWith([edge]);
    });

    it('should keep the entity property when the confirmation is not accepted', () => {
      configure();
      entityInstancePort.onPropertyRemove.mockImplementation(() => undefined);

      service.removeEdge(edgeBetween(cellOf(entity), cellOf(property)), removeElement);

      expect(entity.properties).toContain(property);
      expect(graphAdapter['removeCells']).not.toHaveBeenCalled();
    });

    it('should remove the entity property directly without an entity instance port', () => {
      configure(false);
      const edge = edgeBetween(cellOf(entity), cellOf(property));

      service.removeEdge(edge, removeElement);

      expect(entity.properties).not.toContain(property);
      expect(graphAdapter['removeCells']).toHaveBeenCalledWith([edge]);
    });

    it('should disconnect an entity from an enumeration and remove the obsolete entity instances', () => {
      configure();
      const enumeration = new DefaultEnumeration({name: 'Enum', aspectModelUrn: urn('Enum'), metaModelVersion: VERSION, values: []});
      enumeration.dataType = entity;
      const obsoleteCells = [{id: 'instance'}];
      graphAdapter['findObsoleteEntityValueCells'].mockReturnValue(obsoleteCells);
      const edge = edgeBetween(cellOf(enumeration), cellOf(entity));

      service.removeEdge(edge, removeElement);

      expect(entityInstancePort.onEntityDisconnect).toHaveBeenCalledWith(enumeration, entity, expect.any(Function));
      expect(graphAdapter['removeComplexTypeShapeOverlays']).toHaveBeenCalledWith(edge.source);
      expect(graphAdapter['updateEntityValuesWithCellReference']).toHaveBeenCalledWith(obsoleteCells);
      expect(graphAdapter['removeCells']).toHaveBeenCalledWith(obsoleteCells);
      expect(graphAdapter['removeCells']).toHaveBeenCalledWith([edge]);
      expect(enumeration.dataType).toBeFalsy();
    });

    it('should remove an entity instance which loses its last enumeration', () => {
      configure();
      const instance = new DefaultEntityInstance({name: 'i', aspectModelUrn: urn('i'), metaModelVersion: VERSION, type: entity});
      const enumeration = new DefaultEnumeration({
        name: 'Enum',
        aspectModelUrn: urn('Enum'),
        metaModelVersion: VERSION,
        values: [instance],
      });
      instance.addParent(enumeration);
      const edge = edgeBetween(cellOf(enumeration), cellOf(instance));

      service.removeEdge(edge, removeElement);

      expect(enumeration.values).not.toContain(instance);
      expect(removeElement).toHaveBeenCalledWith(edge.target);
      expect(graphAdapter['removeCells']).not.toHaveBeenCalled();
    });

    it('should only remove the connection of an entity instance used by another enumeration', () => {
      configure();
      const instance = new DefaultEntityInstance({name: 'i', aspectModelUrn: urn('i'), metaModelVersion: VERSION, type: entity});
      const enumeration = new DefaultEnumeration({name: 'E1', aspectModelUrn: urn('E1'), metaModelVersion: VERSION, values: [instance]});
      const otherEnumeration = new DefaultEnumeration({
        name: 'E2',
        aspectModelUrn: urn('E2'),
        metaModelVersion: VERSION,
        values: [instance],
      });
      instance.addParent(enumeration);
      instance.addParent(otherEnumeration);
      const edge = edgeBetween(cellOf(enumeration), cellOf(instance));

      service.removeEdge(edge, removeElement);

      expect(enumeration.values).not.toContain(instance);
      expect(otherEnumeration.values).toContain(instance);
      expect(graphAdapter['removeCells']).toHaveBeenCalledWith([edge]);
      expect(removeElement).not.toHaveBeenCalled();
    });

    it('should remove an entity instance which loses its entity', () => {
      configure();
      const instance = new DefaultEntityInstance({name: 'i', aspectModelUrn: urn('i'), metaModelVersion: VERSION, type: entity});
      const edge = edgeBetween(cellOf(instance), cellOf(entity));

      service.removeEdge(edge, removeElement);

      expect(removeElement).toHaveBeenCalledWith(edge.source);
      expect(graphAdapter['removeCells']).not.toHaveBeenCalled();
    });

    it('should remove a nested entity instance value from its parent instance', () => {
      configure();
      const parentInstance = new DefaultEntityInstance({
        name: 'parent',
        aspectModelUrn: urn('parent'),
        metaModelVersion: VERSION,
        type: entity,
      });
      const childInstance = new DefaultEntityInstance({
        name: 'child',
        aspectModelUrn: urn('child'),
        metaModelVersion: VERSION,
        type: entity,
      });
      parentInstance.setAssertion(property.aspectModelUrn, childInstance);
      childInstance.addParent(parentInstance);
      const edge = edgeBetween(cellOf(parentInstance), cellOf(childInstance));

      service.removeEdge(edge, removeElement);

      expect(parentInstance.getTuples().some(([, value]) => value === childInstance)).toBe(false);
      expect(removeElement).toHaveBeenCalledWith(edge.target);
    });
  });
});
