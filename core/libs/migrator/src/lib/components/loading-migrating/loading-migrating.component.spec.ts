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
import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';
import {ComponentFixture, TestBed, fakeAsync, flush, tick} from '@angular/core/testing';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {provideMockObject} from '../../../../../../jest-helpers';
import {LoadingMigratingComponent} from './loading-migrating.component';

describe('LoadingMigratingComponent', () => {
  let fixture: ComponentFixture<LoadingMigratingComponent>;
  let migratorApiService: MigratorApiService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, RouterTestingModule, MatProgressSpinnerModule, TranslateModule.forRoot(), LanguageTranslateModule],
      providers: [
        {
          provide: MigratorApiService,
          useValue: provideMockObject(MigratorApiService),
        },
        {
          provide: LanguageTranslationService,
          useValue: provideMockObject(LanguageTranslationService),
        },
      ],
    });

    migratorApiService = TestBed.inject(MigratorApiService);
    migratorApiService.migrateWorkspace = jest.fn(() => of(null));

    router = TestBed.inject(Router);
    router.navigate = jest.fn();

    fixture = TestBed.createComponent(LoadingMigratingComponent);
    fixture.detectChanges();
  });

  it('navigated to next step', fakeAsync(() => {
    tick();
    expect(router.navigate).toHaveBeenCalledWith([{outlets: {migrator: 'status'}}], {state: {data: null}});
    flush();
  }));
});
