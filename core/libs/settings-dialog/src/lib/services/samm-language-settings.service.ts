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
export class SammLanguageSettingsService {
  private readonly LANG_CODE_ITEM_KEY: string = 'languageCodes';
  private languages: Array<string> = [];

  constructor() {
    this.loadInitialLanguages();
  }

  private loadInitialLanguages(): void {
    const storedLanguages = localStorage.getItem(this.LANG_CODE_ITEM_KEY);
    if (storedLanguages) {
      this.languages = JSON.parse(storedLanguages);
    } else {
      this.languages = ['en']; // Set default language if none is stored
      this.updateLocalStorage();
    }
  }

  private updateLocalStorage(): void {
    if (this.languages.length > 0) {
      localStorage.setItem(this.LANG_CODE_ITEM_KEY, JSON.stringify(this.languages));
    } else {
      localStorage.removeItem(this.LANG_CODE_ITEM_KEY);
    }
  }

  setSammLanguageCodes(languages: Array<string>): void {
    if (languages && languages.length > 0) {
      this.languages = languages;
    } else {
      this.languages = [];
    }
    this.updateLocalStorage();
  }

  addSammLanguageCode(languageCode: string): void {
    if (languageCode && !this.languages.includes(languageCode)) {
      this.languages.push(languageCode);
      this.updateLocalStorage();
    }
  }

  getSammLanguageCodes(): Array<string> {
    return this.languages;
  }
}
