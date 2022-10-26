/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
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
import {StartLoadModalComponent} from './components/start-load-modal/start-load-modal.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MigratorModule} from '@ame/migrator';

@NgModule({
  declarations: [AppComponent, StartLoadModalComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
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
  ],
  providers: [LogService, {provide: APP_CONFIG, useValue: config}],
  bootstrap: [AppComponent],
})
export class AppModule {}
