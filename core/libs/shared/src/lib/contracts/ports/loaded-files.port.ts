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

import {CacheStrategy, NamedElement} from '@esmf/aspect-model-loader';

/** Minimal view of the currently loaded model file needed by shared helpers. */
export interface LoadedFileView {
  readonly namespace: string;
  readonly cachedFile: CacheStrategy;
}

/** Read access to the model files loaded in the editor session (implemented by domain LoadedFilesService). */
export abstract class LoadedFilesPort {
  abstract readonly currentLoadedFile: LoadedFileView | null;
  abstract isElementExtern(element: NamedElement): boolean;
  abstract getElement<T extends NamedElement>(aspectModelUrn: string): T | null;
}
