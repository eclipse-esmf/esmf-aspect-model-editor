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

import {HttpClient, provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {enableProdMode, importProvidersFrom, inject, provideZonelessChangeDetection} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {PreloadAllModules, provideRouter, withPreloading} from '@angular/router';
import {provideTransloco, Translation, TranslocoLoader} from '@jsverse/transloco';
import {environment} from 'environments/environment';
import {ToastrModule} from 'ngx-toastr';
import {AppComponent} from './app/app.component';
import {provideAme} from './app/app.config';
import {APP_ROUTES} from './app/app.routes';
import {TOAST_CONFIG} from './app/toast.config';

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
      importProvidersFrom(ToastrModule.forRoot(TOAST_CONFIG)),
      provideTransloco({
        config: {
          availableLangs: ['en', 'zh'],
          defaultLang: 'en',
          fallbackLang: 'en',
          reRenderOnLangChange: true,
          prodMode: environment.production,
        },
        loader: class implements TranslocoLoader {
          private readonly http = inject(HttpClient);

          getTranslation(lang: string) {
            return this.http.get<Translation>(`./assets/i18n/${lang}.json`);
          }
        },
      }),
      provideAme(),
    ],
  });

bootstrap().catch(err => console.log(err));
