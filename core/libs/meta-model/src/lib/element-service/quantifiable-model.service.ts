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

import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService, MaxGraphShapeOverlayService} from '@ame/max-graph';
import {inject, Injectable} from '@angular/core';
import {DefaultQuantifiable, DefaultUnit, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class QuantifiableModelService extends BaseModelService {
  private readonly maxgraphShapeOverlayService = inject(MaxGraphShapeOverlayService);
  private readonly maxgraphAttributeService = inject(MaxGraphAttributeService);
  private readonly maxgraphService = inject(MaxGraphService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultQuantifiable;
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const metaModelElement: DefaultQuantifiable = MaxGraphHelper.getModelElement(cell);
    if (!form.unit) {
      metaModelElement.unit = new DefaultUnit({name: '', aspectModelUrn: '', metaModelVersion: '', quantityKinds: []});
    } else {
      metaModelElement.unit = form.unit;
    }
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
