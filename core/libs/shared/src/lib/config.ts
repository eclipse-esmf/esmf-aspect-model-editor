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

export const config = {
  ameService: 'http://localhost:9091',
  editorConfiguration: 'assets/config/editor/config/editor.xml',
  assetLocation: 'assets',
  oldMaxBammVersion: '2.0.0',
  oldMinBammVersion: '1.2.1',
  minBammVersion: '1.0.0',
  currentBammVersion: '1.0.0',
  copyrightYear: '2021',
};

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');
