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

import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, iif, of, throwError} from 'rxjs';
import {catchError, concatMap, delay, retryWhen} from 'rxjs/operators';
import {NotificationsService} from './services';

@Injectable({providedIn: 'root'})
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private notificationsService: NotificationsService) {}

  private isError400(error): boolean {
    return error instanceof HttpErrorResponse && error.status === 400;
  }

  private isError422(error): boolean {
    return error instanceof HttpErrorResponse && error.status === 422;
  }

  private isError404(error): boolean {
    return error instanceof HttpErrorResponse && error.status === 404;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retryWhen(errors =>
        errors.pipe(
          concatMap((error, index) => iif(() => index < 3 && this.isError404(error), of(error), throwError(error))),
          delay(2000),
        ),
      ),
      catchError(error => {
        // Skip handling of 400 which must be done in the related component
        if (!this.isError400(error) && !this.isError422(error)) {
          const messageDetail = 'Please try again later. In case if it happens again, please contact us';
          this.notificationsService.error({title: error.statusText, message: messageDetail});
          console.error(
            `Oops! We're sorry! An error (${error.status} ${error.statusText}) happened we could not handle.  ${messageDetail}`,
          );
        }
        return throwError(error);
      }),
    );
  }
}
