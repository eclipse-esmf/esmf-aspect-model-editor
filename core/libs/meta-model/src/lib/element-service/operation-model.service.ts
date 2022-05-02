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
import {BaseMetaModelElement, DefaultOperation, DefaultProperty, OverWrittenProperty} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {
  ModelInfo,
  MxGraphAttributeService,
  MxGraphHelper,
  MxGraphService,
  MxGraphShapeOverlayService,
  OperationRenderService,
} from '@ame/mx-graph';
import {ShapeConnectorService} from '@ame/connection';

@Injectable({providedIn: 'root'})
export class OperationModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private shapeConnectorService: ShapeConnectorService,
    private mxGraphService: MxGraphService,
    private operationRender: OperationRenderService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultOperation;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement: DefaultOperation = MxGraphHelper.getModelElement(cell);
    super.update(cell, form);

    const inputList = form.inputChipList;
    const output = form.outputValue;

    this.removeInputDependency(cell, metaModelElement.input, output);
    this.addInputProperties(cell, inputList);
    metaModelElement.input = inputList.map(input => ({property: input, keys: {}}));

    this.removeOutputDependency(cell, metaModelElement.output, metaModelElement.input);
    if (output) {
      this.addOutputProperties(cell, output);
      metaModelElement.output = {property: output, keys: {}};
    } else {
      metaModelElement.output = output;
    }

    this.operationRender.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    this.mxGraphService.removeCells([cell]);
  }

  private removeInputDependency(cell: mxgraph.mxCell, input: Array<OverWrittenProperty>, output: OverWrittenProperty) {
    const operation = MxGraphHelper.getModelElement<DefaultOperation>(cell);
    this.mxGraphAttributeService.graph.getOutgoingEdges(cell).forEach(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.target);
      if (
        modelElement instanceof DefaultProperty &&
        operation.output?.property.aspectModelUrn !== modelElement.aspectModelUrn &&
        output?.property?.aspectModelUrn !== modelElement.aspectModelUrn &&
        input.find(value => value.property.aspectModelUrn === modelElement.aspectModelUrn)
      ) {
        this.mxGraphService.removeCells([cell.removeEdge(edge, true)]);
      }
    });
  }

  private removeOutputDependency(cell: mxgraph.mxCell, output: OverWrittenProperty, input: Array<OverWrittenProperty>) {
    this.mxGraphAttributeService.graph.getOutgoingEdges(cell).forEach(edge => {
      const modelElement = MxGraphHelper.getModelElement(edge.target);
      if (
        modelElement instanceof DefaultProperty &&
        output?.property?.aspectModelUrn === modelElement.aspectModelUrn &&
        !input.find(value => value.property.aspectModelUrn === modelElement.aspectModelUrn)
      ) {
        this.mxGraphService.removeCells([cell.removeEdge(edge, true)]);
      }
    });
  }

  private addInputProperties(cell: mxgraph.mxCell, input: Array<DefaultProperty>) {
    input.forEach(property => {
      const cachedProperty = this.currentCachedFile.resolveCachedElement(property);
      const operation = MxGraphHelper.getModelElement(cell);
      const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedProperty);
      const propertyCell = resolvedCell ? resolvedCell : this.mxGraphService.renderModelElement(cachedProperty);
      this.shapeConnectorService.connectShapes(operation, cachedProperty, cell, propertyCell, ModelInfo.IS_OPERATION_INPUT);
    });
  }

  private addOutputProperties(cell: mxgraph.mxCell, property: DefaultProperty) {
    const cachedProperty = this.currentCachedFile.resolveCachedElement(property);
    const operation = MxGraphHelper.getModelElement(cell);
    const resolvedCell = this.mxGraphService.resolveCellByModelElement(cachedProperty);
    const propertyCell = resolvedCell ? resolvedCell : this.mxGraphService.renderModelElement(cachedProperty);
    this.shapeConnectorService.connectShapes(operation, cachedProperty, cell, propertyCell, ModelInfo.IS_OPERATION_OUTPUT);
  }
}
