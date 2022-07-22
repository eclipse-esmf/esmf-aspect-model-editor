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

import {DefaultAbstractEntity} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {PredefinedPropertyInstantiator} from './bamme-predefined-property-instantiator';

export class PredefinedEntityInstantiator {
  public entityInstances: {[key: string]: Function} = {};

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.entityInstances[this.metaModelElementInstantiator.bamme.TimeSeriesEntity] = this.createTimeSeriesEntity.bind(this);
  }

  private createTimeSeriesEntity() {
    const {propertyInstances} = new PredefinedPropertyInstantiator(this.metaModelElementInstantiator);

    const {bamm, bamme} = this.metaModelElementInstantiator;
    const timestampProperty = propertyInstances[bamme.timestampProperty]();
    const valueProperty = propertyInstances[bamme.valueProperty]();

    const timeSeriesEntity = new DefaultAbstractEntity(
      bamm.version,
      bamme.TimeSeriesEntity,
      'TimeSeriesEntity',
      [
        {property: timestampProperty, keys: {}},
        {property: valueProperty, keys: {}},
      ],
      true
    );

    timeSeriesEntity.addPreferredName('en', 'Time Series Entity');
    timeSeriesEntity.addDescription(
      'en',
      'The Time Series Entity is used with the Time Series Characteristic. It wraps the two Properties timestamp and value to represent a value at a point in time.'
    );

    return timeSeriesEntity;
  }
}
