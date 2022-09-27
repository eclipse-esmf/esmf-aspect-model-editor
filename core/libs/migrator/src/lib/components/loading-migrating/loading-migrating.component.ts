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
import {EditorService} from '@ame/editor';
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, map, of, switchMap} from 'rxjs';

@Component({
  selector: 'ame-loading-migrating',
  templateUrl: './loading-migrating.component.html',
  styleUrls: ['./loading-migrating.component.scss'],
})
export class LoadingMigratingComponent implements OnInit {
  constructor(private migratorApiService: MigratorApiService, private editorService: EditorService, private router: Router) {}

  ngOnInit(): void {
    this.migratorApiService
      .migrateWorkspace()
      .pipe(
        switchMap(data => this.editorService.loadExternalModels().pipe(map(() => data))),
        catchError(() => of(null))
      )
      .subscribe(data => {
        this.router.navigate([{outlets: {migrator: 'status'}}], {state: {data}});
      });
  }
}
