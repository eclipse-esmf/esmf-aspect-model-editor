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

import {AppComponent} from '@ame/app/app.component';
import {APP_ROUTES} from '@ame/app/app.routes';
import {APP_CONFIG, config} from '@ame/shared';
import {TranslocoHttpLoader} from '@ame/translation';
import {provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {enableProdMode, importProvidersFrom, provideZonelessChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {PreloadAllModules, provideRouter, withPreloading} from '@angular/router';
import {provideTransloco} from '@jsverse/transloco';
import {environment} from 'environments/environment';
import {ToastrModule} from 'ngx-toastr';

(window as any)['global'] = window;

if (environment.production) {
  enableProdMode();
  console.groupCollapsed = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
}

const bootstrap = () =>
  bootstrapApplication(AppComponent, {
    providers: [
      provideZonelessChangeDetection(),
      provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
      provideHttpClient(withXhr(), withInterceptorsFromDi()),
      provideAnimationsAsync(),
      importProvidersFrom(ToastrModule.forRoot()),
      provideTransloco({
        config: {
          availableLangs: ['en', 'zh'],
          defaultLang: 'en',
          fallbackLang: 'en',
          reRenderOnLangChange: true,
          prodMode: environment.production,
        },
        loader: TranslocoHttpLoader,
      }),
      {provide: APP_CONFIG, useValue: config},
    ],
  });

bootstrap().catch(err => console.log(err));
