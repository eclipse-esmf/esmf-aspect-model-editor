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

import {EventRenderService, MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultEvent, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class EventModelService extends BaseModelService {
  constructor(
    private mxGraphService: MxGraphService,
    private aspectRenderer: EventRenderService,
  ) {
    super();
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultEvent;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    super.update(cell, form);
    this.aspectRenderer.update({cell});
  }

  delete(cell: mxgraph.mxCell) {
    super.delete(cell);
    this.mxGraphService.removeCells([cell]);
  }
}
