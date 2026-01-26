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

import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatOptionModule} from '@angular/material/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import * as locale from 'locale-codes';

import {MatButtonModule} from '@angular/material/button';

@Component({
  standalone: true,
  templateUrl: './language-selector-modal.component.html',
  imports: [MatButtonModule, MatDialogModule, TranslatePipe, MatSelectModule, MatOptionModule, ReactiveFormsModule],
})
export class LanguageSelectorModalComponent {
  private dialogRef = inject(MatDialogRef<LanguageSelectorModalComponent>);
  private languageService = inject(SammLanguageSettingsService);

  public languages: locale.ILocale[] = [];
  public languageControl: FormControl;

  constructor() {
    this.languages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.languageControl = new FormControl(this.languages[0].tag);

    if (this.languages.length === 1) {
      this.dialogRef.close(this.languages[0].tag);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  selectLanguage() {
    this.dialogRef.close(this.languageControl.value);
  }
}
