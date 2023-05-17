/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {ModelApiService} from '@ame/api';
import {EditorService} from '@ame/editor';
import {NotificationsService} from '@ame/shared';
import {Component, Inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {WorkspaceSummaryComponent, NAMESPACES_SESSION} from '../../../shared';
import {NamespacesSessionInterface, MissingElement} from '../../../shared/models';

@Component({
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class ImportSummaryComponent {
  public missingElements: MissingElement[] = this.importSession.missingElements;

  constructor(
    private notificationService: NotificationsService,
    private editorService: EditorService,
    private modelApiService: ModelApiService,
    private dialogRef: MatDialogRef<WorkspaceSummaryComponent>,
    @Inject(NAMESPACES_SESSION) private importSession: NamespacesSessionInterface
  ) {}

  importFiles() {
    this.importSession.state.importing$.next(true);
    const files = this.importSession.files;
    const {replace, keep} = this.importSession.conflictFiles;
    const toOverwrite = Array.from(new Set([...keep, ...replace])).map(namespace => ({
      namespace,
      files: files.filter(file => file.startsWith(namespace)).map(file => file.replace(`${namespace}:`, '')),
    }));

    this.modelApiService.replaceFiles(toOverwrite).subscribe({
      next: () => {
        this.importSession.state.importing$.next(false);
        this.notificationService.success({title: `Package was imported`});

        toOverwrite.forEach(entry =>
          entry.files.forEach(file => this.editorService.addAspectModelFileIntoStore(`${entry.namespace}:${file}`).subscribe())
        );
        this.dialogRef.close();
      },
      error: httpError => {
        // @TODO: Temporary check until file blockage is fixed
        if (!httpError.error?.error?.message?.includes('packages-to-import')) {
          this.notificationService.error({title: `Something went wrong. Please retry to upload the namespaces`});
        } else {
          this.notificationService.success({title: `Package was imported`});
        }
        this.dialogRef.close();
      },
    });
  }
}
