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

import {LoadedFilesService} from '@ame/infrastructure';
import {computed, inject, Injectable, signal} from '@angular/core';

export class FileStatus {
  public loaded = false;
  public outdated = false;
  public errored = false;
  public isLoadedInWorkspace = false;
  public sammVersion = '';
  public dependencies: string[] = [];
  public missingDependencies: string[] = [];
  public aspectModelUrn = '';

  constructor(public name: string) {}
}

@Injectable({providedIn: 'root'})
export class WorkspaceNamespacesService {
  private loadedFilesService = inject(LoadedFilesService);
  readonly namespaces = signal<Record<string, FileStatus[]>>({});
  readonly hasOutdatedFiles = signal(false);
  readonly namespacesKeys = computed(() => Object.keys(this.namespaces()));

  get currentFile() {
    return this.loadedFilesService?.currentLoadedFile;
  }

  setFile(namespace: string, fileStatus: FileStatus) {
    this.namespaces.update(map => {
      const arr = map[namespace] ? [...map[namespace], fileStatus] : [fileStatus];
      return {...map, [namespace]: arr};
    });
    return fileStatus;
  }

  getFile(namespace: string, file: string): FileStatus | undefined {
    return this.namespaces()[namespace]?.find(fs => fs.name === file);
  }

  removeFile(namespace: string, file: string) {
    this.namespaces.update(map => {
      const list = map[namespace];
      if (!list) return map;
      const filtered = list.filter(fs => fs.name !== file);
      if (filtered.length === 0) {
        const {[namespace]: _, ...rest} = map;
        return rest;
      }
      return {...map, [namespace]: filtered};
    });
  }

  clear() {
    this.namespaces.set({});
  }
}
