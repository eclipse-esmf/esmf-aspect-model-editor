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

import {ModelHeaderService, ModelSessionFacade} from '@ame/domain';
import {inject, Injectable} from '@angular/core';
import {Settings, SettingsFormData} from '../model';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({providedIn: 'root'})
export class CopyrightHeaderUpdateStrategy implements SettingsUpdateStrategy {
  private readonly modelSession = inject(ModelSessionFacade);
  private readonly modelHeaderService = inject(ModelHeaderService);

  updateSettings(model: SettingsFormData, settings: Settings): void {
    const copyrightHeaderConfiguration = model?.copyrightHeaderConfiguration;
    if (!copyrightHeaderConfiguration) return;

    const copyright = copyrightHeaderConfiguration.copyright;
    settings.copyrightHeader = copyright ? copyright.split('\n') : [];
    // The header belongs to the file; the setting is the default for new models.
    this.modelHeaderService.setHeaderText(this.modelSession.currentLoadedFile?.rdfModel, copyright ?? '');
  }
}
