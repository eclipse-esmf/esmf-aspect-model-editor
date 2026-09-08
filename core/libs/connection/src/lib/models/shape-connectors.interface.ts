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

import {ModelInfo} from '@ame/max-graph';

import {Cell} from '@maxgraph/core';

export interface SingleShapeConnector<T> {
  connect(metaModel: T, source: Cell, modelInfo?: ModelInfo): void;
}

export interface MultiShapeConnector<T, R> {
  connect(parentMetaModel: T, childMetaModel: R, parent: Cell, child: Cell): void;
}

export interface MultiShapeConnectorWithProperty<T, R> {
  connect(parentMetaModel: T, childMetaModel: R, parent: Cell, child: Cell, property: string): void;
}
