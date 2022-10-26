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

export enum PredefinedProperties {
  timestamp = 'timestamp',
  value = 'value',
  resource = 'resource',
  mimeType = 'mimeType',
  x = 'x',
  y = 'y',
  z = 'z',
}

export enum PredefinedEntities {
  TimeSeriesEntity = 'TimeSeriesEntity',
  Point3d = 'Point3d',
  FileResource = 'FileResource',
}

export class Bamme {
  private alias = 'bamm-e';

  get TimeSeriesEntity() {
    return this.getNamespace() + PredefinedEntities.TimeSeriesEntity;
  }

  get timestampProperty() {
    return this.getNamespace() + PredefinedProperties.timestamp;
  }

  get valueProperty() {
    return this.getNamespace() + PredefinedProperties.value;
  }

  get Point3d() {
    return this.getNamespace() + PredefinedEntities.Point3d;
  }

  get xProperty() {
    return this.getNamespace() + PredefinedProperties.x;
  }

  get yProperty() {
    return this.getNamespace() + PredefinedProperties.y;
  }

  get zProperty() {
    return this.getNamespace() + PredefinedProperties.z;
  }

  get FileResource() {
    return this.getNamespace() + PredefinedEntities.FileResource;
  }

  get resourceProperty() {
    return this.getNamespace() + PredefinedProperties.resource;
  }

  get mimeTypeProperty() {
    return this.getNamespace() + PredefinedProperties.mimeType;
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
