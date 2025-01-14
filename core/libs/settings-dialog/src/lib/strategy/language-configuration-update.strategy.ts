/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
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

import {Settings} from '@ame/settings-dialog';
import {ElectronTunnelService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {Injectable} from '@angular/core';
import {FormArray, FormGroup} from '@angular/forms';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({
  providedIn: 'root',
})
export class LanguageConfigurationUpdateStrategy implements SettingsUpdateStrategy {
  constructor(
    private translate: LanguageTranslationService,
    private electronTunnelService: ElectronTunnelService,
  ) {}

  updateSettings(form: FormGroup, settings: Settings): void {
    const languageConfiguration = form.get('languageConfiguration');
    if (!languageConfiguration) return;

    const userInterfaceLang = languageConfiguration.get('userInterface')?.value;
    this.translate.translateService.use(userInterfaceLang);
    this.electronTunnelService.sendTranslationsToElectron(userInterfaceLang);
    localStorage.setItem('applicationLanguage', userInterfaceLang);

    settings.aspectModelLanguages = (languageConfiguration.get('aspectModel') as FormArray).controls.map(
      control => control.get('language')?.value.tag,
    );
  }
}
