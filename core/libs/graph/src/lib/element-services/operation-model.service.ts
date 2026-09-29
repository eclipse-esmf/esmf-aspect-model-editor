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

import {ElementRelationUtil} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultOperation, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class OperationModelService extends BaseModelService {
  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultOperation;
  }

  update(cell: any, form: {[key: string]: any}) {
    const modelElement = ElementRelationUtil.getModelElement<DefaultOperation>(cell);
    super.update(cell, form);

    const inputList = form.inputChipList;
    const output = form.outputValue;

    this.removeInputDependency(cell, modelElement.input, output);
    this.addInputProperties(cell, inputList);
    modelElement.input = inputList;

    this.removeOutputDependency(cell, modelElement.output, modelElement.input);
    if (output) {
      this.addOutputProperties(cell, output);
    }
    modelElement.output = output;

    this.graphAdapter?.updateCell(cell);
  }

  delete(cell: any) {
    super.delete(cell);
    this.graphAdapter?.removeCells([cell]);
  }

  private removeInputDependency(cell: any, input: Array<DefaultProperty>, output: DefaultProperty) {
    const operation = ElementRelationUtil.getModelElement<DefaultOperation>(cell);
    (this.graphAdapter?.getOutgoingEdges(cell) || []).forEach(edge => {
      const modelElement = ElementRelationUtil.getModelElement(edge.target);
      const inputProperty = input.find(value => value.aspectModelUrn === modelElement?.aspectModelUrn);
      if (
        modelElement instanceof DefaultProperty &&
        operation.output?.aspectModelUrn !== modelElement.aspectModelUrn &&
        output?.aspectModelUrn !== modelElement.aspectModelUrn &&
        inputProperty
      ) {
        const removedEdge = cell.removeEdge ? cell.removeEdge(edge, true) : edge;
        this.graphAdapter?.removeCells([removedEdge]);
        ElementRelationUtil.removeRelation(operation, inputProperty);
      }
    });
  }

  private removeOutputDependency(cell: any, output: DefaultProperty, input: Array<DefaultProperty>) {
    const operation = ElementRelationUtil.getModelElement<DefaultOperation>(cell);
    (this.graphAdapter?.getOutgoingEdges(cell) || []).forEach(edge => {
      const modelElement = ElementRelationUtil.getModelElement(edge.target);
      if (
        modelElement instanceof DefaultProperty &&
        output?.aspectModelUrn === modelElement.aspectModelUrn &&
        !input.find(value => value.aspectModelUrn === modelElement.aspectModelUrn)
      ) {
        const removedEdge = cell.removeEdge ? cell.removeEdge(edge, true) : edge;
        this.graphAdapter?.removeCells([removedEdge]);
        ElementRelationUtil.removeRelation(operation, output);
      }
    });
  }

  private addInputProperties(cell: any, input: Array<DefaultProperty>) {
    input.forEach(property => {
      const cachedProperty = this.currentCachedFile.resolveInstance(property);
      this.graphAdapter?.connectOperationProperty(cell, cachedProperty, true);
    });
  }

  private addOutputProperties(cell: any, property: DefaultProperty) {
    const cachedProperty = this.currentCachedFile.resolveInstance(property);
    this.graphAdapter?.connectOperationProperty(cell, cachedProperty, false);
  }
}
