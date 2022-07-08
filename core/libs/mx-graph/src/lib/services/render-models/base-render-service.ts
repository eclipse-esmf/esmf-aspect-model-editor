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

import {Base, DefaultAspect, DefaultEntity, DefaultProperty, OverWrittenPropertyKeys} from '@ame/meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper, MxGraphVisitorHelper} from '../../helpers';
import {MxGraphService} from '../mx-graph.service';
import {RendererUpdatePayload} from '../../models';

export abstract class BaseRenderService {
  get graph(): mxgraph.mxGraph {
    return this.mxGraphService.graph;
  }

  constructor(protected mxGraphService: MxGraphService, protected languageSettingsService: LanguageSettingsService) {}
  public abstract isApplicable(cell: mxgraph.mxCell): boolean;

  public update({cell, callback}: RendererUpdatePayload) {
    const modelElement = MxGraphHelper.getModelElement(cell);

    cell.setId(modelElement.name);
    cell.setAttribute('name', modelElement.name);

    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(modelElement, this.languageSettingsService);
    cell['configuration'].baseProperties = MxGraphVisitorHelper.getModelInfo(
      modelElement,
      MxGraphHelper.getModelElement(this.mxGraphService.mxGraphShapeSelectorService.getAspectCell())
    );
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

      this.graph.removeCells([e]);
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
      const parentMetaModel = MxGraphHelper.getModelElement(parent);
      parent['configuration'].fields = MxGraphVisitorHelper.getElementProperties(parentMetaModel, this.languageSettingsService);
      parent['configuration'].baseProperties = MxGraphVisitorHelper.getModelInfo(
        parentMetaModel,
        MxGraphHelper.getModelElement(this.mxGraphService.mxGraphShapeSelectorService.getAspectCell())
      );
      this.graph.labelChanged(parent, MxGraphHelper.createPropertiesLabel(parent));
    }
  }
}
