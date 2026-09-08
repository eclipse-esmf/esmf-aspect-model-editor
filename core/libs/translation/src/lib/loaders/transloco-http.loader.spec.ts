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
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {TranslocoHttpLoader} from './transloco-http.loader';

describe('TranslocoHttpLoader', () => {
  let loader: TranslocoHttpLoader;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslocoHttpLoader, provideHttpClient(), provideHttpClientTesting()],
    });

    loader = TestBed.inject(TranslocoHttpLoader);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(loader).toBeTruthy();
  });

  it('should request the translation file for the given language via a GET request', () => {
    const mockTranslation = {loadModal: {title: 'Load a Model'}};
    let result: unknown;

    loader.getTranslation('en').subscribe(translation => (result = translation));

    const req = httpMock.expectOne('./assets/i18n/en.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockTranslation);

    expect(result).toEqual(mockTranslation);
  });

  it('should build the request url based on the provided language code', () => {
    loader.getTranslation('zh').subscribe();

    const req = httpMock.expectOne('./assets/i18n/zh.json');
    req.flush({});
  });
});
