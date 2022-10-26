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
import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {of, switchMap, tap} from 'rxjs';
import {MigratorComponent} from './components';

@Injectable({
  providedIn: 'root',
})
export class MigratorService {
  private _dialog: MatDialogRef<MigratorComponent>;

  public increaseNamespaceVersion = true;

  get dialogRef() {
    return this._dialog;
  }

  constructor(private dialog: MatDialog, private migratorApi: MigratorApiService, private router: Router) {}

  public startMigrating() {
    return this.migratorApi.hasFilesToMigrate().pipe(switchMap(hasFiles => (hasFiles ? this.openDialog() : of(null))));
  }

  private openDialog() {
    this._dialog = this.dialog.open(MigratorComponent, {disableClose: true});
    return this.dialogRef.afterClosed().pipe(
      tap(() => {
        this._dialog = null;
        this.router.navigate([{outlets: {migrator: null}}]);
      })
    );
  }
}
