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

import {ModelCheckerService} from '@ame/editor';
import {Component, DestroyRef, effect, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatMiniFabButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {EMPTY, Subject, catchError, debounceTime, finalize, map, switchMap, tap} from 'rxjs';
import {SidebarStateService} from '../sidebar-state.service';
import {WorkspaceEmptyComponent} from './workspace-empty/workspace-empty.component';
import {WorkspaceErrorComponent} from './workspace-error/workspace-error.component';
import {WorkspaceFileElementsComponent} from './workspace-file-elements/workspace-file-elements.component';
import {WorkspaceFileListComponent} from './workspace-file-list/workspace-file-list.component';

@Component({
  selector: 'ame-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  imports: [
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
  private destroyRef = inject(DestroyRef);
  private modelChecker = inject(ModelCheckerService);

  public sidebarService = inject(SidebarStateService);

  public namespaces = this.sidebarService.namespacesState;
  public loading = signal(false);
  public error = signal<{code: number; message: string; path: string}>(null);

  public get namespacesKeys(): string[] {
    return this.namespaces.namespacesKeys();
  }

  // Coalesces refresh signals that can occur multiple times in quick succession for the same
  // logical change (e.g. saving a model triggers a local refresh as well as an IPC-broadcasted
  // one), so `detectWorkspaceErrors()` is only executed once per burst instead of repeatedly.
  private readonly refresh$ = new Subject<void>();

  constructor() {
    effect(() => {
      this.sidebarService.workspace.refreshTick();
      this.refresh$.next();
    });

    this.refresh$
      .pipe(
        debounceTime(50),
        tap(() => {
          this.error.set(null);
          this.loading.set(true);
        }),
        switchMap(() =>
          this.modelChecker.detectWorkspaceErrors().pipe(
            map(files => this.sidebarService.updateWorkspace(files)),
            catchError(err => {
              if (err?.error?.error) {
                this.error.set(err.error.error);
              }
              return EMPTY;
            }),
            finalize(() => {
              this.loading.set(false);
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
}
