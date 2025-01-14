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

import {Injectable} from '@angular/core';
import Fuse from 'fuse.js';

@Injectable({providedIn: 'root'})
export class SearchService {
  /**
   * This method uses Fuse.js to search for the needed value into a list of elements.
   * The list of elements and search options are provided by fuse searcher.
   */
  searchByValue<T>(value: string, searcher: Fuse<T>): T[] {
    return searcher.search(this.adaptForSpecialSearch(value)).map(entry => entry.item);
  }

  /**
   * In order to search for a value, the list on elements and
   * the configuration about how the search should be executed, are needed.
   */
  createSearcher<T>(list: T[], options: Fuse.IFuseOptions<T>) {
    return new Fuse(list, options);
  }

  /**
   * This method will instantiate Fuse for every search because
   *  the list of elements may change form one search to another.
   */
  search<T>(value: string, list: T[], options: Fuse.IFuseOptions<any>) {
    return value ? new Fuse(list, options).search(this.adaptForSpecialSearch(value)).map(entry => entry.item) : list;
  }

  /**
   * Fuse.js uses ' to search for items that includes the value, but we want to do this using *.
   */
  private adaptForSpecialSearch(value: string) {
    const fuseInlineSearchToken = "'"; // prettier-ignore

    if (value?.startsWith(fuseInlineSearchToken)) {
      return '';
    }

    if (value?.startsWith('*')) {
      return value.replace(/\*/g, fuseInlineSearchToken);
    }

    return value;
  }
}
