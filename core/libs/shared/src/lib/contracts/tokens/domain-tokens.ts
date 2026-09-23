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

import {InjectionToken} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {BehaviorSubject, Observable} from 'rxjs';

export enum ModelFilter {
  DEFAULT = 'default',
  PROPERTIES = 'properties',
}

export interface IElementModelService {
  deleteElement(cell: any): void;
  updateElement(cell: any, form: {[key: string]: any}): void;
  collectParentAnonymousChildKeys?(element: NamedElement): string[];
}

export const ELEMENT_MODEL_SERVICE = new InjectionToken<IElementModelService>('ELEMENT_MODEL_SERVICE', {
  providedIn: 'root',
  factory: () => ({
    deleteElement: () => {},
    updateElement: () => {},
    collectParentAnonymousChildKeys: () => [],
  }),
});

export interface IFiltersService {
  selectDefaultFilter(): void;
  selectPropertiesFilter(): void;
  filter(elements: NamedElement[]): any[];
  createNode<T extends NamedElement = NamedElement>(element: T, options?: any): any;
  updateNodeInfo<T extends NamedElement = NamedElement>(node: any, options?: any): any;
  updateNodeTree<T extends NamedElement = NamedElement>(node: any, options?: any): any;
  renderByFilter(filter: any): void;
  currentFilter?: any;
}

export const FILTERS_SERVICE = new InjectionToken<IFiltersService>('FILTERS_SERVICE', {
  providedIn: 'root',
  factory: () => ({
    selectDefaultFilter: () => {},
    selectPropertiesFilter: () => {},
    filter: () => [],
    createNode: (el: any) => el,
    updateNodeInfo: (n: any) => n,
    updateNodeTree: (n: any) => n,
    renderByFilter: () => {},
    currentFilter: null,
  }),
});

export interface IFilterAttributesService {
  isFiltering: boolean;
  activeFilter: any;
  activeFilter$: Observable<any>;
}

export const FILTER_ATTRIBUTES = new InjectionToken<IFilterAttributesService>('FILTER_ATTRIBUTES', {
  providedIn: 'root',
  factory: () => {
    let activeFilter: any = ModelFilter.DEFAULT;
    const activeFilterSubject$ = new BehaviorSubject<any>(ModelFilter.DEFAULT);
    return {
      isFiltering: false,
      get activeFilter() {
        return activeFilter;
      },
      set activeFilter(filter: any) {
        activeFilter = filter;
        activeFilterSubject$.next(filter);
      },
      get activeFilter$() {
        return activeFilterSubject$.asObservable();
      },
    };
  },
});
