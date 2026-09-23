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

import {ElementRelationUtil, ENTITY_INSTANCE_SERVICE, getModelElement, IEntityInstanceService, useUpdater} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultStructuredValue, DefaultValue, HasExtends, NamedElement, ScalarValue} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class PropertyModelService extends BaseModelService {
  private readonly entityInstanceService = inject<IEntityInstanceService>(ENTITY_INSTANCE_SERVICE, {optional: true});

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultProperty;
  }

  update(cell: any, form: {[key: string]: any}) {
    const modelElement = getModelElement<DefaultProperty>(cell);
    if (modelElement.extends_) {
      return;
    }

    if (form.exampleValue instanceof ScalarValue && form.exampleValue.value === '') {
      form.exampleValue = null;
    }

    const previousExampleValue = modelElement.exampleValue;

    if (form.exampleValue instanceof DefaultValue) {
      if (!this.loadedFilesService.isElementExtern(form.exampleValue)) {
        this.currentCachedFile.addElement(form.exampleValue.aspectModelUrn, form.exampleValue);
      }
    }

    if (
      previousExampleValue instanceof DefaultValue &&
      previousExampleValue.isAnonymous?.() &&
      previousExampleValue !== form.exampleValue
    ) {
      this.currentCachedFile.removeElement(previousExampleValue.aspectModelUrn);
      ElementRelationUtil.removeRelation(modelElement, previousExampleValue, this.loadedFilesService);
      const prevCell = this.graphAdapter?.resolveCellByModelElement(previousExampleValue);
      if (prevCell) {
        this.graphAdapter?.removeCells([prevCell]);
      }
    }

    modelElement.exampleValue = form.exampleValue;
    super.update(cell, form);

    modelElement.extends_ = form.extends instanceof DefaultProperty ? form.extends : null;
    this.updatePropertiesNames(cell);
    this.graphAdapter?.updateCell(cell);
  }

  delete(cell: any) {
    const node = getModelElement<DefaultProperty>(cell);

    const parents = this.graphAdapter?.resolveParents(cell) || [];
    for (const parent of parents) {
      const parentModel = getModelElement(parent);
      if (parentModel instanceof DefaultStructuredValue) {
        useUpdater(parent).delete(node);
        this.graphAdapter?.updateCellLabel(parent);
      }
    }

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
    this.entityInstanceService?.onPropertyRemove(node, () => {
      this.graphAdapter?.removeCells([cell]);
    });
  }

  private updatePropertiesNames(cell: any) {
    const parents = this.graphAdapter?.resolveParents(cell)?.filter(e => getModelElement(e) instanceof DefaultProperty) || [];
    const modelElement = getModelElement(cell);

    for (const parentCell of parents) {
      const parentModelElement = getModelElement(parentCell);
      parentModelElement.name = `[${modelElement.name}]`;
      parentModelElement.aspectModelUrn = `${parentModelElement.aspectModelUrn.split('#')[0]}#${parentModelElement.name}`;
      this.updateCell(parentCell);
    }
  }

  private updateCell(cell: any) {
    this.graphAdapter?.setCellPropertiesLabel(cell);
  }

  private updateExtends(cell: any, isDeleting = true) {
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    for (const edge of incomingEdges) {
      const element = getModelElement<HasExtends>(edge.source);
      if (element instanceof DefaultProperty && isDeleting) {
        element.extends_ = null;
        this.graphAdapter?.removeCells([edge.source]);
        continue;
      }

      this.updateCell(edge.source);
    }
  }
}
