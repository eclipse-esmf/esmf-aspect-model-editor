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
import {Component, inject, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {MatOptionModule} from '@angular/material/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {TranslocoDirective} from '@jsverse/transloco';
import * as locale from 'locale-codes';

import {MatButtonModule} from '@angular/material/button';

@Component({
  templateUrl: './language-selector-modal.component.html',
  imports: [MatButtonModule, MatDialogModule, TranslocoDirective, MatSelectModule, MatOptionModule, FormField],
})
export class LanguageSelectorModalComponent {
  private dialogRef = inject(MatDialogRef<LanguageSelectorModalComponent>);
  private languageService = inject(SammLanguageSettingsService);

  public languages = signal<locale.ILocale[]>([]);
  public languageModel = signal<{language: string}>({language: ''});
  public languageForm = form(this.languageModel);

  constructor() {
    const sammLanguages = this.languageService.getSammLanguageCodes().map(tag => locale.getByTag(tag));
    this.languages.set(sammLanguages);
    if (sammLanguages.length > 0) {
      this.languageModel.set({language: sammLanguages[0].tag});
    }

    if (sammLanguages.length === 1) {
      this.dialogRef.close(sammLanguages[0].tag);
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  selectLanguage() {
    this.dialogRef.close(this.languageModel().language);
  }
}
