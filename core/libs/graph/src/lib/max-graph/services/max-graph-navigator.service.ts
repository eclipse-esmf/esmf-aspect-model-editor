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
import {FullTextSearchIndex, FullTextSearchResult, SearchField} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {MaxGraphHelper} from '../helpers/max-graph-helper';
import {MaxGraphService} from './max-graph.service';

export function namedElementSearchFields(element: NamedElement): SearchField[] {
  const fields: SearchField[] = [{key: 'name', value: element.name}];
  element.getPreferredNames?.()?.forEach((value, lang) => fields.push({key: 'preferredName', value, lang}));
  element.getDescriptions?.()?.forEach((value, lang) => fields.push({key: 'description', value, lang}));
  if (element.aspectModelUrn) {
    fields.push({key: 'urn', value: element.aspectModelUrn});
  }
  return fields;
}

/** maxGraph based implementation of the {@link GraphNavigatorPort} port. */
@Injectable({providedIn: 'root'})
export class MaxGraphNavigatorService extends GraphNavigatorPort {
  private readonly maxGraphService = inject(MaxGraphService);

  readonly isModelEmpty = this.maxGraphService.isModelEmpty;
  readonly graphVersion = this.maxGraphService.graphVersion;
  readonly graphInitialized$ = this.maxGraphService.graphInitialized$;

  hasElements(): boolean {
    return !!this.maxGraphService.getAllCells()?.length;
  }

  searchElements(query: string): NamedElement[] {
    return this.searchElementsWithDetails(query).map(result => result.item);
  }

  searchElementsWithDetails(query: string): FullTextSearchResult<NamedElement>[] {
    // The index is cheap to build (a few ms for thousands of elements) and always reflects the latest names and descriptions.
    const elements = [...new Set(this.getVisibleModelElements())];
    return new FullTextSearchIndex(elements, namedElementSearchFields).search(query);
  }

  isElementRendered(element: NamedElement): boolean {
    return !!this.maxGraphService.resolveCellByModelElement(element);
  }

  getVisibleModelElements(): NamedElement[] {
    const graph = this.maxGraphService.graph;
    if (!graph) {
      return [];
    }
    return (graph.getChildVertices(graph.getDefaultParent()) || []).map(cell => MaxGraphHelper.getModelElement(cell)).filter(Boolean);
  }

  navigateToElement(aspectModelUrn: string): boolean {
    return !!this.maxGraphService.navigateToCellByUrn(aspectModelUrn);
  }

  setScrollPosition(event: Event): void {
    this.maxGraphService.setScrollPosition(event);
  }
}
