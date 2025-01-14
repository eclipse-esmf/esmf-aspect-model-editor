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
import {APP_CONFIG, AppConfig, NotificationsService} from '@ame/shared';
import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';
import {KeyValuePipe} from '@angular/common';
import {Component, Inject, OnInit, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  standalone: true,
  templateUrl: './select-namespaces.component.html',
  styleUrls: ['select-namespaces.component.scss'],
  imports: [
    MatDialogModule,
    LanguageTranslateModule,
    MatCheckboxModule,
    KeyValuePipe,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinner,
    MatRadioGroup,
    MatRadioButton,
    FormsModule,
  ],
})
export class SelectNamespacesComponent implements OnInit {
  private modelApiService = inject(ModelApiService);
  private modelCheckerService = inject(ModelCheckerService);
  private notificationService = inject(NotificationsService);
  private translate = inject(LanguageTranslationService);

  entries = undefined;
  extracting = false;
  selectedKey: string | null = null;

  constructor(
    @Inject(APP_CONFIG) public config: AppConfig,
    private dialogRef: MatDialogRef<SelectNamespacesComponent>,
  ) {}

  ngOnInit(): void {
    this.extracting = true;
    this.modelCheckerService.detectWorkspace().subscribe(values => {
      this.entries = values;
      this.extracting = false;
    });
  }

  export() {
    this.modelApiService.getExportZipFile(this.selectedKey).subscribe({
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
