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

import {MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultAspect, DefaultOperation, DefaultProperty} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AspectPropertyConnectionHandler implements MultiShapeConnector<DefaultAspect, DefaultProperty | DefaultOperation> {
  constructor(private mxGraphService: MxGraphService) {}

  public connect(
    parentMetaModel: DefaultAspect,
    childMetaModel: DefaultProperty | DefaultOperation,
    parent: mxgraph.mxCell,
    child: mxgraph.mxCell,
  ) {
    if (
      childMetaModel instanceof DefaultProperty &&
      !parentMetaModel.properties.find(property => property.aspectModelUrn === childMetaModel.aspectModelUrn)
    ) {
      parentMetaModel.properties.push(childMetaModel);
    } else if (
      childMetaModel instanceof DefaultOperation &&
      !parentMetaModel.operations.find(operation => operation.aspectModelUrn === childMetaModel.aspectModelUrn)
    ) {
      parentMetaModel.operations.push(childMetaModel);
    }
    this.mxGraphService.assignToParent(child, parent);
  }
}
