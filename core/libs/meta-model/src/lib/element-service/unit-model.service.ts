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

import {inject, Injectable} from '@angular/core';

import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphShapeOverlayService, UnitRenderService} from '@ame/max-graph';
import {DefaultQuantityKind, DefaultUnit, NamedElement, SammU} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseModelService} from './base-model-service';

declare const sammUDefinition: any;

@Injectable({providedIn: 'root'})
export class UnitModelService extends BaseModelService {
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly unitRenderer = inject(UnitRenderService);

  private get sammU(): SammU {
    return this.loadedFile?.rdfModel.sammU;
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultUnit;
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultUnit>(cell);
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
      return new DefaultQuantityKind({
        metaModelVersion: modelElement.metaModelVersion,
        aspectModelUrn: urn,
        name: qk,
        label: quantityKind.label,
      });
    });

    this.unitRenderer.update({cell, form});
  }

  delete(cell: Cell) {
    super.delete(cell);
    const modelElement = MaxGraphHelper.getModelElement(cell);
    const outgoingEdges = this.maxgraphAttributeService.graph.getOutgoingEdges(cell, null);
    const incomingEdges = this.maxgraphAttributeService.graph.getIncomingEdges(cell, null);
    this.maxgraphShapeOverlayService.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.maxgraphShapeOverlayService.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.maxgraphService.removeCells([cell]);
  }
}
