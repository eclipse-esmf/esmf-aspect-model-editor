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
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {BammCharacteristicInstantiator} from './bamm-characteristic-instantiator';

export class PredefinedPropertyInstantiator {
  public propertyInstances: {[key: string]: Function} = {};

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.propertyInstances[this.metaModelElementInstantiator.bamme.timestampProperty] = this.createTimestampProperty.bind(this);
    this.propertyInstances[this.metaModelElementInstantiator.bamme.valueProperty] = this.createValueProperty.bind(this);
  }

  private createTimestampProperty() {
    const bammCharacteristicInstantiator = new BammCharacteristicInstantiator(this.metaModelElementInstantiator);

    const timestampProperty = new DefaultProperty(
      this.metaModelElementInstantiator.bamm.version,
      this.metaModelElementInstantiator.bamme.getNamespace() + 'timestamp',
      'timestamp',
      bammCharacteristicInstantiator.createTimestampCharacteristic(
        this.metaModelElementInstantiator,
        this.metaModelElementInstantiator.rdfModel.dataTypeService
      ),
      true
    );

    timestampProperty.addPreferredName('en', 'Timestamp');
    timestampProperty.addDescription('en', 'The point in time');

    return timestampProperty;
  }

  private createValueProperty() {
    const valueProperty = new DefaultAbstractProperty(
      this.metaModelElementInstantiator.bamm.version,
      this.metaModelElementInstantiator.bamme.getNamespace() + 'value',
      'value',
      '',
      true
    );

    valueProperty.addPreferredName('en', 'Value');
    valueProperty.addDescription('en', 'Any value');

    return valueProperty;
  }
}
