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

import {NamedElement} from '../aspect-meta-model';

export interface IElementsSet<T extends NamedElement = NamedElement> extends Array<T> {
  append(items: T[]): IElementsSet<T>;
  filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): IElementsSet<S>;
}

export class ElementSet<T extends NamedElement = NamedElement> extends Array<T> {
  static override get [Symbol.species]() {
    return Array;
  }

  constructor(...items: (T | number)[]) {
    super();
    if (items.length === 1 && typeof items[0] === 'number') {
      return;
    }
    this.push(...(items.filter(item => typeof item !== 'number') as T[]));
  }

  override push(...items: T[]): number {
    for (const item of items) {
      if (this.some(e => e.aspectModelUrn === item.aspectModelUrn)) {
        continue;
      }

      super.push(item);
    }
    return this.length;
  }

  append(items: T[]): ElementSet<T> {
    const set = new ElementSet<T>();
    for (let i = 0; i < this.length; i++) {
      set.push(this[i]);
    }

    for (const item of items || []) {
      set.push(item);
    }

    return set;
  }
}
