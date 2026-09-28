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

import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Settings} from '../model';

const DEFAULT_SETTINGS: Settings = {
  namespace: '',
  version: '',
  showEditorNav: true,
  showEditorMap: true,
  autoSaveEnabled: true,
  autoValidationEnabled: true,
  autoFormatEnabled: true,
  enableHierarchicalLayout: true,
  darkMode: false,
  validationTimerSeconds: 400,
  saveTimerSeconds: 60,
  showConnectionLabels: true,
  useSaturatedColors: false,
  copyrightHeader: [],
  aspectModelLanguages: [],
  toolbarVisibility: true,
};

@Injectable({providedIn: 'root'})
export class ConfigurationService {
  private readonly SETTINGS_ITEM_KEY = 'settings';
  private settings: Settings;
  private readonly _settings$: BehaviorSubject<Settings>;
  public readonly settings$: Observable<Settings>;

  constructor() {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(this.SETTINGS_ITEM_KEY) : null;
      this.settings = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;

      // Default to english if no languages are set
      if (!this.settings.aspectModelLanguages || this.settings.aspectModelLanguages.length === 0) {
        this.settings.aspectModelLanguages = ['en'];
      }
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }
    this._settings$ = new BehaviorSubject<Settings>({...this.settings});
    this.settings$ = this._settings$.asObservable();
  }

  dispatchSettings$(): void {
    this._settings$.next({...this.settings});
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
    this._settings$.next({...settings});
    this.setLocalStorageItem();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.SETTINGS_ITEM_KEY, JSON.stringify(this.settings));
    }
  }

  setLocalStorageItem(settings?: Settings): void {
    const settingsToSave = settings || this.settings;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.SETTINGS_ITEM_KEY, JSON.stringify(settingsToSave));
    }
    this.dispatchSettings$();
  }

  getSettings(): Settings {
    if (this.settings) {
      if (!this.settings.validationTimerSeconds) {
        this.settings.validationTimerSeconds = 400;
      }

      if (!this.settings.saveTimerSeconds) {
        this.settings.saveTimerSeconds = 60;
      }

      return this.settings;
    }

    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.SETTINGS_ITEM_KEY);
      if (stored) {
        this.settings = JSON.parse(stored);
      }
    }

    return this.settings || DEFAULT_SETTINGS;
  }

  toggleEditorMap(): void {
    // Mutates the original object. Can be removed once all components start relying on Observable stream.
    this.settings.showEditorMap = !this.settings.showEditorMap;
    this.setSettings(this.settings);
  }

  toggleToolbar(): void {
    this.settings.toolbarVisibility = !this.settings.toolbarVisibility;
    this.setSettings(this.settings);
  }
}
