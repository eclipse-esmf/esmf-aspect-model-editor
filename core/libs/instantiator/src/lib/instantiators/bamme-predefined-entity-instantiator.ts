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
      'The Time Series Entity is used with the Time Series Characteristic. It wraps the two Properties timestamp and value to represent a value at a point in time.'
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
    point3dEntity.addDescription('en', 'Describes a point in ℝ³.');

    return point3dEntity;
  }

  private createFileResource() {
    const {propertyInstances} = new PredefinedPropertyInstantiator(this.metaModelElementInstantiator);
    const {bamm, bamme} = this.metaModelElementInstantiator;
    const fileResourceEntity = new DefaultAbstractEntity(
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
    fileResourceEntity.addDescription('en', 'Describes a resource with a relative or absolute location and a MIME type.');

    return fileResourceEntity;
  }
}
