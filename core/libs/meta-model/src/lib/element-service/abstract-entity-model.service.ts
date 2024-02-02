/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';
import {EntityValueService} from '@ame/editor';
import {
  AbstractEntityRenderService,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
  MxGraphVisitorHelper,
} from '@ame/mx-graph';
import {
  Base,
  BaseMetaModelElement,
  DefaultAbstractEntity,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultProperty,
  OverWrittenPropertyKeys,
} from '@ame/meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {BaseEntityModelService} from './base-entity-model.service';

@Injectable({providedIn: 'root'})
export class AbstractEntityModelService extends BaseModelService {
  constructor(
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private entityValueService: EntityValueService,
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private abstractEntityRenderer: AbstractEntityRenderService,
    private baseEntityModel: BaseEntityModelService,
    private languageService: SammLanguageSettingsService
  ) {
    super();
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultAbstractEntity;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultAbstractEntity>(cell);

    if (form.editedProperties) {
      for (const {property, keys} of metaModelElement.properties) {
        const newKeys: OverWrittenPropertyKeys = form.editedProperties[property.aspectModelUrn];
        keys.notInPayload = newKeys.notInPayload;
        keys.optional = newKeys.optional;
        keys.payloadName = newKeys.payloadName;
      }

      this.namespacesCacheService.currentCachedFile
        .getCachedEntityValues()
        ?.filter((entityValue: DefaultEntityValue) => entityValue.entity === metaModelElement)
        ?.forEach((entityValue: DefaultEntityValue) => {
          for (const entityValueProperty of entityValue.properties) {
            const property = metaModelElement.properties.find(prop => prop.property.name === entityValueProperty.key.property.name);
            entityValueProperty.key.keys.optional = property.keys.optional;
            entityValueProperty.key.keys.notInPayload = property.keys.notInPayload;
            entityValueProperty.key.keys.payloadName = property.keys.payloadName;
          }
        });
    }

    super.update(cell, form);
    this.baseEntityModel.checkExtendedElement(metaModelElement, form?.extends);
    this.abstractEntityRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultAbstractEntity>(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);

    const extendingProperties = [];
    for (const edge of incomingEdges) {
      const properties = this.mxGraphService.graph
        .getOutgoingEdges(edge.source)
        .filter(e => {
          const property = MxGraphHelper.getModelElement<DefaultProperty>(e.target);
          return property instanceof DefaultProperty && !!property.extendedElement;
        })
        .map(e => e.target);
      extendingProperties.push(...properties);

      const entity = MxGraphHelper.getModelElement<DefaultEntity>(edge.source);
      entity.extendedElement = null;

      MxGraphHelper.removeRelation(entity, modelElement);
      for (const property of properties) {
        MxGraphHelper.removeRelation(entity, MxGraphHelper.getModelElement(property));
      }

      edge.source['configuration'].fields = MxGraphVisitorHelper.getElementProperties(entity, this.languageService);
      this.mxGraphService.graph.labelChanged(edge.source, entity);
    }

    this.mxGraphService.removeCells(extendingProperties);
    this.namespacesCacheService.currentCachedFile.removeElement(modelElement.aspectModelUrn);
    super.delete(cell);

    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.entityValueService.onEntityRemove(modelElement, () => {
      if (!cell?.edges) {
        this.mxGraphService.removeCells([cell]);
        return;
      }

      const entityValuesToDelete = [];
      for (const edge of cell.edges) {
        const modelElement = MxGraphHelper.getModelElement(edge.source);
        if (modelElement && !modelElement.isExternalReference()) {
          this.currentCachedFile.removeElement(modelElement.aspectModelUrn);
          (<Base>modelElement).delete(modelElement);
        }

        if (modelElement instanceof DefaultEnumeration) {
          // we need to remove and add back the + button for enumeration
          this.mxGraphShapeOverlayService.removeComplexTypeShapeOverlays(edge.source);
          this.mxGraphShapeOverlayService.addBottomShapeOverlay(edge.source);
        }

        if (modelElement instanceof DefaultEntityValue && edge.source.style.includes('entityValue')) {
          entityValuesToDelete.push(edge.source);
        }
      }
      this.mxGraphService.updateEntityValuesWithCellReference(entityValuesToDelete);
      this.mxGraphService.removeCells([cell, ...entityValuesToDelete]);
    });
  }
}
