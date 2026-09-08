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

import {
  AbstractPropertyRenderService,
  MaxGraphAttributeService,
  MaxGraphHelper,
  MaxGraphService,
  MaxGraphVisitorHelper,
} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultValue, HasExtends, NamedElement, ScalarValue} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class AbstractPropertyModelService extends BaseModelService {
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly abstractPropertyRenderer = inject(AbstractPropertyRenderService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly languageService = inject(SammLanguageSettingsService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultProperty && metaModelElement.isAbstract;
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const metaModelElement = MaxGraphHelper.getModelElement<DefaultProperty>(cell);

    if (form.exampleValue instanceof ScalarValue && form.exampleValue.value === '') {
      form.exampleValue = null;
    }

    const previousExampleValue = metaModelElement.exampleValue;

    if (form.exampleValue instanceof DefaultValue) {
      this.currentCachedFile.addElement(form.exampleValue.aspectModelUrn, form.exampleValue);
    }

    if (
      previousExampleValue instanceof DefaultValue &&
      previousExampleValue.isAnonymous?.() &&
      previousExampleValue !== form.exampleValue
    ) {
      this.currentCachedFile.removeElement(previousExampleValue.aspectModelUrn);
      MaxGraphHelper.removeRelation(metaModelElement, previousExampleValue);
      const prevCell = this.maxgraphService.resolveCellByModelElement(previousExampleValue);
      if (prevCell) {
        this.maxgraphService.removeCells([prevCell]);
      }
    }

    metaModelElement.exampleValue = form.exampleValue;

    super.update(cell, form);
    metaModelElement.extends_ = form?.extends instanceof DefaultProperty && form?.extends.isAbstract ? form.extends : null;
    this.updatePropertiesNames(cell);
    this.abstractPropertyRenderer.update({cell});
  }

  delete(cell: Cell) {
    const node = MaxGraphHelper.getModelElement<DefaultProperty>(cell);
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
    this.maxgraphService.removeCells([cell]);
  }

  private updatePropertiesNames(cell: Cell) {
    const parents =
      this.maxgraphService.resolveParents(cell)?.filter(e => MaxGraphHelper.getModelElement(e) instanceof DefaultProperty) || [];
    const modelElement = MaxGraphHelper.getModelElement(cell);

    for (const parentCell of parents) {
      const parentElement = MaxGraphHelper.getModelElement(parentCell);
      parentElement.name = `[${modelElement.name}]`;
      parentElement.aspectModelUrn = `${parentElement.aspectModelUrn.split('#')[0]}#${parentElement.name}`;
      this.updateCell(parentCell);
    }
  }

  private updateExtends(cell: Cell, isDeleting = true) {
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    const modelElement = MaxGraphHelper.getModelElement(cell);

    for (const edge of incomingEdges) {
      const element = MaxGraphHelper.getModelElement<HasExtends>(edge.source);
      if (element instanceof DefaultProperty && isDeleting) {
        MaxGraphHelper.removeRelation(element, modelElement);
        this.maxgraphService.removeCells([edge.source]);
        continue;
      }

      element.extends_ = null;
      this.updateCell(edge.source);
    }
  }

  private updateCell(cell: Cell) {
    cell['configuration'].fields = MaxGraphVisitorHelper.getElementProperties(MaxGraphHelper.getModelElement(cell), this.languageService);
    this.maxgraphService.graph.labelChanged(cell, MaxGraphHelper.createPropertiesLabel(cell), null);
  }
}
