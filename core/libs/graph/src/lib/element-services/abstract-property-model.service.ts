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

import {ElementRelationUtil, getModelElement} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultProperty, DefaultValue, HasExtends, NamedElement, ScalarValue} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class AbstractPropertyModelService extends BaseModelService {
  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultProperty && metaModelElement.isAbstract;
  }

  update(cell: any, form: {[key: string]: any}) {
    const metaModelElement = getModelElement<DefaultProperty>(cell);

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
      ElementRelationUtil.removeRelation(metaModelElement, previousExampleValue, this.loadedFilesService);
      const prevCell = this.graphAdapter?.resolveCellByModelElement(previousExampleValue);
      if (prevCell) {
        this.graphAdapter?.removeCells([prevCell]);
      }
    }

    metaModelElement.exampleValue = form.exampleValue;
    super.update(cell, form);
    metaModelElement.extends_ = form?.extends instanceof DefaultProperty && form?.extends.isAbstract ? form.extends : null;
    this.updatePropertiesNames(cell);
    this.graphAdapter?.updateCell(cell);
  }

  delete(cell: any) {
    const node = getModelElement<DefaultProperty>(cell);
    this.updateExtends(cell);
    if (node?.exampleValue instanceof DefaultValue && node.exampleValue.isAnonymous?.()) {
      const anonValue = node.exampleValue;
      this.currentCachedFile.removeElement(anonValue.aspectModelUrn);
      const anonCell = this.graphAdapter?.resolveCellByModelElement(anonValue);
      if (anonCell) {
        this.graphAdapter?.removeCells([anonCell]);
      }
    }
    super.delete(cell);
    this.graphAdapter?.removeCells([cell]);
  }

  private updatePropertiesNames(cell: any) {
    const parents = this.graphAdapter?.resolveParents(cell)?.filter(e => getModelElement(e) instanceof DefaultProperty) || [];
    const modelElement = getModelElement(cell);

    for (const parentCell of parents) {
      const parentElement = getModelElement(parentCell);
      parentElement.name = `[${modelElement.name}]`;
      parentElement.aspectModelUrn = `${parentElement.aspectModelUrn.split('#')[0]}#${parentElement.name}`;
      this.updateCell(parentCell);
    }
  }

  private updateExtends(cell: any, isDeleting = true) {
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    const modelElement = getModelElement(cell);

    for (const edge of incomingEdges) {
      const element = getModelElement<HasExtends>(edge.source);
      if (element instanceof DefaultProperty && isDeleting) {
        ElementRelationUtil.removeRelation(element, modelElement, this.loadedFilesService);
        this.graphAdapter?.removeCells([edge.source]);
        continue;
      }

      element.extends_ = null;
      this.updateCell(edge.source);
    }
  }

  private updateCell(cell: any) {
    this.graphAdapter?.setCellPropertiesLabel(cell);
  }
}
