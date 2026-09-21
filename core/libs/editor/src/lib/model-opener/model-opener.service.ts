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

import {ModelSavingTrackerService, TauriSignals, TauriSignalsService} from '@ame/shared';
import {OpenFileDialogComponent, OpenFileDialogData, OpenFileDialogResult} from '@ame/utils';
import {inject, Injectable, Injector} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {filter, first, map, Observable, of, switchMap, tap} from 'rxjs';
import {FileHandlingService} from '../editor-toolbar/services/file-handling.service';
import {SaveModelDialogService} from '../save-model-dialog/save-model-dialog.service';

export interface OpenModelOptions {
  file: string;
  namespace: string;
  aspectModelUrn?: string;
  editElementUrn?: string;
}

@Injectable({providedIn: 'root'})
export class ModelOpenerService {
  private readonly injector = inject(Injector);
  private readonly matDialog = inject(MatDialog);
  private readonly tauriSignalsService: TauriSignals = inject(TauriSignalsService);
  private readonly modelSavingTracker = inject(ModelSavingTrackerService);
  private readonly saveModelDialog = inject(SaveModelDialogService);

  private get fileHandlingService(): FileHandlingService {
    return this.injector.get(FileHandlingService);
  }

  /**
   * Prompts the user to choose between opening in the current window or in a new window.
   */
  public promptAndOpen(options: OpenModelOptions): Observable<boolean> {
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
          if (result === 'open-out') {
            this.openInNewWindow(options);
            return of(true);
          }
          return of(false);
        }),
      );
  }

  /**
   * Opens the model in the current window after ensuring unsaved changes are saved/handled.
   */
  public openInCurrentWindow(options: OpenModelOptions): Observable<boolean> {
    return this.checkUnsavedChanges().pipe(
      tap(() => {
        this.fileHandlingService.loadNamespaceFile(
          `${options.namespace}:${options.file}`,
          options.aspectModelUrn || options.editElementUrn,
        );
      }),
      map(() => true),
    );
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
   */
  public checkUnsavedChanges(): Observable<boolean> {
    return this.modelSavingTracker.isSaved$.pipe(
      first(),
      switchMap(isSaved => (isSaved ? of(true) : this.saveModelDialog.openDialog())),
    );
  }
}
