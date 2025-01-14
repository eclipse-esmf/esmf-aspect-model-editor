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

import {CollectionProps} from '../../shared/props';
import {CollectionType, DefaultCollection} from './default-collection';

export class DefaultList extends DefaultCollection {
  override className = 'DefaultList';
  constructor(props: CollectionProps) {
    super(props);
    this.allowDuplicates = true;
    this.ordered = true;
  }

  override getCollectionType(): CollectionType {
    return CollectionType.LIST;
  }
}
