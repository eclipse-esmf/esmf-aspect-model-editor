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

import {LoadedFilesService, NamespaceFile, TabsStore} from '@ame/domain';
import {MaxGraphService} from '@ame/graph';
import {BrowserService, TauriSignals, TauriSignalsService, TitleService} from '@ame/shared';
import {DestroyRef, effect, inject, Injectable, Injector, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime, filter, first, map, Observable, of, switchMap, tap} from 'rxjs';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelRendererService} from '../model-renderer.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {SaveModelDialogService} from '../save-model-dialog/save-model-dialog.service';
import {EditorTab} from './tab.model';

@Injectable({providedIn: 'root'})
export class TabStateService {
  public readonly tabsStore = inject(TabsStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly modelSavingTracker = inject(ModelSavingTrackerService);
  private readonly titleService = inject(TitleService);
  private readonly browserService = inject(BrowserService);
  private readonly tauriSignalsService: TauriSignals = inject(TauriSignalsService);
  private readonly saveModelDialog = inject(SaveModelDialogService);

  private readonly maxGraphService = inject(MaxGraphService);

  private readonly injector = inject(Injector);

  // Lazy on purpose: real DI cycles
  // TabState -> ModelRenderer -> ShapeSettings -> Editor -> ModelSaver -> TabState
  // TabState -> FileHandling -> ModelLoader -> TabState
  private get modelRenderer(): ModelRendererService {
    return this.injector.get(ModelRendererService);
  }

  private get fileHandlingService(): FileHandlingService {
    return this.injector.get(FileHandlingService);
  }

  public readonly tabs = this.tabsStore.entities;
  public readonly activeTabId = this.tabsStore.activeTabId;

  public readonly activeTab = this.tabsStore.activeTab;

  public readonly hasMultipleTabs = this.tabsStore.hasMultipleTabs;

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

      untracked(() => {
        const currentTabs = this.tabs();
        const activeTab = currentTabs.find(t => t.id === activeId);
        if (!activeTab || currentTabs.some(t => t.id === absoluteName)) return;

        const parts = absoluteName.split(':');
        const file = parts.pop() || '';
        const namespace = parts.join(':');
        this.tabsStore.renameTab(activeId, {...activeTab, id: absoluteName, file, namespace});
      });
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
   * With `replaceTabId` the loaded model takes the place of that tab ("Open in current tab") instead of adding a new tab.
   */
  public onModelLoaded(file: NamespaceFile, fromWorkspace = false, editElementUrn?: string, replaceTabId?: string): void {
    if (!file) return;

    let absoluteName = file.absoluteName || `${file.namespace}:${file.name}`;
    const snapshot = this.loadedFilesService.getSnapshot();
    const baseline = this.modelSavingTracker.getSavedModel();

    const currentTabs = this.tabs();
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

    const tabToReplace = replaceTabId && replaceTabId !== absoluteName ? currentTabs.find(t => t.id === replaceTabId) : undefined;

    if (tabToReplace) {
      if (existingIndex >= 0) {
        this.tabsStore.removeTab(tabToReplace.id);
        this.tabsStore.addOrUpdateTab({...currentTabs[existingIndex], ...tabData});
      } else {
        this.tabsStore.renameTab(tabToReplace.id, tabData);
      }
    } else if (isCleanEmptyToReplace) {
      const oldTabId = currentTabs[replaceIndex].id;
      if (oldTabId !== absoluteName) {
        this.tabsStore.removeTab(oldTabId);
      }
      this.tabsStore.addOrUpdateTab(tabData);
    } else if (existingIndex >= 0) {
      this.tabsStore.addOrUpdateTab({...currentTabs[existingIndex], ...tabData});
    } else {
      this.tabsStore.addOrUpdateTab(tabData);
    }

    this.tabsStore.setActiveTabId(absoluteName);
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
    const currentTabs = this.tabs();
    for (const tab of currentTabs) {
      if (tab.id === activeId || tab.file.includes('new-model')) {
        if (tab.id !== newId) {
          this.tabsStore.removeTab(tab.id);
        }
        this.tabsStore.addOrUpdateTab({
          ...tab,
          id: newId,
          file: file.name,
          namespace: file.namespace,
          aspectModelUrn: file.aspect?.aspectModelUrn || file.originalAspectModelUrn,
        });
      }
    }
    this.tabsStore.setActiveTabId(newId);
  }

  /**
   * Marks the active tab as saved in the workspace (e.g. after the first save of a new model),
   * so it can be reopened later, e.g. when the session is restored.
   */
  public markActiveTabInWorkspace(file: NamespaceFile): void {
    const activeTab = this.activeTab();
    if (!activeTab || !file) return;

    const namespaceUrn = `urn:samm:${file.namespace}#`;
    const anyElementUrn = file.rdfModel?.store
      ?.getSubjects(null, null, null)
      .find(subject => subject.termType === 'NamedNode' && subject.value.startsWith(namespaceUrn))?.value;

    this.tabsStore.addOrUpdateTab({
      ...activeTab,
      fromWorkspace: true,
      aspectModelUrn: activeTab.aspectModelUrn || file.aspect?.aspectModelUrn || anyElementUrn,
    });
  }

  /**
   * Saves the current active tab's files snapshot and saved baseline before switching away.
   */
  public saveActiveTabSnapshot(): void {
    const activeId = this.activeTabId();
    if (!activeId) return;

    const snapshot = this.loadedFilesService.getSnapshot();
    const baseline = this.modelSavingTracker.getSavedModel();
    const activeTab = this.activeTab();
    if (activeTab) {
      this.tabsStore.addOrUpdateTab({
        ...activeTab,
        filesSnapshot: snapshot,
        savedModelBaseline: baseline,
      });
    }
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

      this.tabsStore.setActiveTabId(tabId);
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
    this.tabsStore.setActiveTabId(tabId);
    this.fileHandlingService.loadNamespaceFile(targetTab.id, targetTab.aspectModelUrn || targetTab.editElementUrn);
    return of(true);
  }

  /**
   * Sets the dirty status for a specific tab.
   */
  public setTabDirty(tabId: string | null, isDirty: boolean): void {
    if (!tabId) return;
    this.tabsStore.setTabDirty(tabId, isDirty);
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
          // Prevent the store from auto-selecting a neighbour, so switchToTab performs a full restore
          this.tabsStore.setActiveTabId(null);
        }
        this.tabsStore.removeTab(tabId);

        if (isActive) {
          if (remainingTabs.length > 0) {
            const nextIndex = Math.min(tabIndex, remainingTabs.length - 1);
            const nextTab = remainingTabs[nextIndex];
            this.switchToTab(nextTab.id).subscribe();
          } else {
            this.fileHandlingService.loadEmptyModel().subscribe();
          }
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
