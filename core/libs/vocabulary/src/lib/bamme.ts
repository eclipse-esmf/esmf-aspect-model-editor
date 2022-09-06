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

import {Bamm} from './bamm';

export class Bamme {
  private alias = 'bamm-e';

  get TimeSeriesEntity() {
    return this.getNamespace() + 'TimeSeriesEntity';
  }

  get timestampProperty() {
    return this.getNamespace() + 'timestamp';
  }

  get valueProperty() {
    return this.getNamespace() + 'value';
  }

  constructor(private bamm: Bamm) {}

  getAlias(): string {
    return this.alias;
  }

  isRelatedNamespace(namespace: string): boolean {
    return namespace.startsWith(this.getUri());
  }

  getUri(): string {
    return `${this.bamm.getBaseUri()}entity:${this.bamm.version}`;
  }

  getNamespace(): string {
    return `${this.getUri()}#`;
  }

  getAspectModelUrn(elementName: string): string {
    return `${this.getNamespace()}${elementName}`;
  }

  isTimeSeriesEntity(urn: string) {
    return this.TimeSeriesEntity === urn;
  }

  isTimestampProperty(urn: string) {
    return this.timestampProperty === urn;
  }

  isValueProperty(urn: string) {
    return this.valueProperty === urn;
  }
}
