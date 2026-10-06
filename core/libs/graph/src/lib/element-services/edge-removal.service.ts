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
import {ElementRelationUtil, LanguageTranslationService, ModelFilter, NotificationsService, useUpdater} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {EntityInstancePort} from '../ports/entity-instance.port';
import {GraphAdapterPort} from '../ports/graph-adapter.port';
import {ModelRootService} from './model-root.service';

/** Removes a vertex together with its model data (provided by the {@link ElementModelService}). */
export type RemoveElementFn = (cell: any) => void;

/**
 * Removes the connection represented by a graph edge from the aspect model.
 *
 * Deleting an edge only decouples the two elements. Both elements stay in the model, except for elements
 * which cannot exist without the connection (anonymous properties extending an abstract property and
 * entity instances which lose their type or their last enumeration).
 */
@Injectable({providedIn: 'root'})
export class EdgeRemovalService {
  private readonly graphAdapter = inject(GraphAdapterPort, {optional: true});
  private readonly modelRootService = inject(ModelRootService);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly filtersService = inject(FiltersService, {optional: true});
  private readonly entityInstanceService = inject(EntityInstancePort, {optional: true});
  private readonly notificationService = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);

  private get currentCachedFile() {
    return this.loadedFilesService.currentLoadedFile.cachedFile;
  }

  removeEdge(edge: any, removeElement: RemoveElementFn): void {
    if (!edge?.isEdge?.() || !edge.source || !edge.target || !this.graphAdapter?.containsCell(edge)) {
      return;
    }

    const source = ElementRelationUtil.getModelElement<NamedElement>(edge.source);
    const target = ElementRelationUtil.getModelElement<NamedElement>(edge.target);

    if (!source || !target) {
      return;
    }

    if (this.filtersService?.currentFilter?.filterType && this.filtersService.currentFilter.filterType !== ModelFilter.DEFAULT) {
      this.warn('cannotDeleteEdgeFilteredMessage');
      return;
    }

    if (this.loadedFilesService.isElementExtern(source)) {
      this.warn('cannotDeleteEdgeMessage');
      return;
    }

    if (this.removeExtendingProperty(edge, source, target, removeElement)) return;

    if (source.isPredefined) {
      const predefinedService = this.modelRootService.getPredefinedService(source);
      if (predefinedService?.decouple?.(edge, source)) {
        this.graphAdapter.notifyGraphModelChanged();
        return;
      }
    }

    if (this.removeExtends(edge, source, target, removeElement)) return;
    if (this.removeEntityProperty(edge, source, target, removeElement)) return;
    if (this.removeEnumerationEntityInstance(edge, source, target, removeElement)) return;
    if (this.removeEnumerationEntity(edge, source, target)) return;
    if (this.removeEntityInstanceConnection(edge, source, target, removeElement)) return;

    this.disconnect(edge, source, target);
  }

  /** `[ samm:extends :abstractProperty ]` - the anonymous extending property cannot exist without its parent. */
  private removeExtendingProperty(edge: any, source: NamedElement, target: NamedElement, removeElement: RemoveElementFn): boolean {
    if (!(
      source instanceof DefaultProperty &&
      !source.isAbstract &&
      target instanceof DefaultProperty &&
      this.isExtendsEdge(source, target)
    )) {
      return false;
    }

    for (const parentCell of this.graphAdapter.resolveParents(edge.source)) {
      useUpdater(ElementRelationUtil.getModelElement(parentCell)).delete?.(source);
    }
    removeElement(edge.source);
    this.graphAdapter.notifyGraphModelChanged();
    return true;
  }

  /** Entity → (Abstract) Entity and Abstract Property → Abstract Property inheritance. */
  private removeExtends(edge: any, source: NamedElement, target: NamedElement, removeElement: RemoveElementFn): boolean {
    const isEntityExtends = source instanceof DefaultEntity && target instanceof DefaultEntity;
    const isPropertyExtends = source instanceof DefaultProperty && target instanceof DefaultProperty;
    if (!(isEntityExtends || isPropertyExtends) || !this.isExtendsEdge(source, target)) {
      return false;
    }

    if (source instanceof DefaultEntity && target instanceof DefaultEntity) {
      // Properties refining the inherited (abstract) properties are invalid without the inheritance.
      const inheritedUrns = new Set(target.properties.map(property => property.aspectModelUrn));
      const refiningProperties = source.properties.filter(
        property => property.extends_ && inheritedUrns.has((property.extends_ as NamedElement).aspectModelUrn),
      );

      for (const property of refiningProperties) {
        const propertyCell = this.graphAdapter.resolveCellByModelElement(property);
        if (propertyCell) {
          removeElement(propertyCell);
        } else {
          useUpdater(source).delete(property);
          this.currentCachedFile.removeElement(property.aspectModelUrn);
        }
      }
    }

    (source as DefaultEntity | DefaultProperty).extends_ = null;
    this.disconnect(edge, source, target);
    return true;
  }

  private removeEntityProperty(edge: any, source: NamedElement, target: NamedElement, removeElement: RemoveElementFn): boolean {
    if (!(source instanceof DefaultEntity && target instanceof DefaultProperty)) {
      return false;
    }

    const removeConnection = () => {
      if (!this.graphAdapter.containsCell(edge)) return;

      if (target.extends_) {
        useUpdater(source).delete(target);
        removeElement(edge.target);
        this.graphAdapter.updateCellLabel(edge.source);
        this.graphAdapter.notifyGraphModelChanged();
        return;
      }

      this.disconnect(edge, source, target);
    };

    if (this.entityInstanceService) {
      this.entityInstanceService.onPropertyRemove(target, removeConnection);
    } else {
      removeConnection();
    }
    return true;
  }

  private removeEnumerationEntityInstance(edge: any, source: NamedElement, target: NamedElement, removeElement: RemoveElementFn): boolean {
    if (!(source instanceof DefaultEnumeration && target instanceof DefaultEntityInstance)) {
      return false;
    }

    source.values = (source.values || []).filter(value => (value as NamedElement)?.aspectModelUrn !== target.aspectModelUrn);
    target.removeParent(source);

    if (target.parents.some(parent => parent instanceof DefaultEnumeration)) {
      this.graphAdapter.removeCells([edge]);
    } else {
      removeElement(edge.target);
    }

    this.graphAdapter.updateCellLabel(edge.source);
    this.graphAdapter.notifyGraphModelChanged();
    return true;
  }

  private removeEnumerationEntity(edge: any, source: NamedElement, target: NamedElement): boolean {
    if (!(source instanceof DefaultEnumeration && target instanceof DefaultEntity)) {
      return false;
    }

    const removeConnection = () => {
      if (!this.graphAdapter.containsCell(edge)) return;

      const obsoleteEntityValueCells = this.graphAdapter.findObsoleteEntityValueCells(edge);
      this.graphAdapter.removeComplexTypeShapeOverlays(edge.source);
      this.graphAdapter.updateEntityValuesWithCellReference(obsoleteEntityValueCells);
      this.graphAdapter.removeCells(obsoleteEntityValueCells);
      this.disconnect(edge, source, target);
    };

    if (this.entityInstanceService) {
      this.entityInstanceService.onEntityDisconnect(source, target, removeConnection);
    } else {
      removeConnection();
    }
    return true;
  }

  /** Entity instance → Entity (its type) or Entity instance → nested Entity instance (a property value). */
  private removeEntityInstanceConnection(edge: any, source: NamedElement, target: NamedElement, removeElement: RemoveElementFn): boolean {
    if (!(source instanceof DefaultEntityInstance)) {
      return false;
    }

    if (target instanceof DefaultEntity) {
      // An entity instance without its entity is invalid.
      removeElement(edge.source);
      this.graphAdapter.notifyGraphModelChanged();
      return true;
    }

    if (target instanceof DefaultEntityInstance) {
      for (const [propertyUrn, value] of source.getTuples()) {
        if (value instanceof DefaultEntityInstance && value.aspectModelUrn === target.aspectModelUrn) {
          source.removeAssertion(propertyUrn, value);
        }
      }
      target.removeParent(source);

      if (target.parents.length > 0) {
        this.graphAdapter.removeCells([edge]);
      } else {
        removeElement(edge.target);
      }

      this.graphAdapter.updateCellLabel(edge.source);
      this.graphAdapter.notifyGraphModelChanged();
      return true;
    }

    return false;
  }

  private disconnect(edge: any, source: NamedElement, target: NamedElement): void {
    ElementRelationUtil.removeRelation(source, target);
    useUpdater(source).delete?.(target);

    // Re-adds the "+" overlay e.g. on a property which lost its characteristic.
    this.graphAdapter.checkAndAddShapeActionIcon([edge], target);
    this.graphAdapter.removeCells([edge]);
    this.graphAdapter.updateCellLabel(edge.source);
    this.graphAdapter.notifyGraphModelChanged();
  }

  private isExtendsEdge(source: NamedElement, target: NamedElement): boolean {
    const extended = (source as DefaultEntity | DefaultProperty).extends_ as NamedElement | null;
    return !!extended && extended.aspectModelUrn === target.aspectModelUrn;
  }

  private warn(messageKey: 'cannotDeleteEdgeMessage' | 'cannotDeleteEdgeFilteredMessage'): void {
    const texts = this.translate.language?.notificationService;
    this.notificationService.warning({
      title: texts?.cannotDeleteEdgeTitle,
      message: texts?.[messageKey],
      timeout: 5000,
    });
  }
}
