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
import {MigratorApiService} from '@ame/api';
import {APP_CONFIG} from '@ame/shared';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockObject} from 'jest-helpers';
import {of} from 'rxjs';
import {MigratorService} from '../../migrator.service';

import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';
import {TranslateModule} from '@ngx-translate/core';
import {StartMigratingComponent} from './start-migrating.component';

describe('StartMigratingComponent', () => {
  let component: StartMigratingComponent;
  let fixture: ComponentFixture<StartMigratingComponent>;
  let migratorApiService: MigratorApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatDialogModule,
        MatCheckboxModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        TranslateModule.forRoot(),
        LanguageTranslateModule,
      ],
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
          provide: MigratorService,
          useValue: provideMockObject(MigratorService),
        },
        {
          provide: LanguageTranslationService,
          useValue: provideMockObject(LanguageTranslationService),
        },
      ],
    });

    migratorApiService = TestBed.inject(MigratorApiService);
    migratorApiService.createBackup = jest.fn(() => of());

    fixture = TestBed.createComponent(StartMigratingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
