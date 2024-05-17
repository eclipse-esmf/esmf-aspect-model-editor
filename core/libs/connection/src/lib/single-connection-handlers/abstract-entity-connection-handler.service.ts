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
import {
  Entity,
  ModelElementNamingService,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  OverWrittenProperty,
  DefaultEntity,
  DefaultProperty
} from '@ame/meta-model';
import {MxGraphService, MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {SingleShapeConnector} from '../models';
import {PropertyAbstractPropertyConnectionHandler, EntityPropertyConnectionHandler} from '../multi-shape-connection-handlers';
import {mxgraph} from 'mxgraph-factory';

@Injectable({
  providedIn: 'root'
})
export class AbstractEntityConnectionHandler implements SingleShapeConnector<Entity> {
  constructor(
    private mxGraphService: MxGraphService,
    private modelElementNamingService: ModelElementNamingService,
    private entityInstanceService: EntityInstanceService,
    private propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    private entityPropertyConnector: EntityPropertyConnectionHandler,
    private filtersService: FiltersService
  ) {}

  public connect(abstractEntity: DefaultAbstractEntity, source: mxgraph.mxCell) {
    const abstractProperty = DefaultAbstractProperty.createInstance();
    const metaModelElement = this.modelElementNamingService.resolveMetaModelElement(abstractProperty);
    const abstractPropertyCell = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(metaModelElement, {parent: MxGraphHelper.getModelElement(source)})
    );
    const overWrittenProperty: OverWrittenProperty<DefaultAbstractProperty> = {property: abstractProperty, keys: {}};
    abstractEntity.properties.push(overWrittenProperty as any);
    this.entityInstanceService.onNewProperty(overWrittenProperty as any, abstractEntity);

    this.mxGraphService.assignToParent(abstractPropertyCell, source);
    this.mxGraphService.formatCell(source);

    const entities = this.mxGraphService.graph
      .getIncomingEdges(source)
      .map(edge => edge.source)
      .filter(cell => MxGraphHelper.getModelElement(cell) instanceof DefaultEntity);

    if (entities.length) {
      const newProperty = DefaultProperty.createInstance();
      const [namespace, name] = abstractProperty.aspectModelUrn.split('#');
      newProperty.aspectModelUrn = `${namespace}#[${name}]`;
      newProperty.metaModelVersion = abstractProperty.metaModelVersion;
      const newPropertyCell = this.mxGraphService.renderModelElement(this.filtersService.createNode(newProperty));

      for (const entity of entities) {
        const entityModel = MxGraphHelper.getModelElement<DefaultEntity>(entity);
        entityModel.properties.push({property: newProperty, keys: {}});
        this.entityPropertyConnector.connect(entityModel, newProperty, entity, newPropertyCell);
      }

      this.propertyAbstractPropertyConnector.connect(newProperty, abstractProperty, newPropertyCell, abstractPropertyCell);
    }

    this.mxGraphService.formatShapes();
  }
}
