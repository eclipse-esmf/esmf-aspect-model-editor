/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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

import {provideMockObject} from '@ame/test-helpers';
import {LanguageTranslationService} from '@ame/translation';
import {CommonModule} from '@angular/common';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LoadingScreenOptions} from '../../services/loading-screen.service';
import {LoadingScreenComponent} from './loading-screen.component';

describe('LoadingScreenComponent', () => {
  let component: LoadingScreenComponent;
  let fixture: ComponentFixture<LoadingScreenComponent>;
  let dialogRefMock: {close: ReturnType<typeof vi.fn>};
  let loadingData: LoadingScreenOptions;

  beforeEach(async () => {
    dialogRefMock = {
      close: vi.fn(),
    };

    loadingData = {
      title: 'Loading Data',
      content: 'Please wait...',
      hasCloseButton: true,
      closeButtonAction: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatDialogModule,
        MatProgressBarModule,
        MatButtonModule,
        TranslocoTestingModule.forRoot({
          langs: {en: {loadingScreenDialog: {generalWaitMessage: 'Please wait'}}},
          translocoConfig: {availableLangs: ['en'], defaultLang: 'en'},
        }),
        LoadingScreenComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: loadingData},
        {provide: MatDialogRef, useValue: dialogRefMock},
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

  it('should create and display title and content', () => {
    expect(component).toBeTruthy();
    expect(component.data.title).toBe('Loading Data');
    expect(component.data.content).toBe('Please wait...');
  });

  it('close() should call closeButtonAction and close dialog', () => {
    component.close();
    expect(loadingData.closeButtonAction).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('close() should handle missing closeButtonAction', () => {
    component.data.closeButtonAction = undefined;
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
