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

import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {SammLanguageSettingsService} from './samm-language-settings.service';

describe('SammLanguageSettingsService', () => {
  let service: SammLanguageSettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [SammLanguageSettingsService],
    });
    service = TestBed.inject(SammLanguageSettingsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default language "en" when storage is empty', () => {
    expect(service.getSammLanguageCodes()).toEqual(['en']);
    expect(JSON.parse(localStorage.getItem('languageCodes') || '[]')).toEqual(['en']);
  });

  it('should load initial languages from localStorage if available', () => {
    localStorage.setItem('languageCodes', JSON.stringify(['de', 'fr']));
    const newService = new SammLanguageSettingsService();
    expect(newService.getSammLanguageCodes()).toEqual(['de', 'fr']);
  });

  it('should set SAMM language codes and update localStorage', () => {
    service.setSammLanguageCodes(['en', 'de', 'es']);
    expect(service.getSammLanguageCodes()).toEqual(['en', 'de', 'es']);
    expect(JSON.parse(localStorage.getItem('languageCodes') || '[]')).toEqual(['en', 'de', 'es']);
  });

  it('should clear languages and remove item from localStorage when empty array is passed', () => {
    service.setSammLanguageCodes([]);
    expect(service.getSammLanguageCodes()).toEqual([]);
    expect(localStorage.getItem('languageCodes')).toBeNull();
  });

  it('should add unique SAMM language code', () => {
    service.setSammLanguageCodes(['en']);
    service.addSammLanguageCode('de');
    expect(service.getSammLanguageCodes()).toEqual(['en', 'de']);

    // Should not add duplicates
    service.addSammLanguageCode('en');
    expect(service.getSammLanguageCodes()).toEqual(['en', 'de']);
  });
});
