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
import {Component, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {WorkspaceSummaryComponent, NAMESPACES_SESSION} from '../../../shared';
import {NamespacesSessionInterface, MissingElement} from '../../../shared/models';
import {take, tap} from 'rxjs/operators';
import {ElectronSignals, ElectronSignalsService} from '@ame/shared';

@Component({
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class ImportSummaryComponent {
  private importSession: NamespacesSessionInterface = inject(NAMESPACES_SESSION);
  private electronSignalsService: ElectronSignals = inject(ElectronSignalsService);

  public missingElements: MissingElement[] = this.importSession.missingElements;

  constructor(
    private dialogRef: MatDialogRef<WorkspaceSummaryComponent>,
    private fileHandlingService: FileHandlingService,
  ) {}

  importFiles() {
    this.dialogRef.close();
    this.importSession.state.importing$.next(true);

    return this.fileHandlingService
      .importFilesToWorkspace(this.importSession.files, this.importSession.conflictFiles)
      .pipe(
        tap(() => this.importSession.state.importing$.next(false)),
        take(1),
      )
      .subscribe(() => {
        this.electronSignalsService.call('requestRefreshWorkspaces');
      });
  }
}
