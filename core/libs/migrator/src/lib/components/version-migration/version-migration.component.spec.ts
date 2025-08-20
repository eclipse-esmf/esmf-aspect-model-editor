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
import {MigratorApiService, ModelApiService} from '@ame/api';
import {EditorService} from '@ame/editor';
import {RdfService} from '@ame/rdf/services';
import {APP_CONFIG, ElectronTunnelService} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';
import {provideRouter} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {MockProvider} from 'ng-mocks';
import {VersionMigrationComponent} from './version-migration.component';

describe('VersionMigrationComponent', () => {
  let component: VersionMigrationComponent;
  let fixture: ComponentFixture<VersionMigrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, MatProgressSpinnerModule, MatIconModule, TranslateModule.forRoot(), LanguageTranslateModule],
      providers: [
        provideRouter([]),
        {
          provide: APP_CONFIG,
          useValue: {
            currentSammVersion: '2.1.0',
          },
        },
        MockProvider(MigratorApiService, {rdfModelsToMigrate: []}),
        MockProvider(ElectronTunnelService),
        MockProvider(RdfService),
        MockProvider(ModelApiService),
        MockProvider(EditorService),
        MockProvider(LanguageTranslationService),
        MockProvider(MigratorApiService),
      ],
    });

    fixture = TestBed.createComponent(VersionMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
