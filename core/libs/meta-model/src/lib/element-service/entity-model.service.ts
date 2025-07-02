/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphVisitorHelper,
} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {useUpdater} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultEntity, DefaultEntityInstance, DefaultEnumeration, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseEntityModelService} from './base-entity-model.service';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class EntityModelService extends BaseModelService {
  constructor(
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private entityInstanceService: EntityInstanceService,
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private entityRenderer: EntityRenderService,
    private languageService: SammLanguageSettingsService,
    private baseEntityModel: BaseEntityModelService,
  ) {
    super();
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEntity;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntity>(cell);

    if (form.editedProperties) {
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

  delete(cell: mxgraph.mxCell) {
    this.updateExtends(cell);
    super.delete(cell);
    const modelElement = MxGraphHelper.getModelElement<DefaultEntity>(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);

    this.entityInstanceService.onEntityRemove(modelElement, () => {
      if (!cell?.edges) {
        this.mxGraphService.removeCells([cell]);
        return;
      }

      const entityValuesToDelete = [];
      for (const edge of cell.edges) {
        const sourceModelElement = MxGraphHelper.getModelElement<NamedElement>(edge.source);
        if (sourceModelElement && this.loadedFilesService.isElementInCurrentFile(sourceModelElement)) {
          this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
          useUpdater(sourceModelElement).delete(modelElement);
        }

        if (sourceModelElement instanceof DefaultEnumeration) {
          // we need to remove and add back the + button for enumeration
          this.mxGraphShapeOverlayService.removeComplexTypeShapeOverlays(edge.source);
          this.mxGraphShapeOverlayService.addBottomShapeOverlay(edge.source);
        }

        if (sourceModelElement instanceof DefaultEntityInstance && edge.source.style.includes('entityValue')) {
          entityValuesToDelete.push(edge.source);
          MxGraphHelper.removeRelation(sourceModelElement, modelElement);
        }
      }

      this.mxGraphService.updateEntityValuesWithCellReference(entityValuesToDelete);
      this.mxGraphService.removeCells([cell, ...entityValuesToDelete]);
    });
  }

  private updateExtends(cell: mxgraph.mxCell) {
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    for (const edge of incomingEdges) {
      const entity = MxGraphHelper.getModelElement<DefaultEntity>(edge.source);
      if (!(entity instanceof DefaultEntity)) {
        continue;
      }

      entity.extends_ = null;
      MxGraphHelper.removeRelation(entity, MxGraphHelper.getModelElement(cell));
      edge.source['configuration'].fields = MxGraphVisitorHelper.getElementProperties(entity, this.languageService);
      this.mxGraphService.graph.labelChanged(edge.source, MxGraphHelper.createPropertiesLabel(edge.source));
    }
  }
}
