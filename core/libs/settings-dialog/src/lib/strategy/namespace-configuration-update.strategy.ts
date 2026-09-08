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

import {LoadedFilesService} from '@ame/cache';
import {TitleService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {Settings, SettingsFormData} from '../model';
import {SettingsUpdateStrategy} from './settings-update.strategy';

@Injectable({providedIn: 'root'})
export class NamespaceConfigurationUpdateStrategy implements SettingsUpdateStrategy {
  private readonly loadedFilesService = inject(LoadedFilesService);
  private readonly titleService = inject(TitleService);

  updateSettings(model: SettingsFormData, settings: Settings): void {
    const namespaceConfiguration = model?.namespaceConfiguration;
    if (!namespaceConfiguration) return;

    const currentFile = this.loadedFilesService.currentLoadedFile;
    if (currentFile) {
      this.loadedFilesService.updateAbsoluteName(
        currentFile.absoluteName,
        `${namespaceConfiguration.aspectUri}:${namespaceConfiguration.aspectVersion}:${namespaceConfiguration.aspectName}.ttl`,
      );
      this.titleService.updateTitle(currentFile.absoluteName);
    }

    settings.namespace = namespaceConfiguration.aspectUri;
    settings.version = namespaceConfiguration.aspectVersion;
  }
}
