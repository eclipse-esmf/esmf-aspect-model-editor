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

import {ModelApiService} from '@ame/api';
import {ModelCheckerService} from '@ame/editor';
import {APP_CONFIG, NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {KeyValuePipe} from '@angular/common';
import {Component, OnInit, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {finalize} from 'rxjs';

@Component({
  standalone: true,
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
    TranslatePipe,
  ],
})
export class SelectNamespacesComponent implements OnInit {
  private modelApiService = inject(ModelApiService);
  private modelCheckerService = inject(ModelCheckerService);
  private notificationService = inject(NotificationsService);
  private translate = inject(LanguageTranslationService);
  private dialogRef = inject(MatDialogRef<SelectNamespacesComponent>);

  public config = inject(APP_CONFIG);

  public entries = undefined;
  public extracting = false;
  public selectedKey: string | null = null;

  ngOnInit(): void {
    this.extracting = true;
    this.modelCheckerService
      .detectWorkspace(true)
      .pipe(finalize(() => (this.extracting = false)))
      .subscribe({
        next: values => {
          if (values && Object.keys(values).length === 0) {
            this.notificationService.info({
              title: 'Nothing to export',
              message: 'There are no namespaces available to export in the current workspace.',
            });

            this.dialogRef.close();
          }
          this.entries = values;
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

  export() {
    this.modelApiService.fetchExportPackage(this.selectedKey).subscribe({
      next: response => {
        const url = URL.createObjectURL(response);
        this.downloadFile(url);
        this.dialogRef.close();
      },
      error: () => {
        this.notificationService.error({
          title: this.translate.language.NOTIFICATION_SERVICE.NAMESPACE_EXPORT_FAILURE,
          message: this.translate.language.NOTIFICATION_SERVICE.INTERNAL_EXPORT_ERROR,
        });
      },
    });
  }

  private downloadFile(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namespaces.zip';
    a.click();
  }
}
