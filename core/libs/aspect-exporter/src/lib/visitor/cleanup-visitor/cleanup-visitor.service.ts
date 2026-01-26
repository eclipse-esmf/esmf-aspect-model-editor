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

import {LoadedFilesService} from '@ame/cache';
import {inject, Injectable} from '@angular/core';
import {Store} from 'n3';

@Injectable({providedIn: 'root'})
export class CleanupVisitor {
  public loadedFilesService = inject(LoadedFilesService);

  private get store(): Store {
    return this.loadedFilesService.currentLoadedFile?.rdfModel?.store;
  }

  removeStoreElements() {
    this.store.removeQuads(this.store.getQuads(null, null, null, null));
  }
}
