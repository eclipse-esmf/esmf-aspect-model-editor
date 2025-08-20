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
import {MxGraphHelper} from '@ame/mx-graph';
import {Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultEntity, DefaultProperty, Entity} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';
import {EntityPropertyConnectionHandler, PropertyAbstractPropertyConnectionHandler} from '../multi-shape-connection-handlers';

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<Entity> {
  constructor(
    private entityInstanceService: EntityInstanceService,
    private propertyAbstractPropertyConnector: PropertyAbstractPropertyConnectionHandler,
    private entityPropertyConnector: EntityPropertyConnectionHandler,
  ) {
    super();
  }

  public connect(abstractEntity: DefaultEntity, source: mxgraph.mxCell) {
    const abstractProperty = this.elementCreator.createEmptyElement(DefaultProperty, {isAbstract: true});
    const abstractPropertyCell = this.mxGraphService.renderModelElement(
      this.filtersService.createNode(abstractProperty, {parent: MxGraphHelper.getModelElement(source)}),
    );
    abstractEntity.properties.push(abstractProperty);
    this.entityInstanceService.onNewProperty(abstractProperty, abstractEntity);

    this.mxGraphService.assignToParent(abstractPropertyCell, source);
    this.mxGraphService.formatCell(source, true);

    const entities = this.mxGraphService.graph
      .getIncomingEdges(source)
      .map(edge => edge.source)
      .filter(cell => MxGraphHelper.getModelElement(cell) instanceof DefaultEntity);

    this.refreshPropertiesLabel(abstractPropertyCell, abstractProperty);

    if (entities.length) {
      const [namespace, name] = abstractProperty.aspectModelUrn.split('#');
      const newProperty = new DefaultProperty({
        name: `[${name}]`,
        aspectModelUrn: `${namespace}#[${name}]`,
        metaModelVersion: abstractProperty.metaModelVersion,
        characteristic: this.elementCreator.createEmptyElement(DefaultCharacteristic),
      });

      newProperty.characteristic.parents.push(newProperty);
      const newPropertyCell = this.renderTree(newProperty, source);

      for (const entity of entities) {
        const entityModel = MxGraphHelper.getModelElement<DefaultEntity>(entity);
        entityModel.properties.push(newProperty);
        this.entityPropertyConnector.connect(entityModel, newProperty, entity, newPropertyCell);
      }

      this.propertyAbstractPropertyConnector.connect(newProperty, abstractProperty, newPropertyCell, abstractPropertyCell);
    }

    this.mxGraphService.formatShapes();
  }
}
