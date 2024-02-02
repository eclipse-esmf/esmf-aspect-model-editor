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

import {Base, DefaultAspect, DefaultEntity, DefaultProperty, OverWrittenPropertyKeys} from '@ame/meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper, MxGraphVisitorHelper} from '../../helpers';
import {MxGraphService} from '../mx-graph.service';
import {RendererUpdatePayload} from '../../models';
import {RdfService} from '@ame/rdf/services';

export abstract class BaseRenderService {
  get graph(): mxgraph.mxGraph {
    return this.mxGraphService.graph;
  }

  constructor(
    protected mxGraphService: MxGraphService,
    protected sammLangService: SammLanguageSettingsService,
    protected rdfService: RdfService
  ) {}
  public abstract isApplicable(cell: mxgraph.mxCell): boolean;

  public update({cell, callback}: RendererUpdatePayload) {
    const modelElement = MxGraphHelper.getModelElement(cell);

    cell.setId(modelElement.name);
    cell.setAttribute('name', modelElement.name);

    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(modelElement, this.sammLangService);
    cell['configuration'].baseProperties = MxGraphVisitorHelper.getModelInfo(modelElement, this.rdfService.currentRdfModel);
    this.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));

    if (typeof callback === 'function') {
      callback();
    }
    this.mxGraphService.formatCell(cell);
    this.mxGraphService.formatShapes();
  }

  protected renderOptionalProperties(cell: mxgraph.mxCell) {
    const modelElement = MxGraphHelper.getModelElement<DefaultAspect | DefaultEntity>(cell);
    this.graph.getOutgoingEdges(cell)?.forEach((e: mxgraph.mxCell) => {
      const property = MxGraphHelper.getModelElement(e.target);
      if (!(property instanceof DefaultProperty)) {
        return;
      }

      const keys: OverWrittenPropertyKeys = modelElement.properties.find(
        ({property: prop}) => prop.aspectModelUrn === property.aspectModelUrn
      ).keys;

      this.mxGraphService.removeCells([e]);
      MxGraphHelper.establishRelation(modelElement, property);
      this.graph.insertEdge(
        this.graph.getDefaultParent(),
        null,
        null,
        e.source,
        e.target,
        keys.optional ? 'optionalPropertyEdge' : 'defaultEdge'
      );
    });
  }

  protected inMxGraph(modelElement: Base) {
    return this.mxGraphService
      ?.getAllCells()
      ?.find(cell => MxGraphHelper.getModelElement(cell)?.aspectModelUrn === modelElement?.aspectModelUrn);
  }

  protected renderParents(cell: mxgraph.mxCell) {
    const parents = this.mxGraphService.resolveParents(cell);

    for (const parent of parents) {
      const parentElementModel = MxGraphHelper.getModelElement(parent);
      parent['configuration'].fields = MxGraphVisitorHelper.getElementProperties(parentElementModel, this.sammLangService);
      parent['configuration'].baseProperties = MxGraphVisitorHelper.getModelInfo(parentElementModel, this.rdfService.currentRdfModel);
      this.graph.labelChanged(parent, MxGraphHelper.createPropertiesLabel(parent));
    }
  }
}
