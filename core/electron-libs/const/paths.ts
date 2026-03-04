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

// core/electron-libs/const/paths.ts
import * as path from 'path';
import {inDevMode} from '../utils/mode';

const iconsPath = inDevMode()
  ? path.join('.', 'apps', 'ame', 'src', 'assets', 'img', 'png', 'app-menu')
  : path.join(__dirname, '..', '..', '..', 'app-menu');

const disabledIconsPath = `${iconsPath}${path.sep}disabled`;
const enabledIconsPath = `${iconsPath}${path.sep}enabled`;

const modelsPath = inDevMode()
  ? path.join('.', 'apps', 'ame', 'src', 'assets', 'aspect-models', 'com.examples', '1.0.0')
  : path.join(__dirname, '..', '..', '..', 'default-models');

export const paths = {
  icons: {
    disabled: disabledIconsPath,
    enabled: enabledIconsPath,
  },
  models: modelsPath,
};
