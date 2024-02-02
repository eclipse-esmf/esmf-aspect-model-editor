/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
import {Langcode, Settings} from '../model';

const DEFAULT_SETTINGS: Settings = {
  namespace: '',
  version: '',
  showEditorNav: true,
  showEditorMap: true,
  autoSaveEnabled: true,
  autoValidationEnabled: true,
  autoFormatEnabled: true,
  enableHierarchicalLayout: true,
  validationTimerSeconds: 400,
  saveTimerSeconds: 60,
  showEntityValueEntityEdge: false,
  showConnectionLabels: true,
  useSaturatedColors: false,
  showAbstractPropertyConnection: true,
  copyrightHeader: [],
  aspectModelLanguages: [],
};

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly SETTINGS_ITEM_KEY: string = 'settings';
  private settings: Settings;

  constructor() {
    try {
      this.settings = JSON.parse(localStorage.getItem(this.SETTINGS_ITEM_KEY)) || DEFAULT_SETTINGS;

      // Default to english if no languages are set
      this.settings.aspectModelLanguages = ['en'];
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
    this.setLocalStorageItem();
    localStorage.setItem(this.SETTINGS_ITEM_KEY, JSON.stringify(this.settings));
  }

  setLocalStorageItem(settings?: Settings): void {
    const settingsToSave = settings || this.settings;
    localStorage.setItem(this.SETTINGS_ITEM_KEY, JSON.stringify(settingsToSave));
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

    if (localStorage.getItem(this.SETTINGS_ITEM_KEY)) {
      this.settings = JSON.parse(localStorage.getItem(this.SETTINGS_ITEM_KEY));
    }

    return this.settings || DEFAULT_SETTINGS;
  }
}
