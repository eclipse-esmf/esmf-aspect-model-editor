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

import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslocoTestingModule} from '@jsverse/transloco';
import {MockProvider} from 'ng-mocks';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LanguageSelectorModalComponent} from './language-selector-modal.component';

describe('LanguageSelectorModalComponent', () => {
  let component: LanguageSelectorModalComponent;
  let fixture: ComponentFixture<LanguageSelectorModalComponent>;
  let dialogRef: MatDialogRef<LanguageSelectorModalComponent>;

  beforeEach(async () => {
    dialogRef = {
      close: vi.fn(),
    } as unknown as MatDialogRef<LanguageSelectorModalComponent>;

    await TestBed.configureTestingModule({
      imports: [
        LanguageSelectorModalComponent,
        BrowserAnimationsModule,
        TranslocoTestingModule.forRoot({langs: {en: {}}, translocoConfig: {availableLangs: ['en'], defaultLang: 'en'}}),
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        MockProvider(SammLanguageSettingsService, {
          getSammLanguageCodes: vi.fn(() => ['en', 'de']),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSelectorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load languages', () => {
    expect(component).toBeTruthy();
    expect(component.languages().length).toBe(2);
    expect(component.languageModel().language).toBe('en');
  });

  it('selectLanguage should close dialog with selected language', () => {
    component.languageModel.set({language: 'de'});
    component.selectLanguage();

    expect(dialogRef.close).toHaveBeenCalledWith('de');
  });

  it('cancel should close dialog', () => {
    component.cancel();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
