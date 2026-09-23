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

import {ElementRelationUtil, ENTITY_INSTANCE_SERVICE, IEntityInstanceService, useUpdater} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {BaseEntityModelService} from './base-entity-model.service';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class AbstractEntityModelService extends BaseModelService {
  private readonly entityInstanceService = inject<IEntityInstanceService>(ENTITY_INSTANCE_SERVICE, {optional: true});
  private readonly baseEntityModel = inject(BaseEntityModelService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEntity && Boolean(metaModelElement.isAbstractEntity());
  }

  update(cell: any, form: {[key: string]: any}) {
    const metaModelElement = ElementRelationUtil.getModelElement<DefaultEntity>(cell);

    if (form.editedProperties) {
      if (!metaModelElement.propertiesPayload) {
        metaModelElement.propertiesPayload = {};
      }
      for (const property of metaModelElement.properties) {
        const newKeys: Record<string, any> = form.editedProperties[property.aspectModelUrn];
        if (!newKeys) {
          continue;
        }
        if (!metaModelElement.propertiesPayload[property.aspectModelUrn]) {
          metaModelElement.propertiesPayload[property.aspectModelUrn] = {} as any;
        }

        metaModelElement.propertiesPayload[property.aspectModelUrn].notInPayload = newKeys.notInPayload;
        metaModelElement.propertiesPayload[property.aspectModelUrn].optional = newKeys.optional;
        metaModelElement.propertiesPayload[property.aspectModelUrn].payloadName = newKeys.payloadName;
      }
    }

    super.update(cell, form);
    this.baseEntityModel.checkExtendedElement(metaModelElement, form?.extends);
    this.graphAdapter?.updateCell(cell);
  }

  delete(cell: any) {
    const modelElement = ElementRelationUtil.getModelElement<DefaultEntity>(cell);
    const outgoingEdges = this.graphAdapter?.getOutgoingEdges(cell) || [];
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];

    const extendingProperties = [];
    for (const edge of incomingEdges) {
      const properties = (this.graphAdapter?.getOutgoingEdges(edge.source) || [])
        .filter(e => {
          const property = ElementRelationUtil.getModelElement<DefaultProperty>(e.target);
          return property instanceof DefaultProperty && !!property.extends_;
        })
        .map(e => e.target);
      extendingProperties.push(...properties);

      const entity = ElementRelationUtil.getModelElement<DefaultEntity>(edge.source);
      if (entity instanceof DefaultEntity) {
        entity.extends_ = null;
        ElementRelationUtil.removeRelation(entity, modelElement);
        for (const property of properties) {
          ElementRelationUtil.removeRelation(entity, ElementRelationUtil.getModelElement(property));
        }
        this.graphAdapter?.setCellPropertiesLabel(edge.source);
      }
    }

    this.graphAdapter?.removeCells(extendingProperties);
    this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
    super.delete(cell);

    this.graphAdapter?.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.graphAdapter?.checkAndAddShapeActionIcon(incomingEdges, modelElement);

    const onEntityRemoveCallback = () => {
      if (!cell?.edges) {
        this.graphAdapter?.removeCells([cell]);
        return;
      }

      const entityValuesToDelete = [];
      for (const edge of cell.edges) {
        const element = ElementRelationUtil.getModelElement(edge.source);
        if (element && this.loadedFilesService.isElementInCurrentFile(element)) {
          this.currentCachedFile.removeElement(element.aspectModelUrn);
          useUpdater(modelElement).delete(element);
        }

        if (element instanceof DefaultEnumeration) {
          // we need to remove and add back the + button for enumeration
          this.graphAdapter?.removeComplexTypeShapeOverlays(edge.source);
          this.graphAdapter?.addBottomShapeOverlay(edge.source);
        }

        if (element instanceof DefaultEntityInstance && edge.source?.style?.fillColor?.includes?.('entityValue')) {
          entityValuesToDelete.push(edge.source);
        }
      }
      this.graphAdapter?.updateEntityValuesWithCellReference(entityValuesToDelete);
      this.graphAdapter?.removeCells([cell, ...entityValuesToDelete]);
    };

    if (this.entityInstanceService) {
      this.entityInstanceService.onEntityRemove(modelElement, onEntityRemoveCallback);
    } else {
      onEntityRemoveCallback();
    }
  }
}
