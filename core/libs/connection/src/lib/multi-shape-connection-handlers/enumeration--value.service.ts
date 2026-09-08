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

import {Injectable} from '@angular/core';
import {DefaultEnumeration, DefaultValue} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class EnumerationValueConnectionHandler
  extends BaseConnectionHandler
  implements MultiShapeConnector<DefaultEnumeration, DefaultValue>
{
  connect(parentMetaModel: DefaultEnumeration, childMetaModel: DefaultValue, parent: Cell, child: Cell): void {
    childMetaModel.addParent(parentMetaModel);
    parentMetaModel.values.push(childMetaModel);

    this.maxgraphService.assignToParent(child, parent);
    this.refreshPropertiesLabel(parent, parentMetaModel);
  }
}
