/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {Settings} from '../model/settings';

const DEFAULT_SETTINGS: Settings = {
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
};

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly SETTINGS_ITEM_KEY: string = 'settings';
  private settings: Settings;
  private _settings$: BehaviorSubject<Settings>;

  public settings$: Observable<Settings>;

  constructor() {
    try {
      this.settings = JSON.parse(localStorage.getItem(this.SETTINGS_ITEM_KEY)) || DEFAULT_SETTINGS;
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }

    this._settings$ = new BehaviorSubject({...this.settings});
    this.settings$ = this._settings$.asObservable();
  }

  dispatchSettings$() {
    this._settings$.next({...this.settings});
  }

  setSettings(settings: Settings) {
    this.settings = settings;
    this._settings$.next({...settings});
    localStorage.setItem(this.SETTINGS_ITEM_KEY, JSON.stringify(this.settings));
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
