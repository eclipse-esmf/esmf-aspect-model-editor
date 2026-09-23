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

import {MigratorApiService} from '@ame/api';
import {Component, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {TranslocoDirective} from '@jsverse/transloco';
import {of, switchMap, tap} from 'rxjs';
import {SidebarStateService} from '../../sidebar-state.service';
import {MigrationDialogComponent} from './migration-dialog';

@Component({
  selector: 'ame-workspace-migrate',
  templateUrl: './workspace-migrate.component.html',
  styleUrls: ['./workspace-migrate.component.scss'],
  imports: [MatButtonModule, MatIconModule, TranslocoDirective],
})
export class WorkspaceMigrateComponent {
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private migratorApiService = inject(MigratorApiService);
  private sidebarService = inject(SidebarStateService);

  migrate() {
    return this.migratorApiService
      .hasFilesToMigrate()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(hasFiles =>
          hasFiles
            ? this.dialog
                .open(MigrationDialogComponent, {disableClose: true})
                .afterClosed()
                .pipe(
                  tap(migrated => {
                    if (migrated) {
                      this.sidebarService.namespacesState.clear();
                      this.sidebarService.workspace.refresh();
                    }
                  }),
                )
            : of({}),
        ),
      )
      .subscribe();
  }
}
