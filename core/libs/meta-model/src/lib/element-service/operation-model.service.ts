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

import {ShapeConnectorService} from '@ame/connection';
import {FiltersService} from '@ame/loader-filters';
import {ModelInfo, MxGraphAttributeService, MxGraphHelper, MxGraphService, OperationRenderService} from '@ame/mx-graph';
import {Injectable, inject} from '@angular/core';
import {DefaultOperation, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class OperationModelService extends BaseModelService {
  private filtersService = inject(FiltersService);

  constructor(
    private mxGraphAttributeService: MxGraphAttributeService,
    private shapeConnectorService: ShapeConnectorService,
    private mxGraphService: MxGraphService,
    private operationRender: OperationRenderService,
  ) {
    super();
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultOperation;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const modelElement = MxGraphHelper.getModelElement<DefaultOperation>(cell);
    super.update(cell, form);

    const inputList = form.inputChipList;
    const output = form.outputValue;

    this.removeInputDependency(cell, modelElement.input, output);
    this.addInputProperties(cell, inputList);
    modelElement.input = inputList.map(input => ({property: input, keys: {}}));

    this.removeOutputDependency(cell, modelElement.output, modelElement.input);
    if (output) {
      this.addOutputProperties(cell, output);
    }
    modelElement.output = output;

    this.operationRender.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    this.mxGraphService.removeCells([cell]);
  }

  private removeInputDependency(cell: mxgraph.mxCell, input: Array<DefaultProperty>, output: DefaultProperty) {
    const operation = MxGraphHelper.getModelElement<DefaultOperation>(cell);
    this.mxGraphAttributeService.graph.getOutgoingEdges(cell).forEach(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.target);
      const inputProperty = input.find(value => value.aspectModelUrn === modelElement.aspectModelUrn);
      if (
        modelElement instanceof DefaultProperty &&
        operation.output?.aspectModelUrn !== modelElement.aspectModelUrn &&
        output?.aspectModelUrn !== modelElement.aspectModelUrn &&
        inputProperty
      ) {
        this.mxGraphService.removeCells([cell.removeEdge(edge, true)]);
        MxGraphHelper.removeRelation(operation, inputProperty);
      }
    });
  }

  private removeOutputDependency(cell: mxgraph.mxCell, output: DefaultProperty, input: Array<DefaultProperty>) {
    const operation = MxGraphHelper.getModelElement<DefaultOperation>(cell);
    this.mxGraphAttributeService.graph.getOutgoingEdges(cell).forEach(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.target);
      if (
        modelElement instanceof DefaultProperty &&
        output?.aspectModelUrn === modelElement.aspectModelUrn &&
        !input.find(value => value.aspectModelUrn === modelElement.aspectModelUrn)
      ) {
        this.mxGraphService.removeCells([cell.removeEdge(edge, true)]);
        MxGraphHelper.removeRelation(operation, output);
      }
    });
  }

  private addInputProperties(cell: mxgraph.mxCell, input: Array<DefaultProperty>) {
    input.forEach(property => {
      const cachedProperty = this.currentCachedFile.resolveInstance(property);
      const operation = MxGraphHelper.getModelElement(cell);
      const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedProperty);
      const propertyCell = resolvedCell
        ? resolvedCell
        : this.mxGraphService.renderModelElement(this.filtersService.createNode(cachedProperty, {parent: operation}));
      this.shapeConnectorService.connectShapes(operation, cachedProperty, cell, propertyCell, ModelInfo.IS_OPERATION_INPUT);
    });
  }

  private addOutputProperties(cell: mxgraph.mxCell, property: DefaultProperty) {
    const cachedProperty = this.currentCachedFile.resolveInstance(property);
    const operation = MxGraphHelper.getModelElement(cell);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedProperty);
    const propertyCell = resolvedCell
      ? resolvedCell
      : this.mxGraphService.renderModelElement(this.filtersService.createNode(cachedProperty, {parent: operation}));
    this.shapeConnectorService.connectShapes(operation, cachedProperty, cell, propertyCell, ModelInfo.IS_OPERATION_OUTPUT);
  }
}
