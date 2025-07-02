/*
 * Copyright (c) 2025 Robert Bosch Manufacturing Solutions GmbH
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
  constructor(...items: T[]) {
    super();
    this.push(...items);
  }

  override push(...items: T[]): number {
    let pushedItems = 0;
    for (const item of items) {
      if (this.some(e => e.aspectModelUrn === item.aspectModelUrn)) {
        continue;
      }

      pushedItems += super.push(item);
    }
    return pushedItems;
  }

  append(items: T[]): ElementSet<T> {
    const set = new ElementSet<T>();
    for (let i = 0; i < this.length; i++) {
      set.push(this.at(i));
    }

    for (const item of items || []) {
      set.push(item);
    }

    return set;
  }
}
