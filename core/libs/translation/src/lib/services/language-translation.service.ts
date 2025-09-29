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

import {HttpClient} from '@angular/common/http';
import {DestroyRef, inject, Injectable} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {Observable, switchMap, tap} from 'rxjs';
import {Translation} from '../models/language.interface';

@Injectable({providedIn: 'root'})
export class LanguageTranslationService {
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);
  private http = inject(HttpClient);

  private readonly _supportedLanguages = [
    {code: 'en', language: 'ENGLISH'},
    {code: 'zh', language: 'CHINESE'},
  ];

  public language: Translation;

  get supportedLanguages(): {code: string; language: string}[] {
    return this._supportedLanguages;
  }

  get translateService(): TranslateService {
    return this.translate;
  }

  initTranslationService(language: string): void {
    this.translate.addLangs(this._supportedLanguages.map(language => language.code));
    this.translate.use(language);

    this.translate.onLangChange
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((event: LangChangeEvent) => this.getTranslation(event.lang)),
      )
      .subscribe();
  }

  getTranslation(language: string): Observable<Translation> {
    return this.http.get<Translation>(`/assets/i18n/${language}.json`).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((translation: Translation) => (this.language = translation)),
    );
  }
}
