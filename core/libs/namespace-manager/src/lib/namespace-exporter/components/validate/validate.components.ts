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

import {Component, Inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NAMESPACES_SESSION} from '../../../shared';
import {NamespacesSessionInterface} from '../../../shared/models';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {MatDialogTitle, MatDialogContent} from '@angular/material/dialog';

@Component({
  selector: 'ame-export-validate',
  templateUrl: './validate.components.html',
  styleUrls: [`validate.components.scss`],
  standalone: true,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatProgressSpinner],
})
export class ExportValidateComponent implements OnInit {
  constructor(
    private router: Router,
    @Inject(NAMESPACES_SESSION) private namespacesSession: NamespacesSessionInterface,
  ) {}

  ngOnInit() {
    this.namespacesSession.state.validating$.subscribe({
      next: isImporting => {
        if (isImporting) {
          return;
        }

        this.router.navigate([{outlets: {'export-namespaces': 'summary'}}]);
      },
      error: () => {
        this.router.navigate([{outlets: {'export-namespaces': 'error'}}]);
      },
    });
  }
}
