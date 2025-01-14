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

import {NamedElement} from '@esmf/aspect-model-loader';

export class ModelRelationArray<T extends NamedElement> extends Array<T> {
  push(...items: T[]): number {
    let pushedItemsCount = 0;
    for (const item of items) {
      const existent = this.some(e => e.aspectModelUrn === item.aspectModelUrn);
      if (existent) {
        continue;
      }

      super.push(item);
      ++pushedItemsCount;
    }

    return pushedItemsCount;
  }
}
