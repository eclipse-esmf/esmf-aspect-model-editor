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
import {ShapeConnectorService} from '@ame/connection';
import {DefaultFilter, FiltersService} from '@ame/loader-filters';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Injectable, inject} from '@angular/core';
import {DefaultEntity, DefaultProperty, PredefinedEntitiesEnum, SammE} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MaxGraphHelper, MaxGraphVisitorHelper} from '../../helpers';
import {MaxGraphRenderer} from '../../renderers';
import {MaxGraphShapeOverlayService} from '../max-graph-shape-overlay.service';
import {MaxGraphService} from '../max-graph.service';

@Injectable({providedIn: 'root'})
export class BaseEntityRendererService {
  private readonly filtersService = inject(FiltersService);
  private readonly loadedFiles = inject(LoadedFilesService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly sammLangService = inject(SammLanguageSettingsService);
  private readonly shapeConnectorService = inject(ShapeConnectorService);
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);

  public handleExtendsElement(cell: Cell) {
    const metaModelElement = MaxGraphHelper.getModelElement<DefaultEntity>(cell);
    const currentPredefinedAbstractEntity = this.hasPredefinedAbstractEntity(cell);

    if (currentPredefinedAbstractEntity && this.isSameExtendedElement(cell, currentPredefinedAbstractEntity)) {
      return;
    }

    if (this.isAlreadyConnected(cell)) {
      return;
    }

    if (!metaModelElement.extends_) {
      this.cleanUpAbstractConnections(cell);
      return;
    }

    if (currentPredefinedAbstractEntity) {
      this.cleanUpAbstractConnections(cell);
    }

    const maxgraphRenderer = new MaxGraphRenderer(
      this.maxgraphService,
      this.maxgraphShapeOverlayService,
      this.sammLangService,
      this.loadedFiles.currentLoadedFile.rdfModel,
    );

    const extendsElement = metaModelElement.extends_;
    if (extendsElement.isPredefined) {
      let predefinedCell = this.maxgraphService.resolveCellByModelElement(extendsElement);
      if (predefinedCell) {
        this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, predefinedCell);
        return;
      }

      const [filteredElement] = new DefaultFilter(this.loadedFiles).filter([extendsElement]);
      maxgraphRenderer.render(filteredElement, cell);
      predefinedCell = this.maxgraphService.resolveCellByModelElement(extendsElement);

      // setting to null to create the properties after abstract properties
      metaModelElement.extends_ = null;
      this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, predefinedCell);
      return;
    }

    const cachedEntity = this.loadedFiles.currentLoadedFile.cachedFile.resolveInstance(extendsElement);
    const resolvedCell = this.maxgraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell
      ? resolvedCell
      : this.maxgraphService.renderModelElement(this.filtersService.createNode(extendsElement, {parent: metaModelElement}));
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);

    this.updateCell(cell);
  }

  private hasPredefinedAbstractEntity(cell: Cell): Cell {
    const children = this.maxgraphService.graph.getOutgoingEdges(cell, null).map(e => e.target);

    for (const child of children) {
      const modelElement = MaxGraphHelper.getModelElement<DefaultEntity>(child);
      if (modelElement?.aspectModelUrn.startsWith(SammE.versionLessUri) && modelElement?.name in PredefinedEntitiesEnum) {
        return child;
      }
    }

    return null;
  }

  private isSameExtendedElement(cell: Cell, child: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultEntity>(cell);
    const childModel = MaxGraphHelper.getModelElement<DefaultEntity>(child);
    return childModel && modelElement.extends_ && modelElement.extends_?.aspectModelUrn === childModel?.aspectModelUrn;
  }

  private isAlreadyConnected(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultEntity>(cell);
    const extendedElement = modelElement.extends_;

    if (!extendedElement) {
      return false;
    }

    return this.maxgraphService.graph
      .getOutgoingEdges(cell, null)
      .some(({target}) => MaxGraphHelper.getModelElement(target).aspectModelUrn === extendedElement.aspectModelUrn);
  }

  private cleanUpAbstractConnections(cell: Cell) {
    const childrenEdges = this.maxgraphService.graph.getOutgoingEdges(cell, null);

    const entityChildEdge = childrenEdges.find(edge => MaxGraphHelper.getModelElement(edge.target) instanceof DefaultEntity);

    if (!entityChildEdge) {
      return;
    }

    const entityChildModelElement = MaxGraphHelper.getModelElement<DefaultEntity>(entityChildEdge.target);
    const extendedProperties = childrenEdges
      .map(e => e.target)
      .filter(c => {
        const childModelElement = MaxGraphHelper.getModelElement(c);
        if (!(childModelElement instanceof DefaultProperty)) {
          return false;
        }

        return entityChildModelElement.properties.some(property => property.aspectModelUrn === childModelElement.extends_?.aspectModelUrn);
      });

    this.maxgraphService.removeCells([entityChildEdge, ...extendedProperties]);
  }

  private updateCell(cell: Cell) {
    cell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(MaxGraphHelper.getModelElement(cell), this.sammLangService);
    this.maxgraphService.graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);
  }
}
