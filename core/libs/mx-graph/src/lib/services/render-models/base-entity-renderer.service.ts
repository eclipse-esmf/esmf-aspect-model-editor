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
import {DefaultAbstractEntity, DefaultAbstractProperty, DefaultEntity, DefaultProperty} from '@ame/meta-model';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphShapeOverlayService} from '../mx-graph-shape-overlay.service';
import {MxGraphService} from '../mx-graph.service';
import {MxGraphHelper, MxGraphVisitorHelper} from '../../helpers';
import {MxGraphSetupVisitor} from '../../visitors';

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
    if (!metaModelElement.extendedElement || this.hasTimeSeries(cell)) {
      return;
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
      mxGraphSetupVisitor.visit(extendsElement, cell);
      this.createPropertyForValueAbstractProperty(extendsElement, cell);
      return;
    }

    const cachedEntity = this.namespacesCacheService.resolveCachedElement(extendsElement);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedEntity);
    const entityCell = resolvedCell ? resolvedCell : this.mxGraphService.renderModelElement(extendsElement);
    this.shapeConnectorService.connectShapes(metaModelElement, extendsElement, cell, entityCell);

    this.updateCell(cell);
  }

  private createPropertyForValueAbstractProperty(timeSeriesEntity: DefaultAbstractEntity, parentCell: mxgraph.mxCell) {
    if (!(timeSeriesEntity instanceof DefaultAbstractEntity && timeSeriesEntity.name === 'TimeSeriesEntity')) {
      return;
    }

    const valueAbstractProperty = timeSeriesEntity.properties.find(({property}) => {
      return property.name === 'value' && property instanceof DefaultAbstractProperty;
    })?.property;

    if (!valueAbstractProperty) {
      return;
    }

    const valueCell = this.mxGraphService.resolveCellByModelElement(valueAbstractProperty);
    const [namespace, name] = valueAbstractProperty.aspectModelUrn.split('#');
    const propertyAspectModelUrn = `${namespace}#[${name}]`;
    const valueProperty = new DefaultProperty(valueAbstractProperty.metaModelVersion, propertyAspectModelUrn, `[${name}]`, null);
    const valuePropertyCell = this.mxGraphService.renderModelElement(valueProperty);
    this.shapeConnectorService.connectShapes(valueProperty, valueAbstractProperty, valuePropertyCell, valueCell);

    const parentModel = MxGraphHelper.getModelElement(parentCell);
    this.shapeConnectorService.connectShapes(parentModel, valueProperty, parentCell, valuePropertyCell);
  }

  private hasTimeSeries(cell: mxgraph.mxCell): boolean {
    const modelElement = MxGraphHelper.getModelElement<DefaultEntity>(cell);
    const outgoingEdges = this.mxGraphService.graph.getOutgoingEdges(cell);
    return (outgoingEdges || []).some(edge => {
      const targetElement = MxGraphHelper.getModelElement(edge.target);
      return (
        targetElement instanceof DefaultAbstractEntity &&
        targetElement.name === 'TimeSeriesEntity' &&
        modelElement.extendedElement instanceof DefaultAbstractEntity &&
        modelElement.name === 'TimeSeriesEntity'
      );
    });
  }

  private updateCell(cell: mxgraph.mxCell) {
    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
      MxGraphHelper.getModelElement(cell),
      this.languageSettingsService
    );
    this.mxGraphService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
  }
}
