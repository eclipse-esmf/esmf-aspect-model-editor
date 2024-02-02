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
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockObject} from 'jest-helpers';
import {of} from 'rxjs';
import {VersionMigrationComponent} from './version-migration.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

describe('VersionMigrationComponent', () => {
  let component: VersionMigrationComponent;
  let fixture: ComponentFixture<VersionMigrationComponent>;
  let modelApiService: ModelApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatIconModule,
        TranslateModule.forRoot({
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
          deps: [HttpClient],
        }),
      ],
      declarations: [VersionMigrationComponent],
      providers: [
        {
          provide: APP_CONFIG,
          useValue: {
            currentSammVersion: '2.1.0',
          },
        },
        {
          provide: MigratorApiService,
          useValue: provideMockObject(MigratorApiService),
        },
        {
          provide: ElectronTunnelService,
          useValue: provideMockObject(ElectronTunnelService),
        },
        {
          provide: RdfService,
          useValue: provideMockObject(RdfService),
        },
        {
          provide: ModelApiService,
          useValue: provideMockObject(ModelApiService),
        },
        {
          provide: EditorService,
          useValue: {
            settings: {},
            loadExternalModels: jest.fn(() => of()),
          },
        },
      ],
    });

    modelApiService = TestBed.inject(ModelApiService);
    modelApiService.getNamespacesStructure = jest.fn(() => of([]));

    fixture = TestBed.createComponent(VersionMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
