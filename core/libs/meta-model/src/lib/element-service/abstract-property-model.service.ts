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
import {MxGraphHelper, MxGraphService, PropertyRenderService} from '@ame/mx-graph';
import {BaseMetaModelElement} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {DefaultAbstractProperty, DefaultProperty, DefaultStructuredValue} from '../aspect-meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';

@Injectable({providedIn: 'root'})
export class AbstractPropertyModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private entityValueService: EntityValueService,
    private mxGraphService: MxGraphService,
    private languageSettingsService: LanguageSettingsService,
    private propertyRenderer: PropertyRenderService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultAbstractProperty;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultAbstractProperty = MxGraphHelper.getModelElement(cell);
    super.update(cell, form);

    metaModelElement.extendedElement = [DefaultProperty, DefaultAbstractProperty].some(c => form?.extends instanceof c)
      ? form.extends
      : null;
    metaModelElement.exampleValue = form.exampleValue;

    this.propertyRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    const modelElement: DefaultAbstractProperty = MxGraphHelper.getModelElement(cell);

    const parents = this.mxGraphService.resolveParents(cell);
    for (const parent of parents) {
      const parentModel = MxGraphHelper.getModelElement(parent);
      if (parentModel instanceof DefaultStructuredValue) {
        parentModel.delete(modelElement);
        MxGraphHelper.updateLabel(parent, this.mxGraphService.graph, this.languageSettingsService);
      }
    }

    super.delete(cell);
    // this.entityValueService.onPropertyRemove(modelElement, () => {
    //   this.mxGraphService.removeCells([cell]);
    // });
  }
}
