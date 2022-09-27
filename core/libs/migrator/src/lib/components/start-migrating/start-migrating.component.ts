/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {APP_CONFIG, AppConfig} from '@ame/shared';
import {Component, Inject} from '@angular/core';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {Router} from '@angular/router';
import {MigratorService} from '../../migrator.service';

@Component({
  selector: 'start-migrating',
  templateUrl: './start-migrating.component.html',
  styleUrls: ['./start-migrating.component.scss'],
})
export class StartMigratingComponent {
  public migrateLoading = false;
  public increaseVersion = this.migratorService.increaseNamespaceVersion;

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    private migratorApiService: MigratorApiService,
    private migratorService: MigratorService,
    private router: Router
  ) {}

  migrate() {
    this.migrateLoading = true;
    this.migratorApiService.createBackup().subscribe(() => {
      this.migrateLoading = false;
      this.router.navigate([{outlets: {migrator: ['migrating']}}]);
    });
  }

  closeDialog() {
    this.migratorService.dialogRef.close();
  }

  changeVersionCheck(event: MatCheckboxChange) {
    this.migratorService.increaseNamespaceVersion = event.checked;
  }
}
