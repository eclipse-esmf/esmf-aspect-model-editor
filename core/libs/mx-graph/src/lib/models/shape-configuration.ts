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

import {ShapeGeometry} from '@ame/shared';
import {ShapeAttribute} from '../helpers/mx-graph-visitor-helper';

export interface ShapeConfiguration {
  shapeAttributes: ShapeAttribute[];
  geometry: {
    x?: number;
    y?: number;
    size?: ShapeGeometry;
  };
}
