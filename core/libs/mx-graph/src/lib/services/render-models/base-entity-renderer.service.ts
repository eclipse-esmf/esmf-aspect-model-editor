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

import {LoadedFilesService} from '@ame/cache';
import {ShapeConnectorService} from '@ame/connection';
import {DefaultFilter, FiltersService} from '@ame/loader-filters';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Injectable, inject} from '@angular/core';
import {DefaultEntity, DefaultProperty, PredefinedEntitiesEnum, SammE} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper, MxGraphVisitorHelper} from '../../helpers';
import {MxGraphRenderer} from '../../renderers';
import {MxGraphShapeOverlayService} from '../mx-graph-shape-overlay.service';
import {MxGraphService} from '../mx-graph.service';

@Injectable({
  providedIn: 'root',
})
export class BaseEntityRendererService {
  private filtersService = inject(FiltersService);
  private loadedFiles = inject(LoadedFilesService);

  constructor(
    private mxGraphService: MxGraphService,
    private sammLangService: SammLanguageSettingsService,
    private shapeConnectorService: ShapeConnectorService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
  ) {}

  public handleExtendsElement(cell: mxgraph.mxCell) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultEntity>(cell);
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

    const mxGraphSetupVisitor = new MxGraphRenderer(
      this.mxGraphService,
      this.mxGraphShapeOverlayService,
      this.sammLangService,
      this.loadedFiles.currentLoadedFile.rdfModel,
    );

    const extendsElement = metaModelElement.extends_;
    if (extendsElement.isPredefined) {
      let predefinedCell = this.mxGraphService.resolveCellByModelElement(extendsElement);
      if (predefinedCell) {
        this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, predefinedCell);
        return;
      }

      const [filteredElement] = new DefaultFilter(this.loadedFiles).filter([extendsElement]);
      mxGraphSetupVisitor.render(filteredElement, cell);
      predefinedCell = this.mxGraphService.resolveCellByModelElement(extendsElement);

      // setting to null to create the properties after abstract properties
      metaModelElement.extends_ = null;
      this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, predefinedCell);
      return;
    }

    const cachedEntity = this.loadedFiles.currentLoadedFile.cachedFile.resolveInstance(extendsElement);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell
      ? resolvedCell
      : this.mxGraphService.renderModelElement(this.filtersService.createNode(extendsElement, {parent: metaModelElement}));
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);

    this.updateCell(cell);
  }

  private hasPredefinedAbstractEntity(cell: mxgraph.mxCell): mxgraph.mxCell {
    const children = this.mxGraphService.graph.getOutgoingEdges(cell).map(e => e.target);

    for (const child of children) {
      const modelElement = MxGraphHelper.getModelElement<DefaultEntity>(child);
      if (modelElement?.aspectModelUrn.startsWith(SammE.versionLessUri) && modelElement?.name in PredefinedEntitiesEnum) {
        return child;
      }
    }

    return null;
  }

  private isSameExtendedElement(cell: mxgraph.mxCell, child: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntity>(cell);
    const childModel = MxGraphHelper.getModelElement<DefaultEntity>(child);
    return childModel && modelElement.extends_ && modelElement.extends_?.aspectModelUrn === childModel?.aspectModelUrn;
  }

  private isAlreadyConnected(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntity>(cell);
    const extendedElement = modelElement.extends_;

    if (!extendedElement) {
      return false;
    }

    return this.mxGraphService.graph
      .getOutgoingEdges(cell)
      .some(({target}) => MxGraphHelper.getModelElement(target).aspectModelUrn === extendedElement.aspectModelUrn);
  }

  private cleanUpAbstractConnections(cell: mxgraph.mxCell) {
    const childrenEdges = this.mxGraphService.graph.getOutgoingEdges(cell);

    const entityChildEdge = childrenEdges.find(edge => MxGraphHelper.getModelElement(edge.target) instanceof DefaultEntity);

    if (!entityChildEdge) {
      return;
    }

    const entityChildModelElement = MxGraphHelper.getModelElement<DefaultEntity>(entityChildEdge.target);
    const extendedProperties = childrenEdges
      .map(e => e.target)
      .filter(c => {
        const childModelElement = MxGraphHelper.getModelElement(c);
        if (!(childModelElement instanceof DefaultProperty)) {
          return false;
        }

        return entityChildModelElement.properties.some(property => property.aspectModelUrn === childModelElement.extends_?.aspectModelUrn);
      });

    this.mxGraphService.removeCells([entityChildEdge, ...extendedProperties]);
  }

  private updateCell(cell: mxgraph.mxCell) {
    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(MxGraphHelper.getModelElement(cell), this.sammLangService);
    this.mxGraphService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
  }
}
