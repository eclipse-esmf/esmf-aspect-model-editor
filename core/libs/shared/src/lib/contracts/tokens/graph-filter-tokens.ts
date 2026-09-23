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

export interface IGraphFilterRenderer {
  renderFilteredTree(filteredElements: any[], filter: any, selectedModelElement: any): void;
  getSelectedModelElement(): any;
}

export const GRAPH_FILTER_RENDERER = new InjectionToken<IGraphFilterRenderer>('GRAPH_FILTER_RENDERER');
