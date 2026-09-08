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
import {Settings} from '../model';
import {ConfigurationService} from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ConfigurationService],
    });
    service = TestBed.inject(ConfigurationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created with default settings', () => {
    expect(service).toBeTruthy();
    const settings = service.getSettings();
    expect(settings).toBeDefined();
    expect(settings.autoSaveEnabled).toBe(true);
    expect(settings.saveTimerSeconds).toBe(60);
    expect(settings.autoValidationEnabled).toBe(true);
    expect(settings.validationTimerSeconds).toBe(400);
    expect(settings.aspectModelLanguages).toEqual(['en']);
  });

  it('should get settings and fallback missing timer seconds', () => {
    const customSettings: Settings = {
      namespace: 'org.example',
      version: '1.0.0',
      showEditorNav: true,
      showEditorMap: true,
      autoSaveEnabled: false,
      autoValidationEnabled: false,
      autoFormatEnabled: false,
      enableHierarchicalLayout: false,
      validationTimerSeconds: 0 as any,
      saveTimerSeconds: 0 as any,
      showConnectionLabels: false,
      useSaturatedColors: false,
      copyrightHeader: ['# Header'],
      aspectModelLanguages: ['de'],
      toolbarVisibility: false,
    };

    service.setSettings(customSettings);
    const retrieved = service.getSettings();
    expect(retrieved.validationTimerSeconds).toBe(400);
    expect(retrieved.saveTimerSeconds).toBe(60);
    expect(retrieved.namespace).toBe('org.example');
  });

  it('should save settings to localStorage and emit on settings$', () => {
    let emittedSettings: Settings | undefined;
    const sub = service.settings$.subscribe(s => (emittedSettings = s));

    const newSettings: Settings = {
      ...service.getSettings(),
      namespace: 'org.bosch',
      version: '2.0.0',
      enableHierarchicalLayout: false,
    };

    service.setSettings(newSettings);

    expect(emittedSettings?.namespace).toBe('org.bosch');
    expect(JSON.parse(localStorage.getItem('settings') || '{}').namespace).toBe('org.bosch');

    sub.unsubscribe();
  });

  it('should toggle editor map and toolbar', () => {
    const initialMap = service.getSettings().showEditorMap;
    service.toggleEditorMap();
    expect(service.getSettings().showEditorMap).toBe(!initialMap);

    const initialToolbar = service.getSettings().toolbarVisibility;
    service.toggleToolbar();
    expect(service.getSettings().toolbarVisibility).toBe(!initialToolbar);
  });

  it('should recover from invalid JSON in localStorage', () => {
    localStorage.setItem('settings', 'INVALID_JSON_HERE');
    const newService = new ConfigurationService();
    expect(newService.getSettings()).toBeDefined();
    expect(newService.getSettings().aspectModelLanguages).toEqual(['en']);
  });
});
