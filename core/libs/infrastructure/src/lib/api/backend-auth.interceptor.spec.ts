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

import {BackendStatusService} from '@ame/shared';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {BACKEND_TOKEN_HEADER, backendAuthInterceptor} from './backend-auth.interceptor';

describe('backendAuthInterceptor', () => {
  const token = signal<string | null>('secret');
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    token.set('secret');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([backendAuthInterceptor])),
        provideHttpClientTesting(),
        {provide: BackendStatusService, useValue: {authToken: token, serviceUrl: signal('http://localhost:30001')}},
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adds the token to backend requests', () => {
    http.post('http://localhost:30001/ame/api/models/validate', null).subscribe();
    expect(httpMock.expectOne('http://localhost:30001/ame/api/models/validate').request.headers.get(BACKEND_TOKEN_HEADER)).toBe('secret');
  });

  it('does not leak the token to other hosts or ports', () => {
    http.get('./assets/i18n/en.json').subscribe();
    http.get('http://localhost:300012/ame/api/models').subscribe();
    http.get('https://example.org/model.ttl').subscribe();

    for (const url of ['./assets/i18n/en.json', 'http://localhost:300012/ame/api/models', 'https://example.org/model.ttl']) {
      expect(httpMock.expectOne(url).request.headers.has(BACKEND_TOKEN_HEADER)).toBe(false);
    }
  });

  it('leaves requests untouched without a token', () => {
    token.set(null);
    http.get('http://localhost:30001/ame/api/models').subscribe();
    expect(httpMock.expectOne('http://localhost:30001/ame/api/models').request.headers.has(BACKEND_TOKEN_HEADER)).toBe(false);
  });
});
