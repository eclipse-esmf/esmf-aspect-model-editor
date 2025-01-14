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

import {LoadedFilesService} from '@ame/cache';
import {Settings} from '@ame/settings-dialog';
import {TitleService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({
  providedIn: 'root',
})
export class NamespaceConfigurationUpdateStrategy implements SettingsUpdateStrategy {
  private loadedFilesService = inject(LoadedFilesService);

  constructor(private titleService: TitleService) {}

  updateSettings(form: FormGroup, settings: Settings): void {
    const namespaceConfiguration = form.get('namespaceConfiguration');
    if (!namespaceConfiguration) return;

    const currentFile = this.loadedFilesService.currentLoadedFile;
    this.loadedFilesService.updateAbsoluteName(
      currentFile.absoluteName,
      `${namespaceConfiguration.get('aspectUri')?.value}:${namespaceConfiguration.get('aspectVersion')?.value}:${namespaceConfiguration.get('aspectName')?.value}.ttl`,
    );

    settings.namespace = namespaceConfiguration.get('aspectUri')?.value;
    settings.version = namespaceConfiguration.get('aspectVersion')?.value;

    this.titleService.updateTitle(currentFile.absoluteName);
  }
}
