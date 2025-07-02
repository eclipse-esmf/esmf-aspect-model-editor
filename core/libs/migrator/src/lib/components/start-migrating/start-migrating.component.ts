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
import {APP_CONFIG, AppConfig} from '@ame/shared';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {Component, Inject, NgZone, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatCheckbox, MatCheckboxChange} from '@angular/material/checkbox';
import {MatDialogActions, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {MigratorService} from '../../migrator.service';

@Component({
  selector: 'ame-start-migrating',
  templateUrl: './start-migrating.component.html',
  styleUrls: ['./start-migrating.component.scss'],
  standalone: true,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatCheckbox, MatDialogActions, MatButton, MatProgressSpinner, TranslateModule],
})
export class StartMigratingComponent {
  public migrateLoading = false;
  private migratorService = inject(MigratorService);
  public increaseVersion = this.migratorService.increaseNamespaceVersion;

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    private migratorApiService: MigratorApiService,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  migrate() {
    this.migrateLoading = true;
    this.migratorApiService.createBackup().subscribe(() => {
      this.migrateLoading = false;
      this.ngZone.run(() => this.router.navigate([{outlets: {migrator: ['migrating']}}]));
    });
  }

  closeDialog() {
    this.migratorService.dialogRef.close();
  }

  changeVersionCheck(event: MatCheckboxChange) {
    this.migratorService.increaseNamespaceVersion = event.checked;
  }
}
