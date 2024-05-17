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

import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';
import {EntityInstanceService} from '@ame/editor';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphVisitorHelper, PropertyRenderService} from '@ame/mx-graph';
import {BaseMetaModelElement, DefaultProperty} from '@ame/meta-model';
import {CanExtend, DefaultAbstractProperty, DefaultStructuredValue} from '../aspect-meta-model';
import {SammLanguageSettingsService} from '@ame/settings-dialog';

@Injectable({providedIn: 'root'})
export class PropertyModelService extends BaseModelService {
  constructor(
    private entityInstanceService: EntityInstanceService,
    private mxGraphService: MxGraphService,
    private sammLangService: SammLanguageSettingsService,
    private propertyRenderer: PropertyRenderService,
    private mxGraphAttributeService: MxGraphAttributeService
  ) {
    super();
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultProperty;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const modelElement = MxGraphHelper.getModelElement<DefaultProperty>(cell);
    if (modelElement.extendedElement) {
      return;
    }

    modelElement.exampleValue = form.exampleValue;
    super.update(cell, form);

    modelElement.extendedElement = [DefaultProperty, DefaultAbstractProperty].some(c => form?.extends instanceof c) ? form.extends : null;
    this.updatePropertiesNames(cell);
    this.propertyRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    const node = MxGraphHelper.getModelElement<DefaultProperty>(cell);

    const parents = this.mxGraphService.resolveParents(cell);
    for (const parent of parents) {
      const parentModel = MxGraphHelper.getModelElement(parent);
      if (parentModel instanceof DefaultStructuredValue) {
        parentModel.delete(node);
        MxGraphHelper.updateLabel(parent, this.mxGraphService.graph, this.sammLangService);
      }
    }

    this.updateExtends(cell);

    super.delete(cell);
    this.entityInstanceService.onPropertyRemove(node, () => {
      this.mxGraphService.removeCells([cell]);
    });
  }

  private updatePropertiesNames(cell: mxgraph.mxCell) {
    const parents =
      this.mxGraphService.resolveParents(cell)?.filter(e => MxGraphHelper.getModelElement(e) instanceof DefaultProperty) || [];
    const modelElement = MxGraphHelper.getModelElement(cell);

    for (const parentCell of parents) {
      const parentModelElement = MxGraphHelper.getModelElement(parentCell);
      parentModelElement.name = `[${modelElement.name}]`;
      parentModelElement.aspectModelUrn = `${parentModelElement.aspectModelUrn.split('#')[0]}#${parentModelElement.name}`;
      this.updateCell(parentCell);
    }
  }

  private updateCell(cell: mxgraph.mxCell) {
    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(MxGraphHelper.getModelElement(cell), this.sammLangService);
    this.mxGraphService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
  }

  private updateExtends(cell: mxgraph.mxCell, isDeleting = true) {
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    for (const edge of incomingEdges) {
      const element = MxGraphHelper.getModelElement<CanExtend>(edge.source);
      if (element instanceof DefaultProperty && isDeleting) {
        element.extendedElement = null;
        this.mxGraphService.removeCells([edge.source]);
        continue;
      }

      this.updateCell(edge.source);
    }
  }
}
