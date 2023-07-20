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

import {DefaultAbstractEntity, DefaultAbstractProperty, DefaultEntity, DefaultProperty} from '@ame/meta-model';
import {MetaModelElementInstantiator} from '../meta-model-element-instantiator';
import {PredefinedPropertyInstantiator} from './samm-e-predefined-property-instantiator';

export class PredefinedEntityInstantiator {
  public entityInstances: {[key: string]: Function} = {};

  constructor(private metaModelElementInstantiator: MetaModelElementInstantiator) {
    this.entityInstances[this.metaModelElementInstantiator.sammE.TimeSeriesEntity] = this.createTimeSeriesEntity.bind(this);
    this.entityInstances[this.metaModelElementInstantiator.sammE.Point3d] = this.createPoint3D.bind(this);
    this.entityInstances[this.metaModelElementInstantiator.sammE.FileResource] = this.createFileResource.bind(this);
  }

  private createTimeSeriesEntity() {
    const {propertyInstances} = new PredefinedPropertyInstantiator(this.metaModelElementInstantiator);

    const {samm, sammE} = this.metaModelElementInstantiator;
    const timestampProperty: DefaultProperty = propertyInstances[sammE.timestampProperty]();
    const valueProperty: DefaultAbstractProperty = propertyInstances[sammE.valueProperty]();

    const timeSeriesEntity = new DefaultAbstractEntity(
      samm.version,
      sammE.TimeSeriesEntity,
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

    timestampProperty.parents.push(timeSeriesEntity);
    valueProperty.parents.push(timeSeriesEntity);
    timeSeriesEntity.children.push(timestampProperty, valueProperty);
    return timeSeriesEntity;
  }

  private createPoint3D() {
    const {propertyInstances} = new PredefinedPropertyInstantiator(this.metaModelElementInstantiator);
    const {samm, sammE} = this.metaModelElementInstantiator;
    const point3dEntity = new DefaultAbstractEntity(
      samm.version,
      sammE.Point3d,
      'Point3d',
      [
        {property: propertyInstances[sammE.xProperty](), keys: {}},
        {property: propertyInstances[sammE.yProperty](), keys: {}},
        {property: propertyInstances[sammE.zProperty](), keys: {}},
      ],
      true
    );

    point3dEntity.addPreferredName('en', 'Point 3D');
    point3dEntity.addDescription('en', 'Defines a position in a three dimensional space.');

    point3dEntity.children.push(...point3dEntity.properties.map(p => p.property));
    point3dEntity.children.forEach(child => child.parents.push(point3dEntity));

    return point3dEntity;
  }

  private createFileResource() {
    const {propertyInstances} = new PredefinedPropertyInstantiator(this.metaModelElementInstantiator);
    const {samm, sammE} = this.metaModelElementInstantiator;
    const fileResourceEntity = new DefaultEntity(
      samm.version,
      sammE.FileResource,
      'FileResource',
      [
        {property: propertyInstances[sammE.resourceProperty](), keys: {}},
        {property: propertyInstances[sammE.mimeTypeProperty](), keys: {}},
      ],
      true
    );

    fileResourceEntity.addPreferredName('en', 'File Resource');
    fileResourceEntity.addDescription('en', 'A file in a specific format');

    fileResourceEntity.children.push(...fileResourceEntity.properties.map(p => p.property));
    fileResourceEntity.children.forEach(child => child.parents.push(fileResourceEntity));

    return fileResourceEntity;
  }
}
