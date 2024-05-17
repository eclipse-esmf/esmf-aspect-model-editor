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

import {Pipe, PipeTransform} from '@angular/core';

/**
 * The pipe is intended for displaying an element's counter next to its original value
 */
@Pipe({
  name: 'counter',
  standalone: true
})
export class CounterPipe implements PipeTransform {
  transform(value: string, counter: number | string): string {
    return !value ? value : `${value} (${counter || 0})`;
  }
}
