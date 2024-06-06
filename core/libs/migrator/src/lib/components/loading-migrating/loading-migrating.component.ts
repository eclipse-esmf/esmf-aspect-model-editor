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
import {Component, NgZone, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, of} from 'rxjs';

@Component({
  selector: 'ame-loading-migrating',
  templateUrl: './loading-migrating.component.html',
  styleUrls: ['./loading-migrating.component.scss'],
})
export class LoadingMigratingComponent implements OnInit {
  constructor(
    private migratorApiService: MigratorApiService,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.migratorApiService
      .migrateWorkspace()
      .pipe(catchError(() => of(null)))
      .subscribe(data => this.ngZone.run(() => this.router.navigate([{outlets: {migrator: 'status'}}], {state: {data}})));
  }
}
