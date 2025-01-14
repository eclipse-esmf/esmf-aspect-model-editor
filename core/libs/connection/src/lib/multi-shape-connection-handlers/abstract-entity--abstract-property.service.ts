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

import {EntityInstanceService} from '@ame/editor';
import {FiltersService} from '@ame/loader-filters';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnector} from '../models';
import {EntityPropertyConnectionHandler} from './entity--property.service';
import {PropertyAbstractPropertyConnectionHandler} from './property--abstract-property.service';

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityAbstractPropertyConnectionHandler implements MultiShapeConnector<DefaultEntity, DefaultProperty> {
  constructor(
    private mxGraphService: MxGraphService,
    private entityInstanceService: EntityInstanceService,
    private propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    private entityPropertyConnector: EntityPropertyConnectionHandler,
    private filtersService: FiltersService,
  ) {}

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultProperty, parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (!parentMetaModel.isAbstractEntity() || !childMetaModel.isAbstract) return;

    if (!parentMetaModel.properties.find(property => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      const overWrittenProperty = {property: childMetaModel, keys: {}};
      parentMetaModel.properties.push(overWrittenProperty as any);
      parentMetaModel.children.push(childMetaModel);
      this.entityInstanceService.onNewProperty(overWrittenProperty as any, parentMetaModel);
    }

    const grandParents = this.mxGraphService.graph
      .getIncomingEdges(parentCell)
      .map(edge => edge.source)
      .filter(cell => MxGraphHelper.getModelElement(cell) instanceof DefaultEntity);

    for (const grandParent of grandParents) {
      const grandParentElement = MxGraphHelper.getModelElement<DefaultEntity>(grandParent);
      const alreadyExtended = grandParentElement.properties.some(
        property => property.getExtends()?.aspectModelUrn === childMetaModel.aspectModelUrn,
      );

      if (alreadyExtended) {
        continue;
      }

      const [namespace, name] = childMetaModel.aspectModelUrn.split('#');

      const property = new DefaultProperty({
        name: `[${name}]`,
        aspectModelUrn: `${namespace}#[${name}]`,
        metaModelVersion: childMetaModel.metaModelVersion,
        extends_: childMetaModel,
      });

      MxGraphHelper.establishRelation(property, childMetaModel);

      // adding property to its parent (entity)
      grandParentElement.properties.push(property);
      MxGraphHelper.establishRelation(grandParentElement, property);

      const propertyCell = this.mxGraphService.renderModelElement(this.filtersService.createNode(property, {parent: grandParentElement}));

      // connecting the elements
      this.entityPropertyConnector.connect(grandParentElement, property, grandParent, propertyCell);
      this.propertyAbstractPropertyConnector.connect(property, childMetaModel, propertyCell, childCell);
    }

    this.mxGraphService.assignToParent(childCell, parentCell);
    this.mxGraphService.formatShapes();
  }
}
