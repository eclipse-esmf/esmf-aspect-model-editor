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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateTitle(urn: string, _type: 'Aspect' | 'Shared') {
    if (!urn) {
      return;
    }

    let [namespace, modelName] = urn.split('#');

    if (!modelName) {
      const sections = urn.split(':');
      modelName = sections.pop();
      namespace = sections.join(':');
    }

    const title = `${modelName} - ${namespace} | Aspect Model Editor`;
    this.setTitle(title);
  }
}
