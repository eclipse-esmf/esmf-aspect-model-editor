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

import {EntityInstanceService} from '@ame/editor';
import {
  AbstractEntityRenderService,
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphService,
  MaxGraphShapeOverlayService,
  MaxGraphVisitorHelper,
} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {useUpdater} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseEntityModelService} from './base-entity-model.service';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class AbstractEntityModelService extends BaseModelService {
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly entityInstanceService = inject(EntityInstanceService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly abstractEntityRenderer = inject(AbstractEntityRenderService);
  private readonly baseEntityModel = inject(BaseEntityModelService);
  private readonly languageService = inject(SammLanguageSettingsService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEntity && Boolean(metaModelElement.isAbstractEntity());
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const metaModelElement = MaxGraphHelper.getModelElement<DefaultEntity>(cell);

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
    this.abstractEntityRenderer.update({cell});
  }

  delete(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultEntity>(cell);
    const outgoingEdges = this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null);
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);

    const extendingProperties = [];
    for (const edge of incomingEdges) {
      const properties = this.maxgraphService.graph
        .getOutgoingEdges(edge.source, null)
        .filter(e => {
          const property = MaxGraphHelper.getModelElement<DefaultProperty>(e.target);
          return property instanceof DefaultProperty && !!property.extends_;
        })
        .map(e => e.target);
      extendingProperties.push(...properties);

      const entity = MaxGraphHelper.getModelElement<DefaultEntity>(edge.source);
      entity.extends_ = null;

      MaxGraphHelper.removeRelation(entity, modelElement);
      for (const property of properties) {
        MaxGraphHelper.removeRelation(entity, MaxGraphHelper.getModelElement(property));
      }

      edge.source['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(entity, this.languageService);
      this.maxgraphService.graph.labelChanged(edge.source, entity, null);
    }

    this.maxgraphService.removeCells(extendingProperties);
    this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
    super.delete(cell);

    this.maxgraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.maxgraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.entityInstanceService.onEntityRemove(modelElement, () => {
      if (!cell?.edges) {
        this.maxgraphService.removeCells([cell]);
        return;
      }

      const entityValuesToDelete = [];
      for (const edge of cell.edges) {
        const element = MaxGraphHelper.getModelElement(edge.source);
        if (element && this.loadedFilesService.isElementInCurrentFile(element)) {
          this.currentCachedFile.removeElement(element.aspectModelUrn);
          useUpdater(modelElement).delete(element);
        }

        if (element instanceof DefaultEnumeration) {
          // we need to remove and add back the + button for enumeration
          this.maxgraphShapeOverlayService.removeComplexTypeShapeOverlays(edge.source);
          this.maxgraphShapeOverlayService.addBottomShapeOverlay(edge.source);
        }

        if (element instanceof DefaultEntityInstance && edge.source.style.fillColor.includes('entityValue')) {
          entityValuesToDelete.push(edge.source);
        }
      }
      this.maxgraphService.updateEntityValuesWithCellReference(entityValuesToDelete);
      this.maxgraphService.removeCells([cell, ...entityValuesToDelete]);
    });
  }
}
