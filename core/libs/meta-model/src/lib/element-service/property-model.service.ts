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

import {EntityInstanceService} from '@ame/editor';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphVisitorHelper, PropertyRenderService} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {useUpdater} from '@ame/utils';
import {Injectable} from '@angular/core';
import {DefaultProperty, DefaultStructuredValue, HasExtends, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class PropertyModelService extends BaseModelService {
  constructor(
    private entityInstanceService: EntityInstanceService,
    private mxGraphService: MxGraphService,
    private sammLangService: SammLanguageSettingsService,
    private propertyRenderer: PropertyRenderService,
    private mxGraphAttributeService: MxGraphAttributeService,
  ) {
    super();
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultProperty;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const modelElement = MxGraphHelper.getModelElement<DefaultProperty>(cell);
    if (modelElement.extends_) {
      return;
    }

    modelElement.exampleValue = form.exampleValue;
    super.update(cell, form);

    modelElement.extends_ = form.extends instanceof DefaultProperty ? form.extends : null;
    this.updatePropertiesNames(cell);
    this.propertyRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    const node = MxGraphHelper.getModelElement<DefaultProperty>(cell);

    const parents = this.mxGraphService.resolveParents(cell);
    for (const parent of parents) {
      const parentModel = MxGraphHelper.getModelElement(parent);
      if (parentModel instanceof DefaultStructuredValue) {
        useUpdater(parent).delete(node);
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
      const element = MxGraphHelper.getModelElement<HasExtends>(edge.source);
      if (element instanceof DefaultProperty && isDeleting) {
        element.extends_ = null;
        this.mxGraphService.removeCells([edge.source]);
        continue;
      }

      this.updateCell(edge.source);
    }
  }
}
