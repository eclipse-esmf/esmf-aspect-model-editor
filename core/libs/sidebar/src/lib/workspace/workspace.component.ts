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

import {ModelCheckerService} from '@ame/editor';
import {SidebarStateService} from '@ame/sidebar';
import {ChangeDetectorRef, Component, DestroyRef, effect, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatMiniFabButton} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {finalize, map} from 'rxjs';
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
    TranslatePipe,
  ],
})
export class WorkspaceComponent {
  private destroyRef = inject(DestroyRef);
  private changeDetector = inject(ChangeDetectorRef);
  private modelChecker = inject(ModelCheckerService);

  public sidebarService = inject(SidebarStateService);

  public namespaces = this.sidebarService.namespacesState;
  public loading = false;
  public error: {code: number; message: string; path: string} = null;

  public get namespacesKeys(): string[] {
    return this.namespaces.namespacesKeys();
  }

  constructor() {
    effect(() => {
      this.sidebarService.workspace.refreshTick();

      this.error = null;
      this.loading = true;
      this.changeDetector.detectChanges();

      this.modelChecker
        .detectWorkspaceErrors()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          map(files => this.sidebarService.updateWorkspace(files)),
          finalize(() => {
            this.loading = false;
            this.changeDetector.detectChanges();
          }),
        )
        .subscribe({
          error: err => {
            if (err?.error?.error) {
              this.error = err.error.error;
            }
          },
        });
    });
  }
}
