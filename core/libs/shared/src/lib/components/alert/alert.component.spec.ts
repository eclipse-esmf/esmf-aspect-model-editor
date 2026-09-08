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
import {AlertOptions} from '../../services/alert.service';
import {AlertComponent} from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let dialogRefMock: {close: ReturnType<typeof vi.fn>};
  let alertData: AlertOptions;

  beforeEach(async () => {
    dialogRefMock = {
      close: vi.fn(),
    };

    alertData = {
      title: 'Alert Title',
      content: 'Alert Content',
      leftButtonText: 'Cancel',
      rightButtonText: 'Confirm',
      hasLeftButton: true,
      hasRightButton: true,
      leftButtonAction: vi.fn(),
      rightButtonAction: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatDialogModule,
        MatProgressBarModule,
        MatButtonModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
        AlertComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: alertData},
        {provide: MatDialogRef, useValue: dialogRefMock},
        {
          provide: LanguageTranslationService,
          useValue: provideMockObject(LanguageTranslationService),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render dialog title and content', () => {
    expect(component).toBeTruthy();
    expect(component.data.title).toBe('Alert Title');
    expect(component.data.content).toBe('Alert Content');
  });

  it('close() should call leftButtonAction if provided and close dialog', () => {
    const mouseEvent = new MouseEvent('click');
    component.close(mouseEvent);

    expect(alertData.leftButtonAction).toHaveBeenCalledWith(mouseEvent);
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('ok() should call rightButtonAction if provided and close dialog', () => {
    const mouseEvent = new MouseEvent('click');
    component.ok(mouseEvent);

    expect(alertData.rightButtonAction).toHaveBeenCalledWith(mouseEvent);
    expect(dialogRefMock.close).toHaveBeenCalled();
  });

  it('close() and ok() should handle missing callbacks gracefully', () => {
    component.data.leftButtonAction = undefined;
    component.data.rightButtonAction = undefined;

    const mouseEvent = new MouseEvent('click');
    component.close(mouseEvent);
    expect(dialogRefMock.close).toHaveBeenCalledTimes(1);

    component.ok(mouseEvent);
    expect(dialogRefMock.close).toHaveBeenCalledTimes(2);
  });
});
