/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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
import {Injectable} from '@angular/core';
import {Store} from 'n3';

@Injectable()
export class CleanupVisitor {
  private get store(): Store {
    return this.loadedFiles.currentLoadedFile?.rdfModel?.store;
  }

  constructor(private loadedFiles: LoadedFilesService) {}

  removeStoreElements() {
    this.store.removeQuads(this.store.getQuads(null, null, null, null));
  }
}
