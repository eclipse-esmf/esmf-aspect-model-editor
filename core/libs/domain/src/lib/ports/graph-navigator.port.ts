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

import {FullTextSearchResult} from '@ame/shared';
import {Signal} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Observable} from 'rxjs';

/**
 * Port for features that need to inspect or navigate the rendered model graph
 * without depending on the concrete graph implementation.
 * Implemented in the graph layer and bound in provideAmeGraph().
 */
export abstract class GraphNavigatorPort {
  /** True when no model element is rendered. */
  abstract readonly isModelEmpty: Signal<boolean>;
  /** Increments whenever cells are added or removed. */
  abstract readonly graphVersion: Signal<number>;
  /** Emits true once the graph has been initialized. */
  abstract readonly graphInitialized$: Observable<boolean>;

  abstract hasElements(): boolean;
  abstract searchElements(query: string): NamedElement[];
  /** Full text search over name, preferredName and description (all languages) of the rendered elements. */
  abstract searchElementsWithDetails(query: string): FullTextSearchResult<NamedElement>[];
  abstract isElementRendered(element: NamedElement): boolean;
  /** Model elements currently rendered as top-level vertices. */
  abstract getVisibleModelElements(): NamedElement[];
  abstract navigateToElement(aspectModelUrn: string): boolean;
  abstract setScrollPosition(event: Event): void;
}
