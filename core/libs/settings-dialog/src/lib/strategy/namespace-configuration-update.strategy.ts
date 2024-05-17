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

import {FormGroup} from '@angular/forms';
import {Settings} from '@ame/settings-dialog';
import {SettingsUpdateStrategy} from './settings-update.strategy';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NamespaceConfigurationUpdateStrategy implements SettingsUpdateStrategy {
  updateSettings(form: FormGroup, settings: Settings): void {
    const namespaceConfiguration = form.get('namespaceConfiguration');
    if (!namespaceConfiguration) return;

    settings.namespace = namespaceConfiguration.get('aspectUri')?.value;
    settings.version = namespaceConfiguration.get('aspectVersion')?.value;
  }
}
