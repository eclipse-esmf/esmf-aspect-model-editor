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

import {enableProdMode, importProvidersFrom} from '@angular/core';
import {environment} from 'environments/environment';
import {bootstrapApplication, BrowserModule} from '@angular/platform-browser';
import {AppComponent} from '@ame/app/app.component';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {DomainModelToRdfModule} from '@ame/aspect-exporter';
import {MxGraphModule} from '@ame/mx-graph';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ToastrModule} from 'ngx-toastr';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MigratorModule} from '@ame/migrator';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {EditorToolbarModule} from '@ame/editor';
import {APP_CONFIG, config, httpLoaderFactory, LogService} from '@ame/shared';
import {provideAnimations} from '@angular/platform-browser/animations';
import {PreloadAllModules, provideRouter, withDebugTracing, withPreloading} from '@angular/router';
import {APP_ROUTES} from '@ame/app/app.routes';

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
        CommonModule,
        BrowserModule,
        DomainModelToRdfModule,
        MxGraphModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        ToastrModule.forRoot(),
        MatButtonModule,
        FormsModule,
        MigratorModule,
        TranslateModule.forRoot({
          defaultLanguage: 'en',
          loader: {
            provide: TranslateLoader,
            useFactory: httpLoaderFactory,
            deps: [HttpClient],
          },
        }),
        EditorToolbarModule,
        NgOptimizedImage,
      ),
      LogService,
      {provide: APP_CONFIG, useValue: config},
      provideAnimations(),
      provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
      provideHttpClient(withInterceptorsFromDi()),
    ],
  });

bootstrap().catch(err => console.log(err));
