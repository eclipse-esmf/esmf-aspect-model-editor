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

import {ShapeConnectorService} from '@ame/connection';
import {FiltersService} from '@ame/loader-filters';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultValue, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MaxGraphHelper} from '../../helpers';
import {RendererUpdatePayload} from '../../models';
import {BaseRenderService} from './base-render-service';

@Injectable({providedIn: 'root'})
export class PropertyRenderService extends BaseRenderService {
  private readonly shapeConnectorService = inject(ShapeConnectorService);
  private readonly filtersService = inject(FiltersService);

  update({cell, callback}: RendererUpdatePayload) {
    this.handleExampleValueElement(cell);
    this.handleExtendsElement(cell);
    this.renderParents(cell);
    super.update({cell, callback});
  }

  isApplicable(cell: Cell): boolean {
    return MaxGraphHelper.getModelElement(cell) instanceof DefaultProperty;
  }

  private handleExampleValueElement(cell: Cell) {
    const element = MaxGraphHelper.getElementNode<DefaultProperty>(cell).element;
    if (!element.exampleValue) {
      this.removeExampleValueConnection(cell);
      return;
    }

    if (!(element.exampleValue instanceof DefaultValue)) {
      this.removeExampleValueConnection(cell);
      return;
    }

    const existing = this.maxgraphService.resolveCellByModelElement(element.exampleValue);

    const exampleValueToConnect =
      existing ||
      this.maxgraphService.renderModelElement(
        this.filtersService.createNode(element.exampleValue, {parent: MaxGraphHelper.getModelElement(cell)}),
      );

    this.removeExampleValueConnection(cell, element.exampleValue);
    this.shapeConnectorService.connectShapes(element, element.exampleValue, cell, exampleValueToConnect);
    this.refreshPropertiesLabel(exampleValueToConnect, element.exampleValue);
  }

  private handleExtendsElement(cell: Cell) {
    const node = MaxGraphHelper.getElementNode<DefaultProperty>(cell);
    const metaModelElement = node.element;
    if (!metaModelElement.exampleValue) {
      return;
    }

    if (!metaModelElement.extends_) return;

    const extendsElement = metaModelElement.extends_;
    const cachedEntity = this.loadedFilesService.currentLoadedFile.cachedFile.resolveInstance(extendsElement);
    const resolvedCell = this.maxgraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell
      ? resolvedCell
      : this.maxgraphService.renderModelElement(
          node.children.find(childNode => childNode.element.aspectModelUrn === extendsElement.aspectModelUrn),
        );
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);
  }

  private removeExampleValueConnection(cell: Cell, keepValue?: DefaultValue) {
    this.maxgraphService.graph
      .getOutgoingEdges(cell, null)
      .filter(edge => {
        const targetModel = MaxGraphHelper.getModelElement<NamedElement>(edge.target);
        return targetModel instanceof DefaultValue && targetModel !== keepValue;
      })
      .forEach((edgeToRemove: any) => {
        const targetCell = edgeToRemove.target;
        const targetModel = MaxGraphHelper.getModelElement<NamedElement>(targetCell);
        if (targetModel instanceof DefaultValue && targetModel.isAnonymous?.()) {
          this.maxgraphService.removeCells([targetCell]);
        } else {
          this.maxgraphService.removeCells([edgeToRemove]);
        }
      });
  }
}
