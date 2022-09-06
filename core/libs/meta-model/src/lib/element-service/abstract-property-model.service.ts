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
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphVisitorHelper, AbstractPropertyRenderService} from '@ame/mx-graph';
import {BaseMetaModelElement} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {CanExtend, DefaultAbstractProperty, DefaultProperty} from '../aspect-meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';

@Injectable({providedIn: 'root'})
export class AbstractPropertyModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private mxGraphService: MxGraphService,
    private abstractPropertyRenderer: AbstractPropertyRenderService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private languageService: LanguageSettingsService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultAbstractProperty;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultAbstractProperty = MxGraphHelper.getModelElement(cell);
    metaModelElement.extendedElement = form?.extends instanceof DefaultAbstractProperty ? form.extends : null;
    metaModelElement.exampleValue = form.exampleValue;

    super.update(cell, form);
    this.updatePropertiesNames(cell);
    this.abstractPropertyRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    this.updateExtends(cell);
    super.delete(cell);
    this.mxGraphService.graph.removeCells([cell]);
  }

  private updatePropertiesNames(cell: mxgraph.mxCell) {
    const parents =
      this.mxGraphService.resolveParents(cell)?.filter(e => MxGraphHelper.getModelElement(e) instanceof DefaultProperty) || [];
    const modelElement = MxGraphHelper.getModelElement(cell);

    for (const parentCell of parents) {
      const parent = MxGraphHelper.getModelElement(parentCell);
      parent.name = `[${modelElement.name}]`;
      parent.aspectModelUrn = `${parent.aspectModelUrn.split('#')[0]}#${parent.name}`;
      this.updateCell(parentCell);
    }
  }

  private updateExtends(cell: mxgraph.mxCell, isDeleting = true) {
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    for (const edge of incomingEdges) {
      const element = MxGraphHelper.getModelElement<CanExtend>(edge.source);
      if (element instanceof DefaultProperty && isDeleting) {
        this.mxGraphService.graph.removeCells([edge.source]);
        continue;
      }

      element.extendedElement = null;
      this.updateCell(edge.source);
    }
  }

  private updateCell(cell: mxgraph.mxCell) {
    cell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(MxGraphHelper.getModelElement(cell), this.languageService);
    this.mxGraphService.graph.labelChanged(cell, MxGraphHelper.createPropertiesLabel(cell));
  }
}
