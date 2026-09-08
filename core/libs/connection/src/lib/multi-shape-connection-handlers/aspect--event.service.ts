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

import {MaxGraphService} from '@ame/max-graph';
import {inject, Injectable} from '@angular/core';
import {DefaultAspect, DefaultEvent} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class AspectEventConnectionHandler implements MultiShapeConnector<DefaultAspect, DefaultEvent> {
  private maxgraphService = inject(MaxGraphService);

  public connect(parentMetaModel: DefaultAspect, childMetaModel: DefaultEvent, parent: Cell, child: Cell) {
    if (!parentMetaModel.events.find(operation => operation.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      parentMetaModel.events.push(childMetaModel);
    }
    this.maxgraphService.assignToParent(child, parent);
  }
}
