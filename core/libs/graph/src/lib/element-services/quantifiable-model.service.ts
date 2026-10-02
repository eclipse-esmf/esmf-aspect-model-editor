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

import {getModelElement} from '@ame/shared';
import {Injectable} from '@angular/core';
import {DefaultQuantifiable, DefaultUnit, NamedElement} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class QuantifiableModelService extends BaseModelService {
  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultQuantifiable;
  }

  update(cell: any, form: {[key: string]: any}) {
    const metaModelElement: DefaultQuantifiable = getModelElement(cell);
    if (!form.unit) {
      metaModelElement.unit = new DefaultUnit({name: '', aspectModelUrn: '', metaModelVersion: '', quantityKinds: []});
    } else {
      metaModelElement.unit = form.unit;
    }
  }

  delete(cell: any) {
    super.delete(cell);
    const modelElement = getModelElement(cell);
    const outgoingEdges = this.graphAdapter?.getOutgoingEdges(cell) || [];
    const incomingEdges = this.graphAdapter?.getIncomingEdges(cell) || [];
    this.graphAdapter?.checkAndAddTopShapeActionIcon(outgoingEdges, modelElement);
    this.graphAdapter?.checkAndAddShapeActionIcon(incomingEdges, modelElement);
    this.graphAdapter?.removeCells([cell]);
  }
}
