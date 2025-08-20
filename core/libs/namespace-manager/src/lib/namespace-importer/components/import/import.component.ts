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

import {FileHandlingService} from '@ame/editor';
import {ElectronSignalsService} from '@ame/shared';
import {Component, Inject, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {take, tap} from 'rxjs/operators';
import {NAMESPACES_SESSION} from '../../../shared';
import {NamespacesSessionInterface} from '../../../shared/models';

@Component({
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton],
})
export class ImportComponent {
  private fileHandlingService = inject(FileHandlingService);
  private electronSignalsService = inject(ElectronSignalsService);

  public workspaceFiles: Array<{model: string}>;

  constructor(
    private dialogRef: MatDialogRef<ImportComponent>,
    @Inject(NAMESPACES_SESSION) private importSession: NamespacesSessionInterface,
  ) {
    this.workspaceFiles = this.importSession.workspaceFiles;

    if (!this.workspaceFiles.length) {
      this.importFiles();
    }
  }

  cancel() {
    this.importSession.modalRef.close();
  }

  importFiles() {
    this.dialogRef.close();
    this.importSession.state.importing$.next(true);

    return this.fileHandlingService
      .importFilesToWorkspace(this.importSession.file)
      .pipe(
        tap(() => this.importSession.state.importing$.next(false)),
        take(1),
      )
      .subscribe(() => {
        this.electronSignalsService.call('requestRefreshWorkspaces');
      });
  }
}
