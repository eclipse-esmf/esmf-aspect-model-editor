/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {LanguageSettingsService} from '@ame/settings-dialog';
import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import * as locale from 'locale-codes';

@Component({
  selector: 'ame-generate-documentation',
  templateUrl: './generate-documentation.component.html',
  styleUrls: ['./generate-documentation.component.scss'],
})
export class GenerateDocumentationComponent {
  public languages: locale.ILocale[] = [];
  public languageControl: FormControl;

  constructor(private dialogRef: MatDialogRef<GenerateDocumentationComponent>, private languageService: LanguageSettingsService) {
    this.languages = this.languageService.getLanguageCodes().map(tag => locale.getByTag(tag));
    this.languageControl = new FormControl(this.languages[0].tag);
  }

  openDocumentation() {
    this.dialogRef.close({language: this.languageControl.value, action: 'open'});
  }

  downloadDocumentation() {
    this.dialogRef.close({language: this.languageControl.value, action: 'download'});
  }

  close() {
    this.dialogRef.close();
  }
}
