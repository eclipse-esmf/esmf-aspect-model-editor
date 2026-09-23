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
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, NamedElement} from '@esmf/aspect-model-loader';
import {BaseEntityModelService} from './base-entity-model.service';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class EntityModelService extends BaseModelService {
  private readonly entityInstanceService = inject<IEntityInstanceService>(ENTITY_INSTANCE_SERVICE, {optional: true});
  private readonly baseEntityModel = inject(BaseEntityModelService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEntity;
  }

  update(cell: any, form: {[key: string]: any}) {
    const modelElement = ElementRelationUtil.getModelElement<DefaultEntity>(cell);

    if (form.editedProperties) {
      if (!modelElement.propertiesPayload) {
        modelElement.propertiesPayload = {};
      }
      for (const property of modelElement.properties) {
        const newKeys = form.editedProperties[property.aspectModelUrn];
        if (!newKeys) {
          continue;
        }
        if (!modelElement.propertiesPayload[property.aspectModelUrn]) {
          modelElement.propertiesPayload[property.aspectModelUrn] = {} as any;
        }

        modelElement.propertiesPayload[property.aspectModelUrn].notInPayload = newKeys.notInPayload;
        modelElement.propertiesPayload[property.aspectModelUrn].optional = newKeys.optional;
        modelElement.propertiesPayload[property.aspectModelUrn].payloadName = newKeys.payloadName;
      }
    }

    super.update(cell, form);
    this.baseEntityModel.checkExtendedElement(modelElement, form?.extends);
    this.graphAdapter?.updateCell(cell);
  }

  delete(cell: any) {
    this.updateExtends(cell);
    super.delete(cell);
    const modelElement = ElementRelationUtil.getModelElement<DefaultEntity>(cell);
    const outgoingEdges = this.graphAdapter?.getOutgoingEdges(cell) || [];
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    this.graphAdapter?.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.graphAdapter?.checkAndAddShapeActionIcon(incomingEdges, modelElement);

    const onEntityRemoveCallback = () => {
      if (!cell?.edges) {
        this.graphAdapter?.removeCells([cell]);
        return;
      }

      const entityValuesToDelete = [];
      for (const edge of cell.edges) {
        const sourceModelElement = ElementRelationUtil.getModelElement<NamedElement>(edge.source);
        if (sourceModelElement && this.loadedFilesService.isElementInCurrentFile(sourceModelElement)) {
          this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
          useUpdater(sourceModelElement).delete(modelElement);
        }

        if (sourceModelElement instanceof DefaultEnumeration) {
          // we need to remove and add back the + button for enumeration
          this.graphAdapter?.removeComplexTypeShapeOverlays(edge.source);
          this.graphAdapter?.addBottomShapeOverlay(edge.source);
        }

        if (sourceModelElement instanceof DefaultEntityInstance && edge.source?.style?.fillColor?.includes?.('entityValue')) {
          entityValuesToDelete.push(edge.source);
          ElementRelationUtil.removeRelation(sourceModelElement, modelElement);
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

  private updateExtends(cell: any) {
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    for (const edge of incomingEdges) {
      const entity = ElementRelationUtil.getModelElement<DefaultEntity>(edge.source);
      if (!(entity instanceof DefaultEntity)) {
        continue;
      }

      entity.extends_ = null;
      ElementRelationUtil.removeRelation(entity, ElementRelationUtil.getModelElement(cell));
      this.graphAdapter?.setCellPropertiesLabel(edge.source);
    }
  }
}
