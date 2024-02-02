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

import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {MatDialogModule} from '@angular/material/dialog';
import {RouterTestingModule} from '@angular/router/testing';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MigratorApiService} from '@ame/api';
import {LoadingMigratingComponent} from './loading-migrating.component';
import {provideMockObject} from '../../../../../../jest-helpers';
import {of} from 'rxjs';
import {Router} from '@angular/router';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

describe('LoadingMigratingComponent', () => {
  let fixture: ComponentFixture<LoadingMigratingComponent>;
  let migratorApiService: MigratorApiService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingMigratingComponent],
      imports: [
        MatDialogModule,
        RouterTestingModule,
        MatProgressSpinnerModule,
        TranslateModule.forRoot({
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
          deps: [HttpClient],
        }),
      ],
      providers: [{provide: MigratorApiService, useValue: provideMockObject(MigratorApiService)}],
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
