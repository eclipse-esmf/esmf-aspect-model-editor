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

import {LanguageTranslationService, TauriTunnelPort} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {Settings, SettingsFormData} from '../model';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({providedIn: 'root'})
export class LanguageConfigurationUpdateStrategy implements SettingsUpdateStrategy {
  private readonly translate = inject(LanguageTranslationService);
  private readonly tauriTunnelService = inject(TauriTunnelPort);

  updateSettings(model: SettingsFormData, settings: Settings): void {
    const languageConfiguration = model?.languageConfiguration;
    if (!languageConfiguration) return;

    const userInterfaceLang = languageConfiguration.userInterface;
    this.translate.translateService.setActiveLang(userInterfaceLang);
    this.tauriTunnelService.sendTranslationsToTauri(userInterfaceLang);
    localStorage.setItem('applicationLanguage', userInterfaceLang);

    settings.aspectModelLanguages = (languageConfiguration.aspectModel || [])
      .map(entry => (typeof entry.language === 'object' && entry.language ? entry.language.tag : String(entry.language || '')))
      .filter(Boolean);
  }
}
