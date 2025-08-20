/* eslint-disable @typescript-eslint/no-empty-interface */
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

import {QuantifiableProps} from '../../shared/props';
import {DefaultQuantifiable, Quantifiable} from './default-quantifiable';

export interface Duration extends Quantifiable {}
export class DefaultDuration extends DefaultQuantifiable implements Quantifiable {
  override className = 'DefaultDuration';

  constructor(props: QuantifiableProps) {
    super(props);
  }
}
