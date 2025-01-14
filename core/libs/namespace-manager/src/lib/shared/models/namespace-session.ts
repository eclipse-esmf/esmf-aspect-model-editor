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

import {MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {RootExportNamespacesComponent} from '../../namespace-exporter/components';
import {RootNamespacesImporterComponent} from '../../namespace-importer/components';

export interface NamespacesSessionInterface {
  modalRef: MatDialogRef<RootNamespacesImporterComponent | RootExportNamespacesComponent>;
  file: File;
  workspaceFiles: Array<{model: string}>;
  state: {
    validating$: BehaviorSubject<boolean>;
    importing$: BehaviorSubject<boolean>;
  };
}

export class NamespacesSession implements NamespacesSessionInterface {
  public modalRef: MatDialogRef<RootNamespacesImporterComponent>;
  public file: File = undefined;
  public workspaceFiles: Array<{model: string}> = [];

  public state = {
    validating$: new BehaviorSubject(false),
    importing$: new BehaviorSubject(false),
  };

  public parseResponse(file: File, validationResult: Array<{model: string}>) {
    this.file = file;
    this.workspaceFiles = validationResult || [];
  }
}
