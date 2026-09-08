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
import {RdfModelUtil} from '@ame/rdf/utils';
import {computed, effect, inject, Injectable, signal} from '@angular/core';

class SidebarState {
  readonly opened = signal(false);
  readonly isOpened = computed(() => this.opened());

  close() {
    this.opened.set(false);
  }
  open() {
    this.opened.set(true);
  }
  toggle() {
    this.opened.update(v => !v);
  }
}

class SidebarStateWithRefresh extends SidebarState {
  readonly refreshTick = signal(0);

  refresh() {
    this.refreshTick.update(n => (n + 1) % 10);
  }
}

export interface SelectionData {
  namespace: string;
  file: string;
  aspectModelUrn: string;
}

export class Selection {
  readonly selection = signal<SelectionData | null>(null);

  public namespace: string | null = null;
  public file: string | null = null;

  constructor(namespace?: string, file?: string) {
    if (namespace) this.namespace = namespace;
    if (file) this.file = file;
  }

  select(namespace: string, file: FileStatus) {
    if (namespace && file) {
      this.namespace = namespace;
      this.file = file.name;
      this.selection.set({namespace, file: file.name, aspectModelUrn: file.aspectModelUrn});
    }
  }

  reset() {
    this.namespace = null;
    this.file = null;
    this.selection.set(null);
  }

  isSelected(namespace?: string, file?: string) {
    return !!namespace && !!file && this.namespace === namespace && this.file === file;
  }
}

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

export class NamespacesManager {
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

@Injectable({providedIn: 'root'})
export class SidebarStateService {
  private loadedFilesService = inject(LoadedFilesService);

  public sammElements = new SidebarState();
  public workspace = new SidebarStateWithRefresh();
  public fileElements = new SidebarState();
  public selection = new Selection();
  public namespacesState = new NamespacesManager();

  constructor() {
    this.manageSidebars();
  }

  public isCurrentFileLoaded(): boolean {
    return !!this.loadedFilesService?.currentLoadedFile;
  }

  public isCurrentFile(namespace?: string, fileName?: string): boolean {
    if (this.isCurrentFileLoaded()) {
      const current = this.loadedFilesService.currentLoadedFile;
      return current?.namespace === namespace && current?.name === fileName;
    }

    return false;
  }

  updateWorkspace(fileStatus: FileStatus[] = []) {
    for (const status of fileStatus) {
      status.isLoadedInWorkspace = true;
      const chunks = RdfModelUtil.splitAspectModelUrnIntoChunks(status.aspectModelUrn);
      const namespace = chunks[2];
      const version = chunks[3];
      this.namespacesState.setFile(`${namespace}:${version}`, status);
    }

    const allNamespaces = this.namespacesState.namespaces();
    const hasOutdated = Object.values(allNamespaces).some(files => files.some(f => f.outdated));
    this.namespacesState.hasOutdatedFiles.set(hasOutdated);
    return allNamespaces;
  }

  private manageSidebars() {
    effect(() => {
      if (this.sammElements.isOpened()) {
        this.workspace.close();
        this.fileElements.close();
      }
    });

    effect(() => {
      if (this.workspace.isOpened()) {
        this.sammElements.close();
      } else {
        this.fileElements.close();
      }
    });

    effect(() => {
      const opened = this.fileElements.isOpened();
      if (!opened) this.selection.reset();
    });

    effect(() => {
      const sel = this.selection.selection();
      if (sel) this.fileElements.open();
    });
  }
}
