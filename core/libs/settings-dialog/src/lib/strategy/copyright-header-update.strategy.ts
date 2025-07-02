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
import {Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({
  providedIn: 'root',
})
export class CopyrightHeaderUpdateStrategy implements SettingsUpdateStrategy {
  updateSettings(form: FormGroup, settings: Settings): void {
    const copyrightHeaderConfiguration = form.get('copyrightHeaderConfiguration');
    if (!copyrightHeaderConfiguration) return;

    settings.copyrightHeader = copyrightHeaderConfiguration.get('copyright')?.value.split('\n');
  }
}
