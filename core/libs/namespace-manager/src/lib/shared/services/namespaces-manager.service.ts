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

import {FileHandlingService, FileInfo, FileTypes, FileUploadService} from '@ame/editor';
import {ElectronSignalsService} from '@ame/shared';
import {createFile} from '@ame/utils';
import {Injectable, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of, switchMap} from 'rxjs';
import {take} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment';
import {SelectNamespacesComponent} from '../../namespace-exporter/components';

@Injectable({providedIn: 'root'})
export class NamespacesManagerService {
  private matDialog = inject(MatDialog);
  private fileHandlingService = inject(FileHandlingService);
  private electronSignalsService = inject(ElectronSignalsService);
  private fileUploadService = inject(FileUploadService);

  constructor() {
    if (!environment.production) {
      window['angular.namespacesManagerService'] = this;
    }
  }

  onImportNamespaces(fileInfo?: FileInfo) {
    this.resolveNamespacesFile(fileInfo)
      .pipe(switchMap(file => this.importNamespaces(file)))
      .subscribe(() => this.electronSignalsService.call('requestRefreshWorkspaces'));
  }

  resolveNamespacesFile(fileInfo?: FileInfo): Observable<File> {
    return fileInfo ? of(createFile(fileInfo.content, fileInfo.name, FileTypes.ZIP)) : this.fileUploadService.selectFile([FileTypes.ZIP]);
  }

  importNamespaces(zip: File) {
    return this.fileHandlingService.importFilesToWorkspace(zip).pipe(take(1));
  }

  onExportNamespaces() {
    this.matDialog.open(SelectNamespacesComponent, {disableClose: true});
  }
}
