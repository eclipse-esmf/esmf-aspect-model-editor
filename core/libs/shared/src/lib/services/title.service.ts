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

import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Injectable({providedIn: 'root'})
export class TitleService extends Title {
  updateTitle(absoluteName: string) {
    if (!absoluteName) {
      return;
    }

    const [namespace, version, modelName] = absoluteName.split(':');
    const title = `${modelName} - ${namespace}:${version} | Aspect Model Editor`;
    this.setTitle(title);
  }
}
