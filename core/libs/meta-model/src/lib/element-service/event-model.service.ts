/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {BaseModelService} from './base-model-service';
import {BaseMetaModelElement, DefaultEvent} from '@ame/meta-model';
import {ModelService} from '@ame/rdf/services';
import {mxgraph} from 'mxgraph-factory';
import {EventRenderService, MxGraphService} from '@ame/mx-graph';

@Injectable({providedIn: 'root'})
export class EventModelService extends BaseModelService {
  constructor(
    namespacesCacheService: NamespacesCacheService,
    modelService: ModelService,
    private mxGraphService: MxGraphService,
    private aspectRenderer: EventRenderService
  ) {
    super(namespacesCacheService, modelService);
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
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
