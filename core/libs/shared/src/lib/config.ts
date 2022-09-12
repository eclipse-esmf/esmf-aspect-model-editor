/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {AppConfig} from '@ame/shared';
import packageJson from '../../../../package.json';

const defaultPort = '9091';

export const config = {
  ameVersion: packageJson?.version,
  editorConfiguration: 'assets/config/editor/config/editor.xml',
  assetLocation: 'assets',
  minBammVersion: '1.0.0',
  currentBammVersion: '2.0.0',
  defaultPort: '9091',
  serviceUrl: `http://localhost:${defaultPort}`,
  api: {
    models: '/ame/api/models',
    generate: '/ame/api/generate',
    package: '/ame/api/package',
  },
};

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
