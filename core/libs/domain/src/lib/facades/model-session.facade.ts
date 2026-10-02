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

import {inject, Injectable, Signal} from '@angular/core';
import {NamedElement} from '@esmf/aspect-model-loader';
import {LoadedFilesService, NamespaceFile} from '../model-session';

/** Feature-facing access to the aspect model files currently loaded in the editor session. */
@Injectable({providedIn: 'root'})
export class ModelSessionFacade {
  private readonly loadedFiles = inject(LoadedFilesService);

  readonly currentLoadedFileSignal: Signal<NamespaceFile | null> = this.loadedFiles.currentLoadedFileSignal;
  readonly hasAspect: Signal<boolean> = this.loadedFiles.hasAspect;

  get currentLoadedFile(): NamespaceFile | null {
    return this.loadedFiles.currentLoadedFile;
  }

  getFile(absoluteName: string): NamespaceFile | undefined {
    return this.loadedFiles.getFile(absoluteName);
  }

  removeFile(absoluteName: string): void {
    this.loadedFiles.removeFile(absoluteName);
  }

  updateAbsoluteName(oldAbsoluteName: string, newAbsoluteName: string, rewriteOriginal = false): void {
    this.loadedFiles.updateAbsoluteName(oldAbsoluteName, newAbsoluteName, rewriteOriginal);
  }

  isElementExtern(element: NamedElement): boolean {
    return this.loadedFiles.isElementExtern(element);
  }

  getFileFromElement(element: NamedElement): string | null {
    return this.loadedFiles.getFileFromElement(element);
  }
}
