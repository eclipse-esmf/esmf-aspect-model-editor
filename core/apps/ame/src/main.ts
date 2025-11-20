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

import {AppComponent} from '@ame/app/app.component';
import {APP_ROUTES} from '@ame/app/app.routes';
import {APP_CONFIG, config} from '@ame/shared';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {enableProdMode, importProvidersFrom} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {PreloadAllModules, provideRouter, withPreloading} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {environment} from 'environments/environment';
import {ToastrModule} from 'ngx-toastr';

if (environment.production) {
  enableProdMode();
  console.groupCollapsed = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
}

const bootstrap = () =>
  bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
      provideHttpClient(withInterceptorsFromDi()),
      importProvidersFrom(BrowserAnimationsModule),
      importProvidersFrom(
        ToastrModule.forRoot(),
        TranslateModule.forRoot({
          fallbackLang: 'en',
          loader: provideTranslateHttpLoader({prefix: './assets/i18n/', suffix: '.json'}),
        }),
      ),
      {provide: APP_CONFIG, useValue: config},
    ],
  });

bootstrap().catch(err => console.log(err));
