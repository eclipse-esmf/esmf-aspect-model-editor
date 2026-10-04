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

import {ModelCheckerPort, ModelValidationStore, WorkspaceFacade, WorkspaceStore} from '@ame/domain';
import {
  ClipboardService,
  createDebouncedLoading,
  LanguageTranslationService,
  NotificationsService,
  ResizeGutterComponent,
} from '@ame/shared';
import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatMiniFabButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {catchError, debounceTime, EMPTY, finalize, map, Subject, switchMap, tap} from 'rxjs';
import {SidebarStateService} from '../sidebar-state.service';
import {WorkspaceEmptyComponent} from './workspace-empty/workspace-empty.component';
import {WorkspaceErrorComponent} from './workspace-error/workspace-error.component';
import {WorkspaceFileElementsComponent} from './workspace-file-elements/workspace-file-elements.component';
import {WorkspaceFileListComponent} from './workspace-file-list/workspace-file-list.component';

export const WORKSPACE_DEFAULT_WIDTH = 450;

@Component({
  selector: 'ame-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  imports: [
    ResizeGutterComponent,
    MatTooltipModule,
    MatMiniFabButton,
    MatIconModule,
    WorkspaceErrorComponent,
    WorkspaceEmptyComponent,
    WorkspaceFileListComponent,
    WorkspaceFileElementsComponent,
    TranslocoDirective,
  ],
})
export class WorkspaceComponent {
  protected readonly minWidth = 280;
  protected readonly maxWidth = 900;
  protected readonly storageKey = 'ame.sidebar.workspace.width';
  public readonly width = signal<number | null>(WORKSPACE_DEFAULT_WIDTH);

  private destroyRef = inject(DestroyRef);
  private modelChecker = inject(ModelCheckerPort);
  private modelApiService = inject(WorkspaceFacade);
  private clipboard = inject(ClipboardService);
  private notificationsService = inject(NotificationsService);
  private translate = inject(LanguageTranslationService);

  public sidebarService = inject(SidebarStateService);
  public validationStore = inject(ModelValidationStore);
  public workspaceStore = inject(WorkspaceStore);

  public namespaces = this.sidebarService.namespacesState;
  public readonly loading = createDebouncedLoading();
  public error = signal<{code: number; message: string; path: string}>(null);

  public get namespacesKeys(): string[] {
    return this.namespaces.namespacesKeys();
  }

  // Coalesces refresh signals that can occur multiple times in quick succession for the same
  // logical change (e.g. saving a model triggers a local refresh as well as an IPC-broadcasted
  // one), so `detectWorkspaceErrors()` is only executed once per burst instead of repeatedly.
  private readonly refresh$ = new Subject<void>();

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any)['angular.workspaceComponent'] = this;
    }

    effect(() => {
      this.workspaceStore.refreshTick();
      this.sidebarService.workspace.refreshTick();
      this.refresh$.next();
    });

    this.refresh$
      .pipe(
        debounceTime(50),
        tap(() => {
          this.error.set(null);
          this.validationStore.clearWorkspaceError();
          this.validationStore.setValidating(true);
          this.loading.set(true);
        }),
        switchMap(() =>
          this.modelChecker.detectWorkspaceErrors().pipe(
            map(files => {
              this.validationStore.setValidationStatus(true);
              return this.sidebarService.updateWorkspace(files);
            }),
            catchError(err => {
              if (err?.error?.error) {
                this.error.set(err.error.error);
                this.validationStore.setWorkspaceError(err.error.error);
              }
              return EMPTY;
            }),
            finalize(() => {
              this.loading.set(false);
              this.validationStore.setValidating(false);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  refreshWorkspace() {
    this.sidebarService.namespacesState.clear();
    this.sidebarService.workspace.refresh();
  }

  copyWorkspacePath() {
    this.modelApiService
      .getStoragePath()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const pathToCopy = response?.storagePath || response?.path;
          if (!pathToCopy) return;

          this.clipboard.copy(pathToCopy);

          const title = this.translate.translateService.translate('sidebar.workspace.copiedWorkspacePath');
          this.notificationsService.success({title, message: pathToCopy});
        },
      });
  }
}
