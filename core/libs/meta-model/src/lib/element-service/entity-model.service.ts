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
  EntityRenderService,
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphService,
  MaxGraphShapeOverlayService,
  MaxGraphVisitorHelper,
} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {useUpdater} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseEntityModelService} from './base-entity-model.service';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class EntityModelService extends BaseModelService {
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly entityInstanceService = inject(EntityInstanceService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly entityRenderer = inject(EntityRenderService);
  private readonly languageService = inject(SammLanguageSettingsService);
  private readonly baseEntityModel = inject(BaseEntityModelService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEntity;
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultEntity>(cell);

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
    this.entityRenderer.update({cell});
  }

  delete(cell: Cell) {
    this.updateExtends(cell);
    super.delete(cell);
    const modelElement = MaxGraphHelper.getModelElement<DefaultEntity>(cell);
    const outgoingEdges = this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null);
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    this.maxgraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.maxgraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);

    this.entityInstanceService.onEntityRemove(modelElement, () => {
      if (!cell?.edges) {
        this.maxgraphService.removeCells([cell]);
        return;
      }

      const entityValuesToDelete = [];
      for (const edge of cell.edges) {
        const sourceModelElement = MaxGraphHelper.getModelElement<NamedElement>(edge.source);
        if (sourceModelElement && this.loadedFilesService.isElementInCurrentFile(sourceModelElement)) {
          this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
          useUpdater(sourceModelElement).delete(modelElement);
        }

        if (sourceModelElement instanceof DefaultEnumeration) {
          // we need to remove and add back the + button for enumeration
          this.maxgraphShapeOverlayService.removeComplexTypeShapeOverlays(edge.source);
          this.maxgraphShapeOverlayService.addBottomShapeOverlay(edge.source);
        }

        if (sourceModelElement instanceof DefaultEntityInstance && edge.source.style.fillColor.includes('entityValue')) {
          entityValuesToDelete.push(edge.source);
          MaxGraphHelper.removeRelation(sourceModelElement, modelElement);
        }
      }

      this.maxgraphService.updateEntityValuesWithCellReference(entityValuesToDelete);
      this.maxgraphService.removeCells([cell, ...entityValuesToDelete]);
    });
  }

  private updateExtends(cell: Cell) {
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    for (const edge of incomingEdges) {
      const entity = MaxGraphHelper.getModelElement<DefaultEntity>(edge.source);
      if (!(entity instanceof DefaultEntity)) {
        continue;
      }

      entity.extends_ = null;
      MaxGraphHelper.removeRelation(entity, MaxGraphHelper.getModelElement(cell));
      edge.source['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(entity, this.languageService);
      this.maxgraphService.graph.labelChanged(edge.source, MaxGraphHelper.createPropertiesLabel(edge.source), null);
    }
  }
}
