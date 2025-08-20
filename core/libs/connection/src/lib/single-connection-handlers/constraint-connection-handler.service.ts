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

import {Injectable} from '@angular/core';
import {DefaultConstraint} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {SingleShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ConstraintConnectionHandler implements SingleShapeConnector<DefaultConstraint> {
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public connect(_constraint: DefaultConstraint, _source: mxgraph.mxCell) {
    // This method is intentionally left empty as any type of constraint - child connection is not allowed
  }
}
