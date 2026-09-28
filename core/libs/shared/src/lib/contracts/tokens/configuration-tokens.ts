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

import {InjectionToken} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Settings} from '../models/settings';

export interface IConfigurationService {
  readonly settings$: Observable<Settings>;
  getSettings(): Settings;
  setSettings(settings: Settings): void;
  setLocalStorageItem(settings?: Settings): void;
  dispatchSettings$(): void;
  toggleEditorMap(): void;
  toggleToolbar(): void;
}

const defaultSettings: Settings = {
  namespace: '',
  version: '1.0.0',
  showEditorMap: false,
  showEditorNav: false,
  autoSaveEnabled: false,
  autoValidationEnabled: false,
  autoFormatEnabled: false,
  enableHierarchicalLayout: false,
  darkMode: false,
  validationTimerSeconds: 0,
  saveTimerSeconds: 0,
  showConnectionLabels: false,
  useSaturatedColors: false,
  copyrightHeader: [],
  aspectModelLanguages: [],
  toolbarVisibility: true,
};

export const CONFIGURATION_SERVICE = new InjectionToken<IConfigurationService>('CONFIGURATION_SERVICE', {
  providedIn: 'root',
  factory: () => ({
    settings$: of(defaultSettings),
    getSettings: () => defaultSettings,
    setSettings: () => {},
    setLocalStorageItem: () => {},
    dispatchSettings$: () => {},
    toggleEditorMap: () => {},
    toggleToolbar: () => {},
  }),
});
