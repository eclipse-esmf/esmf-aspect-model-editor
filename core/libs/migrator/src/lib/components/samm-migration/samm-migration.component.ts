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

import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs';
import {TranslateModule} from '@ngx-translate/core';
import {AsyncPipe} from '@angular/common';
import {MatProgressBar} from '@angular/material/progress-bar';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {MatDialogTitle, MatDialogContent} from '@angular/material/dialog';

@Component({
  templateUrl: './samm-migration.component.html',
  styleUrls: ['./samm-migration.component.scss'],
  standalone: true,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatProgressBar, AsyncPipe, TranslateModule],
})
export class SammMigrationComponent {
  public get status$() {
    return this.activatedRoute.queryParams.pipe(map(params => params?.status || 'checking'));
  }

  constructor(private activatedRoute: ActivatedRoute) {}
}
