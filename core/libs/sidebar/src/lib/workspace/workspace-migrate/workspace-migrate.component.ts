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

import {MigratorService} from '@ame/migrator';
import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {SidebarStateService} from '../../sidebar-state.service';

@Component({
  selector: 'ame-workspace-migrate',
  templateUrl: './workspace-migrate.component.html',
  styleUrls: ['./workspace-migrate.component.scss'],
})
export class WorkspaceMigrateComponent implements OnDestroy {
  private subscription = new Subscription();

  constructor(
    private migratorService: MigratorService,
    private sidebarService: SidebarStateService,
  ) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  migrate() {
    this.subscription.add(this.migratorService.startMigrating().subscribe(() => this.sidebarService.workspace.refresh()));
  }
}
