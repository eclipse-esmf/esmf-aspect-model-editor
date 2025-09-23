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
import {MigratorService} from '@ame/migrator';
import {Component, NgZone, OnInit, inject} from '@angular/core';
import {MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {catchError, of} from 'rxjs';

@Component({
  selector: 'ame-loading-migrating',
  templateUrl: './loading-migrating.component.html',
  styleUrls: ['./loading-migrating.component.scss'],
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatProgressSpinner, TranslateModule],
})
export class LoadingMigratingComponent implements OnInit {
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private migratorService = inject(MigratorService);
  private migratorApiService = inject(MigratorApiService);

  ngOnInit(): void {
    this.migratorApiService
      .migrateWorkspace(this.migratorService.increaseNamespaceVersion)
      .pipe(catchError(() => of(null)))
      .subscribe(data => this.ngZone.run(() => this.router.navigate([{outlets: {migrator: 'migration-result'}}], {state: {data}})));
  }
}
