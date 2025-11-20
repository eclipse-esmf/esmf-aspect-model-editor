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
import {RdfModelUtil} from '@ame/rdf/utils';
import {BrowserService, ElectronSignals, ElectronSignalsService} from '@ame/shared';
import {DestroyRef, Injectable, computed, effect, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subscription, of} from 'rxjs';
import {environment} from '../../../../environments/environment';

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

class Selection {
  readonly selection = signal<{namespace: string; file: string; aspectModelUrn: string} | null>(null);

  constructor(
    public namespace?: string,
    public file?: string,
  ) {}

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
  isSelected(namespace: string, file: string) {
    return this.namespace === namespace && this.file === file;
  }
}

export class FileStatus {
  public locked: boolean;
  public loaded: boolean;
  public outdated: boolean;
  public errored: boolean;
  public sammVersion: string;
  public dependencies: string[];
  public missingDependencies: string[];
  public aspectModelUrn: string;

  constructor(public name: string) {}
}

export class NamespacesManager {
  private loadedFilesService = inject(LoadedFilesService);
  readonly namespaces = signal<{[key: string]: FileStatus[]}>({});
  readonly hasOutdatedFiles = signal(false);
  readonly namespacesKeys = computed(() => Object.keys(this.namespaces()));

  get currentFile() {
    return this.loadedFilesService.currentLoadedFile;
  }

  setFile(namespace: string, fileStatus: FileStatus) {
    this.namespaces.update(map => {
      const arr = map[namespace] ? [...map[namespace], fileStatus] : [fileStatus];
      return {...map, [namespace]: arr};
    });
    return fileStatus;
  }

  getFile(namespace: string, file: string) {
    return this.namespaces()[namespace]?.find(fs => fs.name === file);
  }

  lockFiles(files: {namespace: string; file: string}[]) {
    const current = this.currentFile?.name;
    this.namespaces.update(map => {
      const next: typeof map = {};
      for (const ns of Object.keys(map)) {
        next[ns] = map[ns].map(fs =>
          fs.name !== current ? {...fs, locked: files.some(f => f.namespace === ns && f.file === fs.name)} : fs,
        );
      }
      return next;
    });
  }

  clear() {
    this.namespaces.set({});
  }
}

@Injectable({providedIn: 'root'})
export class SidebarStateService {
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);
  private loadedFilesService = inject(LoadedFilesService);
  private destroyRef = inject(DestroyRef);
  private browserService = inject(BrowserService);

  public sammElements = new SidebarState();
  public workspace = new SidebarStateWithRefresh();
  public fileElements = new SidebarState();
  public selection = new Selection();
  public namespacesState = new NamespacesManager();

  constructor() {
    this.manageSidebars();
    requestAnimationFrame(() => {
      this.getLockedFiles();
    });
  }

  public isCurrentFileLoaded(): boolean {
    return !!this.loadedFilesService.currentLoadedFile;
  }

  public isCurrentFile(namespace: string, fileName: string): boolean {
    if (this.isCurrentFileLoaded()) {
      const {namespace: currentNamespace, name} = this.loadedFilesService.currentLoadedFile;
      return currentNamespace === namespace && name === fileName;
    }

    return false;
  }

  updateWorkspace(files: Record<string, FileStatus>) {
    this.namespacesState.clear();
    let hasOutdated = false;
    for (const absolute of Object.keys(files)) {
      const fs = files[absolute];
      const [namespace, version] = RdfModelUtil.splitRdfIntoChunks(absolute);
      this.namespacesState.setFile(`${namespace}:${version}`, fs);
      hasOutdated ||= fs.outdated;
    }
    this.namespacesState.hasOutdatedFiles.set(hasOutdated);
    this.getLockedFiles(true);
    return this.namespacesState.namespaces();
  }

  private getLockedFiles(takeOne?: boolean) {
    if (!environment.production && window.location.search.includes('?e2e=true')) {
      return of({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }

    if (this.browserService.isStartedAsElectronApp() || (window as any).require) {
      return this.electronSignalsService
        .call('lockedFiles')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(files => {
          this.namespacesState.lockFiles(files);
          if (takeOne) this.destroyRef;
        });
    }

    return new Subscription();
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
