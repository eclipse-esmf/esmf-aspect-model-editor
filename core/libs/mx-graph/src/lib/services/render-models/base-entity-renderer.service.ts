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
import {ShapeConnectorService} from '@ame/connection';
import {RdfService} from '@ame/rdf/services';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {DefaultAbstractEntity, DefaultEntity, DefaultProperty} from '@ame/meta-model';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphShapeOverlayService} from '../mx-graph-shape-overlay.service';
import {MxGraphService} from '../mx-graph.service';
import {MxGraphHelper, MxGraphVisitorHelper} from '../../helpers';
import {MxGraphSetupVisitor} from '../../visitors';
import {MetaModelElementInstantiator, PredefinedEntityInstantiator} from '@ame/instantiator';

@Injectable({
  providedIn: 'root',
})
export class BaseEntityRendererService {
  constructor(
    private mxGraphService: MxGraphService,
    private languageSettingsService: LanguageSettingsService,
    private namespacesCacheService: NamespacesCacheService,
    private shapeConnectorService: ShapeConnectorService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private rdfService: RdfService
  ) {}

  public handleExtendsElement(cell: mxgraph.mxCell) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultEntity>(cell);
    const currentPredefinedAbstractEntity = this.hasPredefinedAbstractEntity(cell);

    if (currentPredefinedAbstractEntity && this.isSameExtendedElement(cell, currentPredefinedAbstractEntity)) {
      return;
    }

    if (!metaModelElement.extendedElement) {
      this.cleanUpAbstractConnections(cell);
      return;
    }

    if (currentPredefinedAbstractEntity) {
      this.cleanUpAbstractConnections(cell);
    }

    const mxGraphSetupVisitor = new MxGraphSetupVisitor(
      this.mxGraphService,
      this.mxGraphShapeOverlayService,
      this.namespacesCacheService,
      this.languageSettingsService,
      this.rdfService.currentRdfModel
    );

    const extendsElement = metaModelElement.extendedElement as DefaultAbstractEntity;
    if (extendsElement.isPredefined()) {
      let predefinedCell = this.mxGraphService.resolveCellByModelElement(extendsElement);
      if (predefinedCell) {
        this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, predefinedCell);
        return;
      }

      mxGraphSetupVisitor.visit(extendsElement, cell);
      predefinedCell = this.mxGraphService.resolveCellByModelElement(extendsElement);
      this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, predefinedCell);
      return;
    }

    const cachedEntity = this.namespacesCacheService.resolveCachedElement(extendsElement);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell ? resolvedCell : this.mxGraphService.renderModelElement(extendsElement);
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);

    this.updateCell(cell);
  }

  private hasPredefinedAbstractEntity(cell: mxgraph.mxCell): mxgraph.mxCell {
    const children = this.mxGraphService.graph.getOutgoingEdges(cell).map(e => e.target);
    const predefinedEntityInstantiator = new PredefinedEntityInstantiator(
      new MetaModelElementInstantiator(this.rdfService.currentRdfModel, this.namespacesCacheService.getCurrentCachedFile())
    );

    for (const child of children) {
      const modelElement = MxGraphHelper.getModelElement<DefaultEntity>(child);
      if (!!predefinedEntityInstantiator.entityInstances[modelElement?.aspectModelUrn]) {
        return child;
      }
    }

    return null;
  }

  private isSameExtendedElement(cell: mxgraph.mxCell, child: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntity>(cell);
    const childModel = MxGraphHelper.getModelElement<DefaultAbstractEntity>(child);
    return modelElement.extendedElement?.aspectModelUrn === childModel.aspectModelUrn;
  }

  private cleanUpAbstractConnections(cell: mxgraph.mxCell) {
    const childrenEdges = this.mxGraphService.graph.getOutgoingEdges(cell);

    const entityChildEdge = childrenEdges.find(edge =>
      [DefaultEntity, DefaultAbstractEntity].some(c => MxGraphHelper.getModelElement(edge.target) instanceof c)
    );

    if (!entityChildEdge) {
      return;
    }

    const entityChildModel = MxGraphHelper.getModelElement<DefaultAbstractEntity>(entityChildEdge.target);
    const extendedProperties = childrenEdges
      .map(e => e.target)
      .filter(c => {
        const childModelElement = MxGraphHelper.getModelElement(c);
        if (!(childModelElement instanceof DefaultProperty)) {
          return false;
        }

        return entityChildModel.properties.some(
          ({property}) => property.aspectModelUrn === childModelElement.extendedElement?.aspectModelUrn
        );
      });

    this.mxGraphService.graph.removeCells([entityChildEdge, ...extendedProperties]);
  }

  private updateCell(cell: mxgraph.mxCell) {
    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
      MxGraphHelper.getModelElement(cell),
      this.languageSettingsService
    );
    this.mxGraphService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
  }
}
