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

import {describe, expect, it} from 'vitest';
import {sammSpecificationUrl} from './samm-specification.utils';

describe('sammSpecificationUrl', () => {
  it('should build a version specific page url', () => {
    expect(sammSpecificationUrl('2.2.0', 'meta-model-elements.html')).toBe(
      'https://eclipse-esmf.github.io/samm-specification/2.2.0/meta-model-elements.html',
    );
  });

  it('should default to the index page', () => {
    expect(sammSpecificationUrl('2.1.0')).toBe('https://eclipse-esmf.github.io/samm-specification/2.1.0/index.html');
  });
});
