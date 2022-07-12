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

import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {environment} from 'environments/environment';

if (environment.production) {
  enableProdMode();
  console.groupCollapsed = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule(AppModule);

bootstrap().catch(err => console.log(err));
