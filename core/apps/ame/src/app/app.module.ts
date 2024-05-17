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

import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {EditorCanvasModule} from './components/editor-canvas/editor-canvas.module';
import {CommonModule} from '@angular/common';
import {MxGraphModule} from '@ame/mx-graph';
import {DomainModelToRdfModule} from '@ame/aspect-exporter';
import {SettingDialogModule} from '@ame/settings-dialog';
import {APP_CONFIG, config, LogService} from '@ame/shared';
import {ToastrModule} from 'ngx-toastr';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MigratorModule} from '@ame/migrator';
import {LoadingComponent} from './components/loading/loading.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

@NgModule({
  declarations: [AppComponent, LoadingComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    EditorCanvasModule,
    SettingDialogModule,
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
        deps: [HttpClient]
      }
    })
  ],
  providers: [LogService, {provide: APP_CONFIG, useValue: config}],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
