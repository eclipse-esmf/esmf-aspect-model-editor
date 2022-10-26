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

import {DefaultAbstractProperty, DefaultProperty} from '@ame/meta-model';
import {PredefinedProperties} from '@ame/vocabulary';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {BammCharacteristicInstantiator} from './bamm-characteristic-instantiator';

const coordinates = {
  x: {preferredName: 'X', description: 'The position along the X axis'},
  y: {preferredName: 'Y', description: 'The position along the Y axis'},
  z: {preferredName: 'Z', description: 'The position along the Z axis'},
};

export class PredefinedPropertyInstantiator {
  public propertyInstances: {[key: string]: Function} = {};

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.propertyInstances[this.metaModelElementInstantiator.bamme.timestampProperty] = this.createTimestampProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.bamme.valueProperty] = this.createValueProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.bamme.resourceProperty] = this.createResourceProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.bamme.mimeTypeProperty] = this.createMimeTypeProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.bamme.xProperty] = this.createCoordinateProperty.bind(this, 'x');
    this.propertyInstances[this.metaModelElementInstantiator.bamme.yProperty] = this.createCoordinateProperty.bind(this, 'y');
    this.propertyInstances[this.metaModelElementInstantiator.bamme.zProperty] = this.createCoordinateProperty.bind(this, 'z');
  }

  private createTimestampProperty() {
    const bammCharacteristicInstantiator = new BammCharacteristicInstantiator(this.metaModelElementInstantiator);

    const timestampProperty = new DefaultProperty(
      this.metaModelElementInstantiator.bamm.version,
      this.metaModelElementInstantiator.bamme.getNamespace() + PredefinedProperties.timestamp,
      PredefinedProperties.timestamp,
      bammCharacteristicInstantiator.createTimestampCharacteristic(
        this.metaModelElementInstantiator,
        this.metaModelElementInstantiator.rdfModel.dataTypeService
      ),
      true
    );

    timestampProperty.addPreferredName('en', 'Timestamp');
    timestampProperty.addDescription('en', 'The specific point in time when the corresponding value was recorded.');

    return timestampProperty;
  }

  private createValueProperty() {
    const valueProperty = new DefaultAbstractProperty(
      this.metaModelElementInstantiator.bamm.version,
      this.metaModelElementInstantiator.bamme.getNamespace() + PredefinedProperties.value,
      PredefinedProperties.value,
      '',
      true
    );

    valueProperty.addPreferredName('en', 'Value');
    valueProperty.addDescription('en', 'The value that was recorded and is part of a time series.');

    return valueProperty;
  }

  private createCoordinateProperty(coordinate: 'x' | 'y' | 'z') {
    const valueProperty = new DefaultAbstractProperty(
      this.metaModelElementInstantiator.bamm.version,
      this.metaModelElementInstantiator.bamme.getNamespace() + coordinate,
      coordinate,
      '',
      true
    );

    valueProperty.addPreferredName('en', coordinates[coordinate].preferredName);
    valueProperty.addDescription('en', coordinates[coordinate].description);

    return valueProperty;
  }

  private createResourceProperty() {
    const bammCharacteristicInstantiator = new BammCharacteristicInstantiator(this.metaModelElementInstantiator);

    const resourceProperty = new DefaultProperty(
      this.metaModelElementInstantiator.bamm.version,
      this.metaModelElementInstantiator.bamme.getNamespace() + PredefinedProperties.resource,
      PredefinedProperties.resource,
      bammCharacteristicInstantiator.createResourcePathCharacteristic(
        this.metaModelElementInstantiator,
        this.metaModelElementInstantiator.rdfModel.dataTypeService
      ),
      true
    );

    resourceProperty.addPreferredName('en', 'Resource');
    resourceProperty.addDescription('en', 'Location of a resource');

    return resourceProperty;
  }

  private createMimeTypeProperty() {
    const bammCharacteristicInstantiator = new BammCharacteristicInstantiator(this.metaModelElementInstantiator);

    const mimeTypeProperty = new DefaultProperty(
      this.metaModelElementInstantiator.bamm.version,
      this.metaModelElementInstantiator.bamme.getNamespace() + PredefinedProperties.mimeType,
      PredefinedProperties.mimeType,
      bammCharacteristicInstantiator.createMimeTypeCharacteristic(
        this.metaModelElementInstantiator,
        this.metaModelElementInstantiator.rdfModel.dataTypeService
      ),
      true,
      'application/json'
    );

    mimeTypeProperty.addPreferredName('en', 'MIME Type');
    mimeTypeProperty.addDescription('en', 'A MIME type as defined in RFC 2046');

    return mimeTypeProperty;
  }
}
