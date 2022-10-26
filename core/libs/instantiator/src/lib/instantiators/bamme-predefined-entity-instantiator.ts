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

import {DefaultAbstractEntity, DefaultEntity} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {PredefinedPropertyInstantiator} from './bamme-predefined-property-instantiator';

export class PredefinedEntityInstantiator {
  public entityInstances: {[key: string]: Function} = {};

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.entityInstances[this.metaModelElementInstantiator.bamme.TimeSeriesEntity] = this.createTimeSeriesEntity.bind(this);
    this.entityInstances[this.metaModelElementInstantiator.bamme.Point3d] = this.createPoint3D.bind(this);
    this.entityInstances[this.metaModelElementInstantiator.bamme.FileResource] = this.createFileResource.bind(this);
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
      'An Entity which represents a key/value pair. The key is the timestamp when the value was recorded and the value is the value which was recorded.'
    );

    return timeSeriesEntity;
  }

  private createPoint3D() {
    const {propertyInstances} = new PredefinedPropertyInstantiator(this.metaModelElementInstantiator);
    const {bamm, bamme} = this.metaModelElementInstantiator;
    const point3dEntity = new DefaultAbstractEntity(
      bamm.version,
      bamme.Point3d,
      'Point3d',
      [
        {property: propertyInstances[bamme.xProperty](), keys: {}},
        {property: propertyInstances[bamme.yProperty](), keys: {}},
        {property: propertyInstances[bamme.zProperty](), keys: {}},
      ],
      true
    );

    point3dEntity.addPreferredName('en', 'Point 3D');
    point3dEntity.addDescription('en', 'Defines a position in a three dimensional space.');

    return point3dEntity;
  }

  private createFileResource() {
    const {propertyInstances} = new PredefinedPropertyInstantiator(this.metaModelElementInstantiator);
    const {bamm, bamme} = this.metaModelElementInstantiator;
    const fileResourceEntity = new DefaultEntity(
      bamm.version,
      bamme.FileResource,
      'FileResource',
      [
        {property: propertyInstances[bamme.resourceProperty](), keys: {}},
        {property: propertyInstances[bamme.mimeTypeProperty](), keys: {}},
      ],
      true
    );

    fileResourceEntity.addPreferredName('en', 'File Resource');
    fileResourceEntity.addDescription('en', 'A file in a specific format');

    return fileResourceEntity;
  }
}
