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
import {Cell} from '@maxgraph/core';

import {MaxGraphHelper, MaxGraphService, ValueRenderService} from '@ame/max-graph';
import {DefaultValue, NamedElement} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class ValueModelService extends BaseModelService {
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly valueRender = inject(ValueRenderService);

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultValue;
  }

  update(cell: Cell, form: {[key: string]: any}) {
    const modelElement = MaxGraphHelper.getModelElement<DefaultValue>(cell);
    super.update(cell, form);
    modelElement.value = form.value;

    this.valueRender.update({cell, form});
  }

  delete(cell: Cell) {
    super.delete(cell);
    this.maxgraphService.removeCells([cell]);
  }
}
