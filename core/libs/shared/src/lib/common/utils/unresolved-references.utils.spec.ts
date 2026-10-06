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
import {unresolvedElementsOf} from './unresolved-references.utils';

describe('unresolvedElementsOf', () => {
  const urn = 'urn:samm:org.example:1.0.0#missing';

  it('reads the raw error body of the backend', () => {
    expect(unresolvedElementsOf({status: 409, error: {error: {message: 'x', unresolvedElements: [urn]}}})).toEqual([urn]);
  });

  it('reads an error body the API layer already unwrapped', () => {
    expect(unresolvedElementsOf({status: 409, error: {message: 'x', unresolvedElements: [urn]}})).toEqual([urn]);
  });

  it.each([
    ['no error', undefined],
    ['a plain text body', {error: 'File does not exist'}],
    ['other errors', {error: {error: {message: 'syntax error'}}}],
    ['a malformed list', {error: {unresolvedElements: 'not a list'}}],
  ])('returns an empty list for %s', (_, error) => {
    expect(unresolvedElementsOf(error)).toEqual([]);
  });
});
