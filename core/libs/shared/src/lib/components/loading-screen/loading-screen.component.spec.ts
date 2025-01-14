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

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LoadingScreenComponent} from '@ame/shared';
import {LanguageTranslateModule, LanguageTranslationService} from '@ame/translation';
import {CommonModule} from '@angular/common';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {beforeEach, describe, expect, it} from '@jest/globals';
import {TranslateModule} from '@ngx-translate/core';
import {provideMockObject} from '../../../../../../jest-helpers';

describe('LoadingScreenComponent', () => {
  let component: LoadingScreenComponent;
  let fixture: ComponentFixture<LoadingScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, MatDialogModule, MatProgressBarModule, MatButtonModule, TranslateModule.forRoot(), LanguageTranslateModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {provide: MatDialogRef, useValue: {}},
        {
          provide: LanguageTranslationService,
          useValue: provideMockObject(LanguageTranslationService),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
