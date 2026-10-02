/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {FileHandlingPort, NamespacesTransferPort} from '@ame/domain';
import {createFile, FileInfo, FileTypes, FileUploadService, TauriSignalsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {environment} from 'environments/environment';
import {Observable, of, switchMap} from 'rxjs';
import {take} from 'rxjs/operators';
import {SelectNamespacesComponent} from '../../namespace-exporter/components';

@Injectable({providedIn: 'root'})
export class NamespacesManagerService implements NamespacesTransferPort {
  private readonly matDialog = inject(MatDialog);
  private readonly fileHandlingService = inject(FileHandlingPort);
  private readonly tauriSignalsService = inject(TauriSignalsService);
  private readonly fileUploadService = inject(FileUploadService);

  constructor() {
    if (!environment.production && typeof window !== 'undefined') {
      window['angular.namespacesManagerService'] = this;
    }
  }

  onImportNamespaces(fileInfo?: FileInfo): void {
    this.resolveNamespacesFile(fileInfo)
      .pipe(switchMap(file => this.importNamespaces(file)))
      .subscribe(() => this.tauriSignalsService.call('requestRefreshWorkspaces'));
  }

  resolveNamespacesFile(fileInfo?: FileInfo): Observable<File> {
    return fileInfo ? of(createFile(fileInfo.content, fileInfo.name, FileTypes.ZIP)) : this.fileUploadService.selectFile([FileTypes.ZIP]);
  }

  importNamespaces(zip: File): Observable<unknown> {
    return this.fileHandlingService.importFilesToWorkspace(zip).pipe(take(1));
  }

  onExportNamespaces(): void {
    this.matDialog.open(SelectNamespacesComponent, {disableClose: true});
  }
}
