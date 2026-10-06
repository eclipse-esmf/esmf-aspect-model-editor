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
import {DefaultAspect} from '../aspect-meta-model/default-aspect';
import {DefaultProperty} from '../aspect-meta-model/default-property';
import {DefaultAspectModelVisitor} from './default-aspect-model-visitor';

describe('DefaultAspectModelVisitor', () => {
  it('should traverse model hierarchy without throwing', () => {
    const prop = new DefaultProperty({
      aspectModelUrn: 'urn:test#prop',
      name: 'prop',
      metaModelVersion: '2.0.0',
    });

    const aspect = new DefaultAspect({
      aspectModelUrn: 'urn:test#Aspect',
      name: 'Aspect',
      metaModelVersion: '2.0.0',
      properties: [prop],
      operations: [],
      events: [],
    });

    const visitor = new DefaultAspectModelVisitor();
    expect(() => visitor.visit(aspect, null)).not.toThrow();
  });
});
