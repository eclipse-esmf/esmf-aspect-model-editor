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
import {Settings, SettingsFormData} from '../model';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({providedIn: 'root'})
export class CopyrightHeaderUpdateStrategy implements SettingsUpdateStrategy {
  updateSettings(model: SettingsFormData, settings: Settings): void {
    const copyrightHeaderConfiguration = model?.copyrightHeaderConfiguration;
    if (!copyrightHeaderConfiguration) return;

    const copyright = copyrightHeaderConfiguration.copyright;
    settings.copyrightHeader = copyright ? copyright.split('\n') : [];
  }
}
