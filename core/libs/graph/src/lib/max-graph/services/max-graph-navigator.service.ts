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

import {GraphNavigatorPort} from '@ame/domain';
import {mxCellSearchOption, SearchService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MaxGraphHelper} from '../helpers/max-graph-helper';
import {MaxGraphService} from './max-graph.service';

/** maxGraph based implementation of the {@link GraphNavigatorPort} port. */
@Injectable({providedIn: 'root'})
export class MaxGraphNavigatorService extends GraphNavigatorPort {
  private readonly maxGraphService = inject(MaxGraphService);
  private readonly searchService = inject(SearchService);

  readonly isModelEmpty = this.maxGraphService.isModelEmpty;
  readonly graphVersion = this.maxGraphService.graphVersion;
  readonly graphInitialized$ = this.maxGraphService.graphInitialized$;

  hasElements(): boolean {
    return !!this.maxGraphService.getAllCells()?.length;
  }

  searchElements(query: string): NamedElement[] {
    return (
      this.searchService
        .search<Cell>(query, this.maxGraphService.getAllCells(), mxCellSearchOption)
        ?.map(cell => MaxGraphHelper.getModelElement(cell)) ?? []
    );
  }

  isElementRendered(element: NamedElement): boolean {
    return !!this.maxGraphService.resolveCellByModelElement(element);
  }

  navigateToElement(aspectModelUrn: string): boolean {
    return !!this.maxGraphService.navigateToCellByUrn(aspectModelUrn);
  }

  setScrollPosition(event: Event): void {
    this.maxGraphService.setScrollPosition(event);
  }
}
