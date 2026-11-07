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
import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';

/** Header the backend started by the desktop shell expects on every request. */
export const BACKEND_TOKEN_HEADER = 'X-AME-Token';

/** Adds the backend token to requests to the backend; other requests (e.g. assets) are left untouched. */
export const backendAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const backendStatus = inject(BackendStatusService);
  const token = backendStatus.authToken();
  const serviceUrl = backendStatus.serviceUrl();

  if (!token || !(req.url === serviceUrl || req.url.startsWith(`${serviceUrl}/`))) {
    return next(req);
  }
  return next(req.clone({setHeaders: {[BACKEND_TOKEN_HEADER]: token}}));
};
