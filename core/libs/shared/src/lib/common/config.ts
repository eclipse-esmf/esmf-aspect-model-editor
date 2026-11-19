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

import {InjectionToken} from '@angular/core';
import packageJson from '../../../../../package.json';
import {AppConfig} from './model';

const defaultPort = '9090';

export const config: AppConfig = {
  environment: 'dev',
  ameVersion: packageJson?.version,
  assetLocation: 'assets',
  minSammVersion: '2.0.0',
  currentSammVersion: '2.2.0',
  sdkVersion: '2.16.0',
  defaultPort,
  serviceUrl: `http://localhost:${defaultPort}`,
  api: {
    models: '/ame/api/models',
    generate: '/ame/api/generate',
    package: '/ame/api/package',
  },
};

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => config,
});
