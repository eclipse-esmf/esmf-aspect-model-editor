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

@Component({
  selector: 'ame-import-validate',
  templateUrl: './validate.components.html',
  styleUrls: [`validate.components.scss`],
})
export class ImportValidateComponent implements OnInit {
  constructor(
    private router: Router,
    @Inject(NAMESPACES_SESSION) private importSession: NamespacesSessionInterface,
  ) {}

  ngOnInit() {
    this.importSession.state.validating$.subscribe({
      next: isImporting => {
        if (isImporting) {
          return;
        }

        if (this.importSession.conflictFiles.replace.length) {
          this.router.navigate([{outlets: {'import-namespaces': 'conflict'}}]);
        } else {
          this.router.navigate([{outlets: {'import-namespaces': 'summary'}}]);
        }
      },
      error: () => this.router.navigate([{outlets: {'import-namespaces': 'error'}}]),
    });
  }
}
