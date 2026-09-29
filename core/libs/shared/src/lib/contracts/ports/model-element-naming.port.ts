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

import {Injectable} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {Observable, of} from 'rxjs';

/** Defaults to an identity implementation when no naming service is bound. */
@Injectable({
  providedIn: 'root',
  useFactory: (): ModelElementNamingPort => ({
    resolveMetaModelElement: el => el,
    resolveMetaModelElement$: el => of(el),
    resolveElementNaming: el => el,
  }),
})
export abstract class ModelElementNamingPort {
  abstract resolveMetaModelElement<T extends NamedElement>(element: T, cached?: boolean, visited?: Set<NamedElement>): T;
  abstract resolveMetaModelElement$<T extends NamedElement>(element: T, cached?: boolean, visited?: Set<NamedElement>): Observable<T>;
  abstract resolveElementNaming<T extends NamedElement>(element: T, parentName?: string): T;
}
