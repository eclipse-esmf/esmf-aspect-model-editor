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

import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';

import {BaseModelService} from './base-model-service';
import {MxGraphAttributeService, MxGraphHelper, MxGraphService, MxGraphShapeOverlayService, UnitRenderService} from '@ame/mx-graph';
import {BaseMetaModelElement, DefaultQuantityKind, DefaultUnit} from '@ame/meta-model';
import {SammU} from '@ame/vocabulary';

declare const sammUDefinition: any;

@Injectable({providedIn: 'root'})
export class UnitModelService extends BaseModelService {
  private get sammU(): SammU {
    return this.modelService.getLoadedAspectModel().rdfModel.SAMMU();
  }

  constructor(
    private mxGraphShapeOverlayService: MxGraphShapeOverlayService,
    private mxGraphAttributeService: MxGraphAttributeService,
    private mxGraphService: MxGraphService,
    private unitRenderer: UnitRenderService
  ) {
    super();
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultUnit;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const modelElement = MxGraphHelper.getModelElement<DefaultUnit>(cell);
    super.update(cell, form);
    modelElement.referenceUnit = form.referenceUnit;
    modelElement.code = form.code;
    modelElement.conversionFactor = form.conversionFactor;
    modelElement.numericConversionFactor = form.numericConversionFactor;
    modelElement.quantityKinds = form.quanitKinds;
    modelElement.symbol = form.symbol;

    // update quantity kind
    modelElement.quantityKinds = form.quantityKindsChipList.map(qk => {
      const urn = `${this.sammU.getNamespace()}${qk}`;
      const quantityKind = sammUDefinition.quantityKinds[qk];
      return new DefaultQuantityKind(modelElement.metaModelVersion, urn, qk, quantityKind.label);
    });

    this.unitRenderer.update({cell, form});
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    const modelElement = MxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.mxGraphAttributeService.graph.getOutgoingEdges(cell);
    const incomingEdges = this.mxGraphAttributeService.graph.getIncomingEdges(cell);
    this.mxGraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.mxGraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.mxGraphService.removeCells([cell]);
  }
}
