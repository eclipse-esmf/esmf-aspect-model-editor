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

import {ShapeConnectorService} from '@ame/connection';
import {FiltersService} from '@ame/loader-filters';
import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, ModelInfo, OperationRenderService} from '@ame/max-graph';
import {Injectable, inject} from '@angular/core';
import {DefaultOperation, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class OperationModelService extends BaseModelService {
  private readonly filtersService = inject(FiltersService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly shapeConnectorService = inject(ShapeConnectorService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly operationRender = inject(OperationRenderService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultOperation;
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultOperation>(cell);
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

    this.operationRender.update({cell});
  }

  delete(cell: Cell) {
    super.delete(cell);
    this.maxgraphService.removeCells([cell]);
  }

  private removeInputDependency(cell: Cell, input: Array<DefaultProperty>, output: DefaultProperty) {
    const operation = MaxGraphHelper.getModelElement<DefaultOperation>(cell);
    this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null).forEach(edge => {
      const modelElement = MaxGraphHelper.getModelElement(edge.target);
      const inputProperty = input.find(value => value.aspectModelUrn === modelElement.aspectModelUrn);
      if (
        modelElement instanceof DefaultProperty &&
        operation.output?.aspectModelUrn !== modelElement.aspectModelUrn &&
        output?.aspectModelUrn !== modelElement.aspectModelUrn &&
        inputProperty
      ) {
        this.maxgraphService.removeCells([cell.removeEdge(edge, true)]);
        MaxGraphHelper.removeRelation(operation, inputProperty);
      }
    });
  }

  private removeOutputDependency(cell: Cell, output: DefaultProperty, input: Array<DefaultProperty>) {
    const operation = MaxGraphHelper.getModelElement<DefaultOperation>(cell);
    this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null).forEach(edge => {
      const modelElement = MaxGraphHelper.getModelElement(edge.target);
      if (
        modelElement instanceof DefaultProperty &&
        output?.aspectModelUrn === modelElement.aspectModelUrn &&
        !input.find(value => value.aspectModelUrn === modelElement.aspectModelUrn)
      ) {
        this.maxgraphService.removeCells([cell.removeEdge(edge, true)]);
        MaxGraphHelper.removeRelation(operation, output);
      }
    });
  }

  private addInputProperties(cell: Cell, input: Array<DefaultProperty>) {
    input.forEach(property => {
      const cachedProperty = this.currentCachedFile.resolveInstance(property);
      const operation = MaxGraphHelper.getModelElement(cell);
      const resolvedCell = this.maxgraphService.resolveCellByModelElement(cachedProperty);
      const propertyCell = resolvedCell
        ? resolvedCell
        : this.maxgraphService.renderModelElement(this.filtersService.createNode(cachedProperty, {parent: operation}));
      this.shapeConnectorService.connectShapes(operation, cachedProperty, cell, propertyCell, ModelInfo.IS_OPERATION_INPUT);
    });
  }

  private addOutputProperties(cell: Cell, property: DefaultProperty) {
    const cachedProperty = this.currentCachedFile.resolveInstance(property);
    const operation = MaxGraphHelper.getModelElement(cell);
    const resolvedCell = this.maxgraphService.resolveCellByModelElement(cachedProperty);
    const propertyCell = resolvedCell
      ? resolvedCell
      : this.maxgraphService.renderModelElement(this.filtersService.createNode(cachedProperty, {parent: operation}));
    this.shapeConnectorService.connectShapes(operation, cachedProperty, cell, propertyCell, ModelInfo.IS_OPERATION_OUTPUT);
  }
}
