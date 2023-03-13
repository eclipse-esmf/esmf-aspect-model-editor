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

import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageSettingsService {
  private readonly LANG_CODE_ITEM_KEY: string = 'languageCodes';
  private languages: Array<string>;

  setLanguageCodes(languages: Array<string>) {
    if (languages && languages.length > 0) {
      this.languages = languages;
      localStorage.setItem(this.LANG_CODE_ITEM_KEY, JSON.stringify(languages));
    } else {
      this.languages = null;
      localStorage.removeItem(this.LANG_CODE_ITEM_KEY);
    }
  }

  addLanguageCode(languageCode: string) {
    if (!languageCode && languageCode.length === 0) {
      return;
    }
    const languageCodeTmp = this.getLanguageCodes();
    if (!languageCodeTmp.includes(languageCode)) {
      languageCodeTmp.push(languageCode);
      this.setLanguageCodes(languageCodeTmp);
    }
  }

  getLanguageCodes(): Array<string> {
    if (this.languages) {
      return this.languages;
    }
    if (!localStorage.getItem(this.LANG_CODE_ITEM_KEY)) {
      this.setLanguageCodes(['en']);
    }
    return JSON.parse(localStorage.getItem(this.LANG_CODE_ITEM_KEY));
  }
}
