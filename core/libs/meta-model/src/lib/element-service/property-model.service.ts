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
import {EntityValueService} from '@ame/editor';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphVisitorHelper, PropertyRenderService} from '@ame/mx-graph';
import {BaseMetaModelElement, DefaultProperty} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {DefaultAbstractProperty, DefaultStructuredValue} from '../aspect-meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';

@Injectable({providedIn: 'root'})
export class PropertyModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private entityValueService: EntityValueService,
    private mxGraphService: MxGraphService,
    private languageSettingsService: LanguageSettingsService,
    private propertyRenderer: PropertyRenderService,
    private mxGraphAttributeService: MxGraphAttributeService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultProperty;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultProperty = MxGraphHelper.getModelElement(cell);

    metaModelElement.extendedElement = [DefaultProperty, DefaultAbstractProperty].some(c => form?.extends instanceof c)
      ? form.extends
      : null;
    metaModelElement.exampleValue = form.exampleValue;

    super.update(cell, form);
    this.propertyRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    const modelElement: DefaultProperty = MxGraphHelper.getModelElement(cell);

    const parents = this.mxGraphService.resolveParents(cell);
    for (const parent of parents) {
      const parentModel = MxGraphHelper.getModelElement(parent);
      if (parentModel instanceof DefaultStructuredValue) {
        parentModel.delete(modelElement);
        MxGraphHelper.updateLabel(parent, this.mxGraphService.graph, this.languageSettingsService);
      }
    }

    this.updateExtends(cell);

    super.delete(cell);
    this.entityValueService.onPropertyRemove(modelElement, () => {
      this.mxGraphService.removeCells([cell]);
    });
  }

  private updateExtends(cell: mxgraph.mxCell) {
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    for (const edge of incomingEdges) {
      const abstractProperty = MxGraphHelper.getModelElement<DefaultAbstractProperty>(edge.source);
      abstractProperty.extendedElement = null;
      edge.source['configuration'].fields = MxGraphVisitorHelper.getElementProperties(
        MxGraphHelper.getModelElement(edge.source),
        this.languageSettingsService
      );
      this.mxGraphService.graph.labelChanged(edge.source, MxGraphHelper.createPropertiesLabel(edge.source));
    }
  }
}
