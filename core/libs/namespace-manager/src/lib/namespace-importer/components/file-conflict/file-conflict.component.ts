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

import {Component, Inject} from '@angular/core';
import {Router} from '@angular/router';
import {NAMESPACES_SESSION} from '../../../shared';
import {NamespacesSessionInterface} from '../../../shared/models';

@Component({
  templateUrl: './file-conflict.component.html',
  styleUrls: ['./file-conflict.component.scss'],
})
export class FileConflictComponent {
  public namespacesToReplace: string[] = [];
  public conflictFiles: any;

  constructor(
    @Inject(NAMESPACES_SESSION) private importSession: NamespacesSessionInterface,
    private router: Router,
  ) {
    this.conflictFiles = this.importSession.conflictFiles;
    this.namespacesToReplace = [...this.conflictFiles.replace];
  }

  keepNamespace(namespace: string) {
    this.conflictFiles.replace = this.conflictFiles.replace.filter((n: string) => namespace !== n);
  }

  replaceNamespace(namespace: string) {
    this.conflictFiles.replace.push(namespace);
  }

  goToImport() {
    this.router.navigate([{outlets: {'import-namespaces': 'summary'}}]);
  }

  cancel() {
    this.importSession.modalRef.close();
  }
}
