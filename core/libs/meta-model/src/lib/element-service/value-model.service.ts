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

import {inject, Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';

import {MxGraphHelper, MxGraphService, ValueRenderService} from '@ame/mx-graph';
import {DefaultValue, NamedElement} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class ValueModelService extends BaseModelService {
  private mxGraphService = inject(MxGraphService);
  private valueRender = inject(ValueRenderService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultValue;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const modelElement = MxGraphHelper.getModelElement<DefaultValue>(cell);
    super.update(cell, form);
    modelElement.value = form.value;

    this.valueRender.update({cell, form});
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    this.mxGraphService.removeCells([cell]);
  }
}
