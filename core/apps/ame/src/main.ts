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
import {DomainModelToRdfModule} from '@ame/aspect-exporter';
import {MIGRATOR_ROUTES} from '@ame/migrator';
import {MxGraphModule} from '@ame/mx-graph';
import {APP_CONFIG, config, httpLoaderFactory} from '@ame/shared';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {enableProdMode, importProvidersFrom} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {PreloadAllModules, provideRouter, withPreloading} from '@angular/router';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {environment} from 'environments/environment';
import {ToastrModule} from 'ngx-toastr';
import {NAMESPACE_EXPORT_ROUTES} from '../../../libs/namespace-manager/src/lib/namespace-exporter';
import {NAMESPACE_IMPORT_ROUTES} from '../../../libs/namespace-manager/src/lib/namespace-importer';

if (environment.production) {
  enableProdMode();
  console.groupCollapsed = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
}

const bootstrap = () =>
  bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(
        ToastrModule.forRoot(),
        DomainModelToRdfModule,
        MxGraphModule,
        TranslateModule.forRoot({
          defaultLanguage: 'en',
          loader: {
            provide: TranslateLoader,
            useFactory: httpLoaderFactory,
            deps: [HttpClient],
          },
        }),
      ),
      provideAnimations(),
      {provide: APP_CONFIG, useValue: config},
      provideRouter(
        [...APP_ROUTES, ...MIGRATOR_ROUTES, ...NAMESPACE_EXPORT_ROUTES, ...NAMESPACE_IMPORT_ROUTES],
        withPreloading(PreloadAllModules),
      ),
      provideHttpClient(withInterceptorsFromDi()),
    ],
  });

bootstrap().catch(err => console.log(err));
