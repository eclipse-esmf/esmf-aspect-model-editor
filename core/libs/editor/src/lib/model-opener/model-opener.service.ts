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

import {ModelOpenerPort, OpenModelOptions, PromptUploadOptions} from '@ame/domain';
import {TauriSignals, TauriSignalsService} from '@ame/shared';
import {inject, Injectable, Injector} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {filter, first, map, Observable, of, switchMap} from 'rxjs';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {ModelSavingTrackerService} from '../model-saving-tracker.service';
import {SaveModelDialogService} from '../save-model-dialog/save-model-dialog.service';
import {TabStateService} from '../tabs/tab-state.service';
import {OpenFileDialogComponent, OpenFileDialogData, OpenFileDialogResult} from './open-file-dialog/open-file-dialog.component';

export {OpenModelOptions, PromptUploadOptions};

@Injectable({providedIn: 'root'})
export class ModelOpenerService implements ModelOpenerPort {
  private readonly matDialog = inject(MatDialog);
  private readonly tauriSignalsService: TauriSignals = inject(TauriSignalsService);
  private readonly modelSavingTracker = inject(ModelSavingTrackerService);
  private readonly saveModelDialog = inject(SaveModelDialogService);

  private readonly injector = inject(Injector);

  // Lazy on purpose: real DI cycles
  // ModelOpener -> FileHandling -> ModelOpener
  // ModelOpener -> FileHandling -> ModelLoader -> ModelRenderer -> ShapeSettings -> OpenReferencedElement -> ModelOpener
  private get fileHandlingService(): FileHandlingService {
    return this.injector.get(FileHandlingService);
  }

  private readonly tabStateService = inject(TabStateService);

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any)['angular.ModelOpenerService'] = this;
    }
  }

  /**
   * Prompts the user to choose between opening in the current tab, new tab, or new window.
   * If the file is already open in a tab, directly switches to that tab without prompting.
   * If the active tab is clean empty (new-model with no aspect/shapes), opens in current tab directly.
   */
  public promptAndOpen(options: OpenModelOptions): Observable<boolean> {
    const existingTab = this.tabStateService.findTab(options.namespace, options.file);
    if (existingTab) {
      return this.tabStateService.switchToTab(existingTab.id, options.editElementUrn || options.aspectModelUrn);
    }

    if (this.tabStateService.isActiveTabCleanEmpty()) {
      return this.openInCurrentWindow(options);
    }

    return this.matDialog
      .open<OpenFileDialogComponent, OpenFileDialogData, OpenFileDialogResult>(OpenFileDialogComponent, {
        data: {file: options.file, namespace: options.namespace},
      })
      .afterClosed()
      .pipe(
        filter((result): result is OpenFileDialogResult => Boolean(result)),
        switchMap(result => {
          if (result === 'open-in') {
            return this.openInCurrentWindow(options);
          }
          if (result === 'open-tab') {
            return this.openInNewTab(options);
          }
          if (result === 'open-out') {
            this.openInNewWindow(options);
            return of(true);
          }
          return of(false);
        }),
      );
  }

  /**
   * Prompts the user when uploading/opening a file from disk if an Aspect Model is already loaded.
   */
  public promptForUpload(options: PromptUploadOptions): Observable<boolean> {
    return this.matDialog
      .open<OpenFileDialogComponent, OpenFileDialogData, OpenFileDialogResult>(OpenFileDialogComponent, {
        data: {file: options.fileName, namespace: options.namespace},
      })
      .afterClosed()
      .pipe(
        filter((result): result is OpenFileDialogResult => Boolean(result)),
        switchMap(result => {
          if (result === 'open-in') {
            return this.checkUnsavedChanges().pipe(
              switchMap(confirmed =>
                confirmed
                  ? this.fileHandlingService
                      .loadModel(options.modelContent, this.tabStateService.activeTabId() ?? undefined)
                      .pipe(map(() => true))
                  : of(false),
              ),
            );
          }
          if (result === 'open-tab') {
            this.tabStateService.saveActiveTabSnapshot();
            return this.fileHandlingService.loadModel(options.modelContent).pipe(map(() => true));
          }
          if (result === 'open-out') {
            this.tauriSignalsService.call('openWindow', null);
            return of(true);
          }
          return of(false);
        }),
      );
  }

  /**
   * Opens the model in the active tab, replacing the model shown there, after unsaved changes are saved or discarded.
   * If the model is already open in another tab, that tab is shown instead of opening it twice.
   */
  public openInCurrentWindow(options: OpenModelOptions): Observable<boolean> {
    const existingTab = this.tabStateService.findTab(options.namespace, options.file);
    if (existingTab) {
      return this.tabStateService.switchToTab(existingTab.id, options.editElementUrn || options.aspectModelUrn);
    }

    return this.checkUnsavedChanges().pipe(
      map(confirmed => {
        if (!confirmed) return false;

        this.fileHandlingService.loadNamespaceFile(
          `${options.namespace}:${options.file}`,
          options.aspectModelUrn || options.editElementUrn,
          this.tabStateService.activeTabId() ?? undefined,
        );
        return true;
      }),
    );
  }

  /**
   * Opens the model in a new tab within the current window.
   */
  public openInNewTab(options: OpenModelOptions): Observable<boolean> {
    this.tabStateService.saveActiveTabSnapshot();
    this.fileHandlingService.loadNamespaceFile(`${options.namespace}:${options.file}`, options.aspectModelUrn || options.editElementUrn);
    return of(true);
  }

  /**
   * Opens the model in a new Tauri window.
   */
  public openInNewWindow(options: OpenModelOptions): void {
    this.tauriSignalsService.call('openWindow', {
      namespace: options.namespace,
      file: options.file,
      fromWorkspace: true,
      aspectModelUrn: options.aspectModelUrn || options.editElementUrn,
      editElement: options.editElementUrn,
    });
  }

  /**
   * Checks for unsaved changes before performing destructive actions.
   * Emits true when there are no unsaved changes or the user saved/discarded them, false when the user keeps editing.
   */
  public checkUnsavedChanges(): Observable<boolean> {
    return this.modelSavingTracker.isSaved$.pipe(
      first(),
      switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialog.openDialog().pipe(map(result => result === true)))),
    );
  }
}
