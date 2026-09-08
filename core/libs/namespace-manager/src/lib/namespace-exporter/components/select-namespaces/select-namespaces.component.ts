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

import {ModelApiService} from '@ame/api';
import {ModelCheckerService} from '@ame/editor';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {KeyValuePipe} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslocoDirective} from '@jsverse/transloco';
import {finalize} from 'rxjs';

@Component({
  templateUrl: './select-namespaces.component.html',
  styleUrls: ['select-namespaces.component.scss'],
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    KeyValuePipe,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinner,
    MatRadioGroup,
    MatRadioButton,
    FormsModule,
    TranslocoDirective,
  ],
})
export class SelectNamespacesComponent implements OnInit {
  private readonly modelApiService = inject(ModelApiService);
  private readonly modelCheckerService = inject(ModelCheckerService);
  private readonly notificationService = inject(NotificationsService);
  private readonly translate = inject(LanguageTranslationService);
  private readonly dialogRef = inject(MatDialogRef<SelectNamespacesComponent>);

  public readonly entries = signal<Record<string, {namespace: string; model: string; version: string}> | undefined>(undefined);
  public readonly extracting = signal(false);
  public readonly selectedKey = signal('');

  ngOnInit(): void {
    this.extracting.set(true);
    this.modelCheckerService
      .detectWorkspace(true)
      .pipe(finalize(() => this.extracting.set(false)))
      .subscribe({
        next: values => {
          if (values && Object.keys(values).length === 0) {
            this.notificationService.info({
              title: 'Nothing to export',
              message: 'There are no namespaces available to export in the current workspace.',
            });

            this.dialogRef.close();
          }
          this.entries.set(values);
        },
        error: err => {
          this.notificationService.error({
            title: 'Error detecting namespaces',
            message: 'There is a problem to detect the workspace namespaces: ' + (err?.message || err),
          });
          this.dialogRef.close();
        },
      });
  }

  export(): void {
    const key = this.selectedKey();
    if (!key) {
      return;
    }
    this.modelApiService.fetchExportPackage(key).subscribe({
      next: response => {
        const url = URL.createObjectURL(response);
        this.downloadFile(url);
        this.dialogRef.close();
      },
      error: () => {
        this.notificationService.error({
          title: this.translate?.language?.notificationService?.namespaceExportFailure ?? 'Export Failed',
          message: this.translate?.language?.notificationService?.internalExportError ?? 'Internal export error occurred.',
        });
      },
    });
  }

  private downloadFile(url: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namespaces.zip';
    a.click();
  }
}
