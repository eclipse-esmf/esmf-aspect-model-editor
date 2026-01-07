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

import {ShapeConnectorService} from '@ame/connection';
import {FiltersService} from '@ame/loader-filters';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultValue, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {RendererUpdatePayload} from '../../models';
import {BaseRenderService} from './base-render-service';

@Injectable({providedIn: 'root'})
export class PropertyRenderService extends BaseRenderService {
  private shapeConnectorService = inject(ShapeConnectorService);
  private filtersService = inject(FiltersService);

  update({cell, callback}: RendererUpdatePayload) {
    this.handleExampleValueElement(cell);
    this.handleExtendsElement(cell);
    this.renderParents(cell);
    super.update({cell, callback});
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultProperty;
  }

  private handleExampleValueElement(cell: mxgraph.mxCell) {
    const element = MxGraphHelper.getElementNode<DefaultProperty>(cell).element;
    if (!element.exampleValue) {
      this.removeExampleValueConnection(cell);
      return;
    }

    if (!(element.exampleValue instanceof DefaultValue)) {
      this.removeExampleValueConnection(cell);
      return;
    }

    const existing = this.mxGraphService.resolveCellByModelElement(element.exampleValue);

    const exampleValueToConnect =
      existing ||
      this.mxGraphService.renderModelElement(
        this.filtersService.createNode(element.exampleValue, {parent: MxGraphHelper.getModelElement(cell)}),
      );

    this.shapeConnectorService.connectShapes(element, element.exampleValue, cell, exampleValueToConnect);
    this.refreshPropertiesLabel(exampleValueToConnect, element.exampleValue);
  }

  private handleExtendsElement(cell: mxgraph.mxCell) {
    const node = MxGraphHelper.getElementNode<DefaultProperty>(cell);
    const metaModelElement = node.element;
    if (!metaModelElement.exampleValue) {
      return;
    }

    if (!metaModelElement.extends_) return;

    const extendsElement = metaModelElement.extends_;
    const cachedEntity = this.loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(extendsElement);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell
      ? resolvedCell
      : this.mxGraphService.renderModelElement(
          node.children.find(childNode => childNode.element.aspectModelUrn === extendsElement.aspectModelUrn),
        );
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);
  }

  private removeExampleValueConnection(cell: mxgraph.mxCell) {
    this.mxGraphService.graph
      .getOutgoingEdges(cell)
      .filter(edge => {
        const targetModel = MxGraphHelper.getModelElement<NamedElement>(edge.target);
        return targetModel instanceof DefaultValue;
      })
      .forEach(edgeToRemove => {
        this.mxGraphService.removeCells([cell.removeEdge(edgeToRemove, true)]);
      });
  }
}
