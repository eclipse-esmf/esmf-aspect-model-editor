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

import {InjectionToken} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {ModelFilter} from './models';

export const FILTER_ATTRIBUTES_TOKEN = 'FILTER_ATTRIBUTES_TOKEN';
export interface FilterAttributesService {
  isFiltering: boolean;
  activeFilter: ModelFilter;
  activeFilter$: Observable<ModelFilter>;
}

class FilterAttributes implements FilterAttributesService {
  #activeFilter = ModelFilter.DEFAULT;
  private activeFilterSubject$ = new BehaviorSubject<ModelFilter>(ModelFilter.DEFAULT);

  public isFiltering = false;

  public set activeFilter(filter: ModelFilter) {
    this.#activeFilter = filter;
    this.activeFilterSubject$.next(filter);
  }

  public get activeFilter() {
    return this.#activeFilter;
  }

  public get activeFilter$() {
    return this.activeFilterSubject$.asObservable();
  }
}

export const FILTER_ATTRIBUTES = new InjectionToken<FilterAttributesService>(FILTER_ATTRIBUTES_TOKEN, {
  providedIn: 'root',
  factory: () => new FilterAttributes(),
});
