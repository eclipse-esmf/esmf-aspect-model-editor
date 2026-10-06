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

import {HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {HttpErrorInterceptor} from './http-error.interceptor';
import {NotificationsService} from './services';

describe('HttpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let notificationsServiceMock: {error: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    notificationsServiceMock = {
      error: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor,
          multi: true,
        },
        {
          provide: NotificationsService,
          useValue: notificationsServiceMock,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should pass through successful requests', () => {
    const testData = {name: 'Aspect Model'};

    httpClient.get('/api/test').subscribe(data => {
      expect(data).toEqual(testData);
    });

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    req.flush(testData);
  });

  it('should not notify for 400 Bad Request error (handled by caller)', () => {
    httpClient.get('/api/test').subscribe({
      next: () => expect.unreachable('Should fail'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(400);
      },
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Bad Request', {status: 400, statusText: 'Bad Request'});
    expect(notificationsServiceMock.error).not.toHaveBeenCalled();
  });

  it('should not notify for 422 Unprocessable Entity error', () => {
    httpClient.get('/api/test').subscribe({
      next: () => expect.unreachable('Should fail'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(422);
      },
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Unprocessable', {status: 422, statusText: 'Unprocessable Entity'});
    expect(notificationsServiceMock.error).not.toHaveBeenCalled();
  });

  it('should notify and log console.error on 500 Internal Server Error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    httpClient.get('/api/test').subscribe({
      next: () => expect.unreachable('Should fail'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Server Error', {status: 500, statusText: 'Internal Server Error'});

    expect(notificationsServiceMock.error).toHaveBeenCalledWith({
      title: 'Internal Server Error',
      message: 'Please try again later. In case if it happens again, please contact us',
    });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
