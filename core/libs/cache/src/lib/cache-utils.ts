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

import {CacheStrategy} from '@esmf/aspect-model-loader';

export class CacheUtils {
  static getCachedElements<T>(cache: CacheStrategy, type: {new (...x: any[]): T}): T[] {
    return cache.getKeys().reduce((acc, key) => {
      if (cache.get(key) instanceof type) {
        acc.push(cache.get(key));
      }
      return acc;
    }, []);
  }
}
