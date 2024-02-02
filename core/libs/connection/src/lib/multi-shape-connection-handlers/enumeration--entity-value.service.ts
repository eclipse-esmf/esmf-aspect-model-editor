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

import {DefaultEnumeration, DefaultEntityValue} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class EnumerationEntityValueConnectionHandler implements MultiShapeConnector<DefaultEnumeration, DefaultEntityValue> {
  constructor(private mxGraphService: MxGraphService) {}

  connect(parentMetaModel: DefaultEnumeration, childMetaModel: DefaultEntityValue, parent: mxgraph.mxCell, child: mxgraph.mxCell): void {
    childMetaModel.addParent(parentMetaModel);
    parentMetaModel.values.push(childMetaModel);

    this.mxGraphService.graph.labelChanged(parent, MxGraphHelper.createPropertiesLabel(parent));
    this.mxGraphService.assignToParent(child, parent);
  }
}
