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

import {RdfNamingUtil} from '@ame/shared';
import {computed, inject, Injectable, signal} from '@angular/core';
import {LoadedFilesService} from '../../model-session';
import {WorkspaceStore} from './workspace.store';

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
  private workspaceStore = inject(WorkspaceStore);
  readonly namespaces = signal<Record<string, FileStatus[]>>({});
  readonly hasOutdatedFiles = signal(false);
  readonly namespacesKeys = computed(() => Object.keys(this.namespaces()));

  get currentFile() {
    return this.loadedFilesService?.currentLoadedFile;
  }

  setFile(namespace: string, fileStatus: FileStatus) {
    this.namespaces.update(map => {
      // Upsert by file name: repeated workspace validations must not duplicate entries.
      const existing = map[namespace] ?? [];
      const index = existing.findIndex(fs => fs.name === fileStatus.name);
      const arr = index === -1 ? [...existing, fileStatus] : existing.map((fs, i) => (i === index ? fileStatus : fs));
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

  /** Merges validated file statuses into the namespace map and syncs the WorkspaceStore. */
  applyFileStatuses(fileStatus: FileStatus[] = []): Record<string, FileStatus[]> {
    for (const status of fileStatus) {
      status.isLoadedInWorkspace = true;
      const chunks = RdfNamingUtil.splitAspectModelUrnIntoChunks(status.aspectModelUrn);
      this.setFile(`${chunks[2]}:${chunks[3]}`, status);
    }

    const allNamespaces = this.namespaces();
    this.hasOutdatedFiles.set(Object.values(allNamespaces).some(files => files.some(f => f.outdated)));

    this.workspaceStore.setFiles(
      Object.entries(allNamespaces).flatMap(([ns, files]) =>
        files.map(f => ({
          id: `${ns}:${f.name}`,
          name: f.name,
          namespace: ns,
          aspectModelUrn: f.aspectModelUrn,
          loaded: f.loaded,
          outdated: f.outdated,
          errored: f.errored,
          isLoadedInWorkspace: f.isLoadedInWorkspace,
          sammVersion: f.sammVersion,
          dependencies: f.dependencies,
          missingDependencies: f.missingDependencies,
        })),
      ),
    );

    return allNamespaces;
  }
}
