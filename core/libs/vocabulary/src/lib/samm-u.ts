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
import {Samm} from './samm';

export class SammU {
  private alias = 'unit';

  constructor(private samm: Samm) {}

  getAlias(): string {
    return this.alias;
  }

  getDefaultUnitUri() {
    return this.getUri();
  }

  isStandardUnit(elementUrn: string): boolean {
    return elementUrn.startsWith(this.getNamespace());
  }

  getAspectModelUrn(elementName: string): string {
    return `${this.getNamespace()}${elementName}`;
  }

  getDefaultQuantityKindsUri() {
    return this.getUri();
  }

  getBaseUri(): string {
    return this.samm.getBaseUri();
  }

  getUri(): string {
    return `${this.samm.getBaseUri()}unit:${this.samm.version}`;
  }

  getNamespace(): string {
    return `${this.getUri()}#`;
  }
}
