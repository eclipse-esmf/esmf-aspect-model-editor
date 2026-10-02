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

import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {TranslocoService} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {Subject} from 'rxjs';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {LanguageTranslationService} from './language-translation.service';

describe('LanguageTranslationService', () => {
  let service: LanguageTranslationService;
  let httpMock: HttpTestingController;
  let langChanges$: Subject<string>;
  let setAvailableLangs: ReturnType<typeof vi.fn>;
  let setActiveLang: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    langChanges$ = new Subject<string>();
    setAvailableLangs = vi.fn();
    setActiveLang = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        LanguageTranslationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        MockProvider(TranslocoService, {
          setAvailableLangs,
          setActiveLang,
          langChanges$,
        } as Partial<TranslocoService>),
      ],
    });

    service = TestBed.inject(LanguageTranslationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose the list of supported languages', () => {
    expect(service.supportedLanguages).toEqual([
      {code: 'en', language: 'ENGLISH'},
      {code: 'zh', language: 'CHINESE'},
    ]);
  });

  it('should expose the underlying TranslocoService instance', () => {
    expect(service.translateService).toBe(TestBed.inject(TranslocoService));
  });

  it('should register the supported languages and set the active language', () => {
    service.initTranslationService('en');

    expect(setAvailableLangs).toHaveBeenCalledWith(['en', 'zh']);
    expect(setActiveLang).toHaveBeenCalledWith('en');
  });

  it('should fetch and store the translation whenever the active language changes', () => {
    service.initTranslationService('en');

    langChanges$.next('en');

    const req = httpMock.expectOne('./assets/i18n/en.json');
    expect(req.request.method).toBe('GET');
    req.flush({loadModal: {title: 'Load a Model'}});

    expect(service.language).toEqual({loadModal: {title: 'Load a Model'}});
  });

  it('should fetch the translation file for a given language', () => {
    let result: unknown;
    service.getTranslation('zh').subscribe(translation => (result = translation));

    const req = httpMock.expectOne('./assets/i18n/zh.json');
    req.flush({loadModal: {title: '加载模型'}});

    expect(result).toEqual({loadModal: {title: '加载模型'}});
    expect(service.language).toEqual({loadModal: {title: '加载模型'}});
  });
});
