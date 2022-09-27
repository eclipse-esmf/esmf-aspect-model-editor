/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {mxgraph} from 'mxgraph-factory';
import {BaseMetaModelElement} from '../../aspect-meta-model';

export interface PredefinedRemove {
  delete(cell: mxgraph.mxCell): boolean;
  decouple(edge: mxgraph.mxCell, source: BaseMetaModelElement): boolean;
}
