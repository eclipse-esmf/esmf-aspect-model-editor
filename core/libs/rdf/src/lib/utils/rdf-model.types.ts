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

import {Quad_Object} from 'n3';

export interface InstantiatorListElement {
  blankNode?: boolean;
  quad: Quad_Object;
  optional?: Quad_Object;
  notInPayload?: Quad_Object;
  payloadName?: Quad_Object;
  extends?: Quad_Object;
}
