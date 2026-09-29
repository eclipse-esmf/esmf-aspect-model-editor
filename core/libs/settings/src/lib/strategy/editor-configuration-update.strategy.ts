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

import {EditorThemePort, GraphSettingsPort} from '@ame/domain';
import {inject, Injectable} from '@angular/core';
import {Settings, SettingsFormData} from '../model';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({providedIn: 'root'})
export class EditorConfigurationUpdateStrategy implements SettingsUpdateStrategy {
  private readonly maxGraphSettingsService = inject(GraphSettingsPort, {optional: true});
  private readonly themeService = inject(EditorThemePort, {optional: true});

  updateSettings(model: SettingsFormData, settings: Settings): void {
    const editorConfiguration = model?.editorConfiguration;
    if (!editorConfiguration) return;

    settings.enableHierarchicalLayout = editorConfiguration.enableHierarchicalLayout;
    settings.showConnectionLabels = editorConfiguration.showConnectionLabels;
    settings.darkMode = editorConfiguration.darkMode;

    this.themeService?.applyTheme(settings.darkMode ? 'dark' : 'light');
    this.maxGraphSettingsService?.formatShapes(true);
  }
}
