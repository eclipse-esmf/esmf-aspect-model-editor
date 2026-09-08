/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphVisitorHelper, PropertyRenderService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {useUpdater} from '@ame/utils';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultStructuredValue, DefaultValue, HasExtends, NamedElement, ScalarValue} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class PropertyModelService extends BaseModelService {
  private readonly entityInstanceService = inject(EntityInstanceService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly sammLangService = inject(SammLanguageSettingsService);
  private readonly propertyRenderer = inject(PropertyRenderService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultProperty;
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultProperty>(cell);
    if (modelElement.extends_) {
      return;
    }

    if (form.exampleValue instanceof ScalarValue && form.exampleValue.value === '') {
      form.exampleValue = null;
    }

    const previousExampleValue = modelElement.exampleValue;

    if (form.exampleValue instanceof DefaultValue) {
      this.currentCachedFile.addElement(form.exampleValue.aspectModelUrn, form.exampleValue);
    }

    if (
      previousExampleValue instanceof DefaultValue &&
      previousExampleValue.isAnonymous?.() &&
      previousExampleValue !== form.exampleValue
    ) {
      this.currentCachedFile.removeElement(previousExampleValue.aspectModelUrn);
      MaxGraphHelper.removeRelation(modelElement, previousExampleValue);
      const prevCell = this.maxgraphService.resolveCellByModelElement(previousExampleValue);
      if (prevCell) {
        this.maxgraphService.removeCells([prevCell]);
      }
    }

    modelElement.exampleValue = form.exampleValue;
    super.update(cell, form);

    modelElement.extends_ = form.extends instanceof DefaultProperty ? form.extends : null;
    this.updatePropertiesNames(cell);
    this.propertyRenderer.update({cell});
  }

  delete(cell: Cell) {
    const node = MaxGraphHelper.getModelElement<DefaultProperty>(cell);

    const parents = this.maxgraphService.resolveParents(cell);
    for (const parent of parents) {
      const parentModel = MaxGraphHelper.getModelElement(parent);
      if (parentModel instanceof DefaultStructuredValue) {
        useUpdater(parent).delete(node);
        MaxGraphHelper.updateLabel(parent, this.maxgraphService.graph, this.sammLangService);
      }
    }

    this.updateExtends(cell);

    if (node?.exampleValue instanceof DefaultValue && node.exampleValue.isAnonymous?.()) {
      const anonValue = node.exampleValue;
      this.currentCachedFile.removeElement(anonValue.aspectModelUrn);
      const anonCell = this.maxgraphService.resolveCellByModelElement(anonValue);
      if (anonCell) {
        this.maxgraphService.removeCells([anonCell]);
      }
    }

    super.delete(cell);
    this.entityInstanceService.onPropertyRemove(node, () => {
      this.maxgraphService.removeCells([cell]);
    });
  }

  private updatePropertiesNames(cell: Cell) {
    const parents =
      this.maxgraphService.resolveParents(cell)?.filter(e => MaxGraphHelper.getModelElement(e) instanceof DefaultProperty) || [];
    const modelElement = MaxGraphHelper.getModelElement(cell);

    for (const parentCell of parents) {
      const parentModelElement = MaxGraphHelper.getModelElement(parentCell);
      parentModelElement.name = `[${modelElement.name}]`;
      parentModelElement.aspectModelUrn = `${parentModelElement.aspectModelUrn.split('#')[0]}#${parentModelElement.name}`;
      this.updateCell(parentCell);
    }
  }

  private updateCell(cell: Cell) {
    cell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(MaxGraphHelper.getModelElement(cell), this.sammLangService);
    this.maxgraphService.graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);
  }

  private updateExtends(cell: Cell, isDeleting = true) {
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    for (const edge of incomingEdges) {
      const element = MaxGraphHelper.getModelElement<HasExtends>(edge.source);
      if (element instanceof DefaultProperty && isDeleting) {
        element.extends_ = null;
        this.maxgraphService.removeCells([edge.source]);
        continue;
      }

      this.updateCell(edge.source);
    }
  }
}
