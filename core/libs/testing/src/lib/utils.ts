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

import {vi} from 'vitest';

export const provideMockObject = <T>(service: T) => {
  if (typeof service !== 'function') {
    throw new Error('"service" needs to be a class or function');
  }

  const object: any = {};
  for (const key of Object.getOwnPropertyNames((service as any).prototype)) {
    if (key !== 'currentCachedFile' && key !== 'visitorAnnouncer$' && key !== 'graph') {
      if (!(service as any).prototype[key]) {
        continue;
      }

      if (typeof (service as any).prototype[key] === 'function') {
        object[key] = vi.fn();
        continue;
      }

      object[key] = (service as any).prototype[key];
    }
  }

  return object;
};
