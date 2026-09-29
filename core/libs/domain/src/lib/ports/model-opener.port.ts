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

import {Observable} from 'rxjs';

export interface OpenModelOptions {
  file: string;
  namespace: string;
  aspectModelUrn?: string;
  editElementUrn?: string;
}

export interface PromptUploadOptions {
  fileName: string;
  namespace: string;
  modelContent: string;
}

export abstract class ModelOpenerPort {
  abstract promptAndOpen(options: OpenModelOptions): Observable<any>;
  abstract openInCurrentWindow(options: OpenModelOptions): Observable<boolean>;
  abstract openInNewTab(options: OpenModelOptions): Observable<boolean>;
  abstract openInNewWindow(options: OpenModelOptions): void;
  abstract checkUnsavedChanges(): Observable<boolean>;
}
