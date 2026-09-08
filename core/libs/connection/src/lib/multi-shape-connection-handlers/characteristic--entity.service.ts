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

import {LoadedFilesService} from '@ame/cache';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {Injectable, inject} from '@angular/core';
import {
  DefaultCharacteristic,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultUnit,
} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class CharacteristicEntityConnectionHandler implements MultiShapeConnector<DefaultCharacteristic, DefaultEntity> {
  private maxgraphService = inject(MaxGraphService);
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  private maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private sammLangService = inject(SammLanguageSettingsService);
  private notificationsService = inject(NotificationsService);
  private loadedFiles = inject(LoadedFilesService);

  get currentCachedFile() {
    return this.loadedFiles.currentLoadedFile.cachedFile;
  }

  connect(parentMetaModel: DefaultCharacteristic, childMetaModel: DefaultEntity, parent: Cell, child: Cell): void {
    if (parentMetaModel instanceof DefaultStructuredValue) {
      return this.notificationsService.warning({
        title: 'Unable to connect elements',
        message: 'StructuredValue can only contain a scalar "string-like value space" value',
        timeout: 5000,
      });
    }

    parentMetaModel.dataType = childMetaModel;
    this.maxgraphAttributeService.graph.getOutgoingEdges(parent, null).forEach(outEdge => this.removeCells(outEdge, parent));
    this.maxgraphShapeOverlayService.removeOverlay(parent, MaxGraphHelper.getNewShapeOverlayButton(parent));

    // Add icon when you simply connect an enumeration with an entity.
    if (parentMetaModel instanceof DefaultEnumeration) {
      // TODO User should be informed if he wants to change the entity, otherwise, all the values will be deleted.
      // TODO This should be done in the future.
      // if (!parentMetaModel.createdFromEditor) {
      //   parentMetaModel.values = [];
      // }
      this.maxgraphShapeOverlayService.removeOverlay(parent, MaxGraphHelper.getRightOverlayButton(parent));
      this.maxgraphShapeOverlayService.addComplexEnumerationShapeOverlay(parent);
      this.maxgraphShapeOverlayService.addBottomShapeOverlay(parent);
    }

    if (parentMetaModel.dataType) {
      MaxGraphHelper.updateLabel(parent, this.maxgraphAttributeService.graph, this.sammLangService);
    }

    if (parentMetaModel.dataType?.isComplexType()) {
      this.updateChildPropertiesLabels(parent);
    }

    this.maxgraphService.assignToParent(child, parent);
    this.maxgraphService.formatShapes();
  }

  private updateChildPropertiesLabels(parent: Cell): void {
    const parentIncomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(parent, null);
    parentIncomingEdges.forEach(edge => {
      const edgeSourceMetaModelElement = MaxGraphHelper.getModelElement(edge.source);
      if (edgeSourceMetaModelElement instanceof DefaultProperty) {
        // Remove example value for complex datatypes
        edgeSourceMetaModelElement.exampleValue = null;
        MaxGraphHelper.updateLabel(edge.source, this.maxgraphAttributeService.graph, this.sammLangService);
      }
    });
  }

  private removeCells(edge: Cell, parent: Cell): void {
    const metaModel = MaxGraphHelper.getModelElement(edge.target);

    if (metaModel instanceof DefaultUnit) return;

    // Remove icon if we delete the edge between enumeration and entity.
    if (metaModel instanceof DefaultEnumeration) {
      this.maxgraphShapeOverlayService.removeComplexTypeShapeOverlays(parent);
    }

    // TODO Should be defined in more details
    if (metaModel instanceof DefaultEntityInstance) {
      for (const child of metaModel.children) {
        MaxGraphHelper.removeRelation(metaModel, child);
      }

      this.maxgraphAttributeService.graph.getOutgoingEdges(edge.target, null).forEach(outEdge => this.removeCells(outEdge, edge.target));
      this.maxgraphService.removeCells([edge.target]);
      this.currentCachedFile.removeElement(metaModel.aspectModelUrn);
    }

    const parentModel = MaxGraphHelper.getModelElement(edge.source);
    MaxGraphHelper.removeRelation(parentModel, metaModel);
    this.maxgraphService.removeCells([edge]);
  }
}
