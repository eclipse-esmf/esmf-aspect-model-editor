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

export abstract class LoadedFilesPort {
  abstract currentLoadedFile?: {
    namespace: string;
    cachedFile?: {
      resolveInstance: (element: any) => any;
      updateElementKey?: (element: any, oldUrn: string) => void;
      removeElement?: (element: any) => void;
      [key: string]: any;
    };
    [key: string]: any;
  };
  abstract isElementExtern?: (element: any) => boolean;
  abstract isElementInCurrentFile?: (element: any) => boolean;
  abstract getElement?: (urn: string) => any;
  [key: string]: any;
}
