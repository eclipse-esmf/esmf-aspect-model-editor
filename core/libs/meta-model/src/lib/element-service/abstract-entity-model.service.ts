/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {NamespacesCacheService} from '@ame/cache';
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
  OverWrittenPropertyKeys,
} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {LanguageSettingsService} from '@ame/settings-dialog';

@Injectable({providedIn: 'root'})
export class AbstractEntityModelService extends BaseModelService {
  constructor(
    protected namespacesCacheService: NamespacesCacheService,
    protected modelService: ModelService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private entityValueService: EntityValueService,
    private mxGraphService: MxGraphService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private abstractEntityRenderer: AbstractEntityRenderService,
    private languageService: LanguageSettingsService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultAbstractEntity;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultAbstractEntity = MxGraphHelper.getModelElement(cell);
    super.update(cell, form);
    metaModelElement.extendedElement = form?.extends instanceof DefaultAbstractEntity ? form.extends : null;

    if (form.editedProperties) {
      for (const {property, keys} of metaModelElement.properties) {
        const newKeys: OverWrittenPropertyKeys = form.editedProperties[property.aspectModelUrn];
        keys.notInPayload = newKeys.notInPayload;
        keys.optional = newKeys.optional;
        keys.payloadName = newKeys.payloadName;
      }

      this.namespacesCacheService
        .getCurrentCachedFile()
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

    this.abstractEntityRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultAbstractEntity>(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);

    for (const edge of incomingEdges) {
      const entity = MxGraphHelper.getModelElement<DefaultEntity>(edge.source);
      entity.extendedElement = null;
      edge.source['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
        MxGraphHelper.getModelElement(edge.source),
        this.languageService
      );
      this.mxGraphService.graph.labelChanged(edge.source, MxGraphHelper.createPropertiesLabel(edge.source));
    }

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
        const edgeSourceModelElement = MxGraphHelper.getModelElement(edge.source);
        if (edgeSourceModelElement && !edgeSourceModelElement.isExternalReference()) {
          this.currentCachedFile.removeCachedElement(modelElement.aspectModelUrn);
          (<Base>edgeSourceModelElement).delete(modelElement);
        }

        if (edgeSourceModelElement instanceof DefaultEnumeration) {
          // we need to remove and add back the + button for enumeration
          this.mxGraphShapeOverlayService.removeComplexTypeShapeOverlays(edge.source);
          this.mxGraphShapeOverlayService.addBottomShapeOverlay(edge.source);
          this.mxGraphService.removeCellChild(edge.source, 'values');
        }

        if (edgeSourceModelElement instanceof DefaultEntityValue && edge.source.style.includes('entityValue')) {
          entityValuesToDelete.push(edge.source);
        }
      }
      this.mxGraphService.updateEntityValuesWithCellReference(entityValuesToDelete);
      this.mxGraphService.removeCells([cell, ...entityValuesToDelete]);
    });
  }
}
