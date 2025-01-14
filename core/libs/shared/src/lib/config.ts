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

import {AppConfig} from '@ame/shared';
import {InjectionToken} from '@angular/core';
import packageJson from '../../../../package.json';

const defaultPort = '9091';

export const config: AppConfig = {
  environment: 'dev',
  ameService: 'http://localhost:9091',
  ameVersion: packageJson?.version,
  editorConfiguration: 'assets/config/editor/config/editor.xml',
  assetLocation: 'assets',
  minSammVersion: '2.0.0',
  currentSammVersion: '2.2.0',
  sdkVersion: '2.7.0',
  defaultPort: '9091',
  serviceUrl: `http://localhost:${defaultPort}`,
  api: {
    models: '/ame/api/models',
    generate: '/ame/api/generate',
    package: '/ame/api/package',
    fileHandling: '/ame/api/file-handling',
  },
};

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => config,
});
