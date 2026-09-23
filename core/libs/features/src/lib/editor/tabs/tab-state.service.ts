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

import {MaxGraphService} from '@ame/graph';
import {LoadedFilesService, NamespaceFile} from '@ame/infrastructure';
import {BrowserService, TauriSignals, TauriSignalsService, TitleService} from '@ame/shared';
import {computed, DestroyRef, effect, inject, Injectable, Injector, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime, filter, first, map, Observable, of, switchMap, tap} from 'rxjs';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelRendererService} from '../model-renderer.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {SaveModelDialogService} from '../save-model-dialog/save-model-dialog.service';
import {EditorTab} from './tab.model';

@Injectable({providedIn: 'root'})
export class TabStateService {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly modelSavingTracker = inject(ModelSavingTrackerService);
  private readonly titleService = inject(TitleService);
  private readonly browserService = inject(BrowserService);
  private readonly tauriSignalsService: TauriSignals = inject(TauriSignalsService);
  private readonly saveModelDialog = inject(SaveModelDialogService);

  private get maxGraphService(): MaxGraphService {
    return this.injector.get(MaxGraphService);
  }

  private get modelRenderer(): ModelRendererService {
    return this.injector.get(ModelRendererService);
  }

  private get fileHandlingService(): FileHandlingService {
    return this.injector.get(FileHandlingService);
  }

  public readonly tabs = signal<EditorTab[]>([]);
  public readonly activeTabId = signal<string | null>(null);

  public readonly activeTab = computed<EditorTab | null>(() => {
    const activeId = this.activeTabId();
    if (!activeId) return null;
    return this.tabs().find(t => t.id === activeId) ?? null;
  });

