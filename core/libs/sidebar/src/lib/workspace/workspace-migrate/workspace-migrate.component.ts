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

import {MigratorApiService} from '@ame/api';
import {Component, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {of, switchMap, tap} from 'rxjs';
import {SidebarStateService} from '../../sidebar-state.service';
import {MigrationDialogComponent} from './migration-dialog';

@Component({
  selector: 'ame-workspace-migrate',
  templateUrl: './workspace-migrate.component.html',
  styleUrls: ['./workspace-migrate.component.scss'],
})
export class WorkspaceMigrateComponent {
  private dialog = inject(MatDialog);
  private destroRef = inject(DestroyRef);
  private migratorApiService = inject(MigratorApiService);
  private sidebarService = inject(SidebarStateService);

  migrate() {
    return this.migratorApiService
      .hasFilesToMigrate()
      .pipe(
        takeUntilDestroyed(this.destroRef),
        switchMap(hasFiles =>
          hasFiles
            ? this.dialog
                .open(MigrationDialogComponent, {disableClose: true})
                .afterClosed()
                .pipe(tap(() => this.sidebarService.workspace.refresh()))
            : of({}),
        ),
      )
      .subscribe();
  }
}
