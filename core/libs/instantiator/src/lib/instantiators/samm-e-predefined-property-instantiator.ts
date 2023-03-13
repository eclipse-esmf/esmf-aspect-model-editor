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

import {DefaultAbstractProperty, DefaultProperty} from '@ame/meta-model';
import {PredefinedProperties} from '@ame/vocabulary';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {PredefinedCharacteristicInstantiator} from './predefined-characteristic-instantiator';

const coordinates = {
  x: {preferredName: 'X', description: 'The position along the X axis'},
  y: {preferredName: 'Y', description: 'The position along the Y axis'},
  z: {preferredName: 'Z', description: 'The position along the Z axis'},
};

export class PredefinedPropertyInstantiator {
  public propertyInstances: {[key: string]: Function} = {};

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.propertyInstances[this.metaModelElementInstantiator.sammE.timestampProperty] = this.createTimestampProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.sammE.valueProperty] = this.createValueProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.sammE.resourceProperty] = this.createResourceProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.sammE.mimeTypeProperty] = this.createMimeTypeProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.sammE.xProperty] = this.createCoordinateProperty.bind(this, 'x');
    this.propertyInstances[this.metaModelElementInstantiator.sammE.yProperty] = this.createCoordinateProperty.bind(this, 'y');
    this.propertyInstances[this.metaModelElementInstantiator.sammE.zProperty] = this.createCoordinateProperty.bind(this, 'z');
  }

  private createTimestampProperty() {
    const defaultCharacteristicInstantiator = new PredefinedCharacteristicInstantiator(this.metaModelElementInstantiator);

    const timestampProperty = new DefaultProperty(
      this.metaModelElementInstantiator.samm.version,
      this.metaModelElementInstantiator.sammE.getNamespace() + PredefinedProperties.timestamp,
      PredefinedProperties.timestamp,
      defaultCharacteristicInstantiator.createTimestampCharacteristic(
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
      this.metaModelElementInstantiator.samm.version,
      this.metaModelElementInstantiator.sammE.getNamespace() + PredefinedProperties.value,
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
      this.metaModelElementInstantiator.samm.version,
      this.metaModelElementInstantiator.sammE.getNamespace() + coordinate,
      coordinate,
      '',
      true
    );

    valueProperty.addPreferredName('en', coordinates[coordinate].preferredName);
    valueProperty.addDescription('en', coordinates[coordinate].description);

    return valueProperty;
  }

  private createResourceProperty() {
    const defaultCharacteristicInstantiator = new PredefinedCharacteristicInstantiator(this.metaModelElementInstantiator);

    const resourceProperty = new DefaultProperty(
      this.metaModelElementInstantiator.samm.version,
      this.metaModelElementInstantiator.sammE.getNamespace() + PredefinedProperties.resource,
      PredefinedProperties.resource,
      defaultCharacteristicInstantiator.createResourcePathCharacteristic(
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
    const defaultCharacteristicInstantiator = new PredefinedCharacteristicInstantiator(this.metaModelElementInstantiator);

    const mimeTypeProperty = new DefaultProperty(
      this.metaModelElementInstantiator.samm.version,
      this.metaModelElementInstantiator.sammE.getNamespace() + PredefinedProperties.mimeType,
      PredefinedProperties.mimeType,
      defaultCharacteristicInstantiator.createMimeTypeCharacteristic(
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
