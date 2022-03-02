/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {iif, Observable, of, throwError} from 'rxjs';
import {catchError, concatMap, delay, retryWhen} from 'rxjs/operators';
import {LogService} from './log.service';
import {NotificationsService} from './notifications.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private loggerService: LogService, private notificationsService: NotificationsService) {}

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
          delay(2000)
        )
      ),
      catchError(error => {
        // Skip handling of 400 which must be done in the related component
        if (!this.isError400(error) && !this.isError422(error)) {
          const messageDetail = 'Please try again later. In case if it happens again, please contact us';
          this.notificationsService.error(error.statusText, messageDetail);
          this.loggerService.logError(
            `Oops! We're sorry! An error (${error.status} ${error.statusText}) happened we could not handle.  ${messageDetail}`
          );
        }
        return throwError(error);
      })
    );
  }
}
