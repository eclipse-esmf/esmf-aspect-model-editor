/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Samm} from './samm';

export class SammE {
  static versionLessUri = `${Samm.getBaseUri()}entity:`;

  private alias = 'samm-e';

  constructor(private samm: Samm) {}

  getAlias(): string {
    return this.alias;
  }

  isRelatedNamespace(namespace: string): boolean {
    return namespace.startsWith(this.getUri());
  }

  getUri(): string {
    return `${Samm.getBaseUri()}entity:${this.samm.version}`;
  }

  getNamespace(): string {
    return `${this.getUri()}#`;
  }

  getAspectModelUrn(elementName: string): string {
    return `${this.getNamespace()}${elementName}`;
  }
}
