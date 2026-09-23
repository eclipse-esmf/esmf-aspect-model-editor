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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {PreviewDialogComponent} from './preview-dialog.component';

describe('PreviewDialogComponent', () => {
  let component: PreviewDialogComponent;
  let fixture: ComponentFixture<PreviewDialogComponent>;
  let dialogRef: MatDialogRef<PreviewDialogComponent>;

  const mockData = {
    title: 'JSON Preview',
    content: '{"key": "value"}',
    fileName: 'sample.json',
  };

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<PreviewDialogComponent>;

    await TestBed.configureTestingModule({
      imports: [
        PreviewDialogComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: MAT_DIALOG_DATA, useValue: mockData},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize title and content from data', () => {
    expect(component.title()).toBe(mockData.title);
    expect(component.content()).toBe(mockData.content);
  });

  it('onClose should close the dialog', () => {
    component.onClose();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('reset should revert content to initial value', () => {
    component.content.set('modified content');
    expect(component.content()).toBe('modified content');

    component.reset();
    expect(component.content()).toBe(mockData.content);
  });
});
