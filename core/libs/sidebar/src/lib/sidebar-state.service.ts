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

import {FileStatus, UiShellStore, WorkspaceNamespacesService, WorkspaceStore} from '@ame/domain';
import {LoadedFilesService, RdfModelUtil} from '@ame/infrastructure';
import {computed, effect, inject, Injectable, signal, untracked} from '@angular/core';

export {FileStatus};

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

@Injectable({providedIn: 'root'})
export class SidebarStateService {
  private loadedFilesService = inject(LoadedFilesService);
  public readonly uiShellStore = inject(UiShellStore);
  public readonly workspaceStore = inject(WorkspaceStore);

  public sammElements = new SidebarState();
  public workspace = new SidebarStateWithRefresh();
  public fileElements = new SidebarState();
  public selection = new Selection();
  public namespacesState = inject(WorkspaceNamespacesService);

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

    // Sync into WorkspaceStore
    const items = Object.entries(allNamespaces).flatMap(([ns, files]) =>
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
    );
    this.workspaceStore.setFiles(items);

    return allNamespaces;
  }

  private manageSidebars() {
    effect(() => {
      if (this.sammElements.isOpened()) {
        this.workspace.close();
        this.fileElements.close();
        this.uiShellStore.openSidebar('sammElements');
      }
    });

    effect(() => {
      if (this.workspace.isOpened()) {
        this.sammElements.close();
        this.uiShellStore.openSidebar('workspace');
      } else {
        this.fileElements.close();
        if (!this.sammElements.isOpened()) {
          this.uiShellStore.closeSidebar();
        }
      }
    });

    effect(() => {
      const opened = this.fileElements.isOpened();
      if (!opened) {
        this.selection.reset();
        this.workspaceStore.selectFile(null);
      }
    });

    effect(() => {
      const sel = this.selection.selection();
      if (sel) {
        this.fileElements.open();
        this.uiShellStore.openSidebar('fileElements');
        this.workspaceStore.selectFile(sel);
      }
    });

    // UiShellStore is the source of truth for other features (e.g. editor) to open/close sidebars.
    effect(() => {
      const open = this.uiShellStore.sidebarOpen();
      const tab = this.uiShellStore.activeSidebarTab();
      untracked(() => {
        if (!open || tab === null) {
          if (this.sammElements.opened()) this.sammElements.close();
          if (this.workspace.opened()) this.workspace.close();
        } else if (tab === 'sammElements' && !this.sammElements.opened()) {
          this.sammElements.open();
        } else if ((tab === 'workspace' || tab === 'fileElements') && !this.workspace.opened()) {
          this.workspace.open();
        }
      });
    });
  }
}
