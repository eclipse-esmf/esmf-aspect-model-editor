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

import {CounterPipe} from './counter.pipe';

const falsyValues = [null, '', undefined, 0, NaN];

describe('CounterPipe', () => {
  let pipe: CounterPipe;

  beforeEach(() => (pipe = new CounterPipe()));

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should attach a counter to the value', () => {
    const value = 'VALUE';
    const counter = 1;
    const expectation = 'VALUE (1)';

    const result = pipe.transform(value, counter);

    expect(result).toEqual(expectation);
  });

  it('should attach "0" for falsy counter values', () => {
    const value = 'VALUE';
    const expectation = 'VALUE (0)';

    falsyValues.forEach(falsyValue => {
      const result = pipe.transform(value, falsyValue);
      expect(result).toEqual(expectation);
    });
  });

  it('should return falsy values "as is", without a counter', () => {
    const counter = 1;

    falsyValues.forEach(falsyValue => {
      const result = pipe.transform(falsyValue as any, counter);
      expect(result).toEqual(falsyValue);
    });
  });
});