  public readonly hasMultipleTabs = computed<boolean>(() => this.tabs().length > 1);

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any)['angular.TabStateService'] = this;
    }

    this.initDirtyTracker();

    effect(() => {
      const absoluteName = this.titleService.activeAbsoluteName();
      if (!absoluteName) return;
      const activeId = this.activeTabId();
      if (!activeId || activeId === absoluteName) return;

      this.tabs.update(currentTabs => {
        const activeIndex = currentTabs.findIndex(t => t.id === activeId);
        if (activeIndex >= 0) {
          const updated = [...currentTabs];
          const parts = absoluteName.split(':');
          const file = parts.pop() || '';
          const namespace = parts.join(':');
          updated[activeIndex] = {
            ...updated[activeIndex],
            id: absoluteName,
            file,
            namespace,
          };
          return updated;
        }
        return currentTabs;
      });
      this.activeTabId.set(absoluteName);
    });
  }

  private initDirtyTracker(): void {
    this.maxGraphService.graphModelChanged$
      .pipe(
        debounceTime(200),
        switchMap(() => this.modelSavingTracker.isSaved$),
        tap(isSaved => {
          const activeId = this.activeTabId();
          if (activeId) {
            this.setTabDirty(activeId, !isSaved);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  /**
   * Returns true if the active tab is an untouched, clean empty model (new-model.ttl with no aspect, not dirty).
   */
  public isActiveTabCleanEmpty(): boolean {
    const active = this.activeTab();
    if (!active) return true;

    if (active.isDirty) return false;
    if (active.aspectModelUrn) return false;
    if (this.loadedFilesService.hasAspect()) return false;
    if (!active.file.includes('new-model')) return false;

    return true;
  }

  /**
   * Called when a model is rendered/loaded into the editor.
   */
  public onModelLoaded(file: NamespaceFile, fromWorkspace = false, editElementUrn?: string): void {
    if (!file) return;

    let absoluteName = file.absoluteName || `${file.namespace}:${file.name}`;
    const snapshot = this.loadedFilesService.getSnapshot();
    const baseline = this.modelSavingTracker.getSavedModel();

    this.tabs.update(currentTabs => {
      // If we are loading an empty new-model and a new-model tab already exists, assign a unique name/id
      if (absoluteName.includes('new-model') && currentTabs.some(t => t.id === absoluteName)) {
        let counter = 2;
        while (currentTabs.some(t => t.id === `${file.namespace}:new-model-${counter}.ttl`)) {
          counter++;
        }
        absoluteName = `${file.namespace}:new-model-${counter}.ttl`;
      }

      const existingIndex = currentTabs.findIndex(t => t.id === absoluteName);

      const tabData: EditorTab = {
        id: absoluteName,
        file: absoluteName.split(':').pop() || file.name,
        namespace: file.namespace,
        aspectModelUrn: file.aspect?.aspectModelUrn || file.originalAspectModelUrn,
        editElementUrn,
        fromWorkspace,
        savedModelBaseline: baseline,
        filesSnapshot: snapshot,
        isDirty: false,
      };

      // If active tab or single tab is a clean empty new-model tab and we are loading a real model, replace the empty tab
      const currentActiveId = this.activeTabId();
      let replaceIndex = currentTabs.findIndex(t => t.id === currentActiveId);
      if (replaceIndex < 0 && currentTabs.length === 1) {
        replaceIndex = 0;
      }

      const isCleanEmptyToReplace =
        replaceIndex >= 0 &&
        currentTabs[replaceIndex].file.includes('new-model') &&
        !currentTabs[replaceIndex].isDirty &&
        !currentTabs[replaceIndex].aspectModelUrn &&
        !file.name.includes('new-model');

      if (isCleanEmptyToReplace) {
        const updated = [...currentTabs];
        updated[replaceIndex] = tabData;
        return updated;
      }

      if (existingIndex >= 0) {
        const updated = [...currentTabs];
        updated[existingIndex] = {...updated[existingIndex], ...tabData};
        return updated;
      }

      return [...currentTabs, tabData];
    });

    this.activeTabId.set(absoluteName);
    this.titleService.updateTitle(absoluteName);

    if (this.browserService.isStartedAsTauriApp()) {
      this.tauriSignalsService.call('updateWindowInfo', {
        namespace: file.namespace,
        fromWorkspace,
        file: file.name,
      });
    }
  }

  /**
   * Updates tab metadata when the active model is renamed or when an aspect is added.
   */
  public updateActiveTabNaming(file: NamespaceFile): void {
    if (!file) return;
    const activeId = this.activeTabId();
    const newId = file.absoluteName || `${file.namespace}:${file.name}`;
    this.tabs.update(currentTabs =>
      currentTabs.map(tab => {
        if (tab.id === activeId || tab.file.includes('new-model')) {
          return {
            ...tab,
            id: newId,
            file: file.name,
            namespace: file.namespace,
            aspectModelUrn: file.aspect?.aspectModelUrn || file.originalAspectModelUrn,
          };
        }
        return tab;
      }),
    );
    this.activeTabId.set(newId);
  }

  /**
   * Saves the current active tab's files snapshot and saved baseline before switching away.
   */
  public saveActiveTabSnapshot(): void {
    const activeId = this.activeTabId();
    if (!activeId) return;

    const snapshot = this.loadedFilesService.getSnapshot();
    const baseline = this.modelSavingTracker.getSavedModel();

    this.tabs.update(currentTabs =>
      currentTabs.map(tab => {
        if (tab.id === activeId) {
          return {
            ...tab,
            filesSnapshot: snapshot,
            savedModelBaseline: baseline,
          };
        }
        return tab;
      }),
    );
  }

  /**
   * Switches to an existing tab and renders its graph model.
   */
  public switchToTab(tabId: string, editElementUrn?: string): Observable<boolean> {
    const targetTab = this.tabs().find(t => t.id === tabId);
    if (!targetTab) {
      return of(false);
    }

    if (this.activeTabId() === tabId) {
      if (editElementUrn) {
        return this.modelRenderer.renderModel(editElementUrn).pipe(map(() => true));
      }
      return of(true);
    }

    this.saveActiveTabSnapshot();

    if (targetTab.filesSnapshot) {
      // Ensure the target file has rendered = true
      const restoredFiles = {...targetTab.filesSnapshot};
      for (const f of Object.values(restoredFiles)) {
        f.rendered = f.absoluteName === targetTab.id || (f.namespace === targetTab.namespace && f.name === targetTab.file);
      }

      this.loadedFilesService.setFiles(restoredFiles);
      if (targetTab.savedModelBaseline !== undefined) {
        this.modelSavingTracker.setSavedModel(targetTab.savedModelBaseline);
      }

      this.activeTabId.set(tabId);
      this.titleService.updateTitle(targetTab.id);

      if (this.browserService.isStartedAsTauriApp()) {
        this.tauriSignalsService.call('updateWindowInfo', {
          namespace: targetTab.namespace,
          fromWorkspace: targetTab.fromWorkspace,
          file: targetTab.file,
        });
      }

      return this.modelRenderer.renderModel(editElementUrn || targetTab.editElementUrn).pipe(map(() => true));
    }

    // If no snapshot yet, load via FileHandlingService
    this.activeTabId.set(tabId);
    this.fileHandlingService.loadNamespaceFile(targetTab.id, targetTab.aspectModelUrn || targetTab.editElementUrn);
    return of(true);
  }

  /**
   * Sets the dirty status for a specific tab.
   */
  public setTabDirty(tabId: string | null, isDirty: boolean): void {
    if (!tabId) return;
    this.tabs.update(currentTabs => currentTabs.map(tab => (tab.id === tabId ? {...tab, isDirty} : tab)));
  }

  /**
   * Closes a tab, verifying unsaved changes first if necessary.
   * If the last tab is closed, automatically creates a fresh new-model.ttl.
   */
  public closeTab(tabId: string): Observable<boolean> {
    const tabToClose = this.tabs().find(t => t.id === tabId);
    if (!tabToClose) return of(false);

    const isActive = this.activeTabId() === tabId;

    if (!isActive && tabToClose.isDirty) {
      return this.switchToTab(tabId).pipe(switchMap(() => this.closeTab(tabId)));
    }

    const checkConfirm$ = isActive
      ? this.modelSavingTracker.isSaved$.pipe(
          first(),
          switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialog.openDialog())),
        )
      : of(true);

    return checkConfirm$.pipe(
      filter((confirmed): confirmed is boolean => Boolean(confirmed)),
      tap(() => {
        const currentTabs = this.tabs();
        const tabIndex = currentTabs.findIndex(t => t.id === tabId);
        const remainingTabs = currentTabs.filter(t => t.id !== tabId);

        this.loadedFilesService.removeFile(tabId);

        if (isActive) {
          if (remainingTabs.length > 0) {
            this.tabs.set(remainingTabs);
            const nextIndex = Math.min(tabIndex, remainingTabs.length - 1);
            const nextTab = remainingTabs[nextIndex];
            this.switchToTab(nextTab.id).subscribe();
          } else {
            this.tabs.set([]);
            this.activeTabId.set(null);
            this.fileHandlingService.loadEmptyModel().subscribe();
          }
        } else {
          this.tabs.set(remainingTabs);
        }
      }),
      map(() => true),
    );
  }

  /**
   * Opens an empty new tab.
   */
  public createEmptyTab(): void {
    this.saveActiveTabSnapshot();
    this.fileHandlingService.loadEmptyModel().subscribe();
  }

  /**
   * Finds an existing tab by namespace and file name.
   */
  public findTab(namespace: string, file: string): EditorTab | undefined {
    return this.tabs().find(t => t.namespace === namespace && t.file === file);
  }

  /**
   * Finds an existing tab by aspect model URN.
   */
  public findTabByUrn(aspectModelUrn: string): EditorTab | undefined {
    return this.tabs().find(t => t.aspectModelUrn === aspectModelUrn || t.id.includes(aspectModelUrn));
  }
}
