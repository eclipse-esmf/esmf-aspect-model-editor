/*
 * Copyright (c) 2026 Robert Bosch Manufacturing Solutions GmbH
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
import {MaxGraphHelper} from '@ame/max-graph';
import {inject, Injectable} from '@angular/core';
import {DefaultCharacteristic, DefaultEntity, DefaultProperty, Entity} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {SingleShapeConnector} from '../models';
import {EntityPropertyConnectionHandler, PropertyAbstractPropertyConnectionHandler} from '../multi-shape-connection-handlers';

@Injectable({providedIn: 'root'})
export class AbstractEntityConnectionHandler extends BaseConnectionHandler implements SingleShapeConnector<Entity> {
  private entityInstanceService = inject(EntityInstanceService);
  private propertyAbstractPropertyConnector = inject(PropertyAbstractPropertyConnectionHandler);
  private entityPropertyConnector = inject(EntityPropertyConnectionHandler);

  public connect(abstractEntity: DefaultEntity, source: Cell) {
    const abstractProperty = this.elementCreator.createEmptyElement(DefaultProperty, {isAbstract: true});
    const abstractPropertyCell = this.maxgraphService.renderModelElement(
      this.filtersService.createNode(abstractProperty, {parent: MaxGraphHelper.getModelElement(source)}),
    );
    abstractEntity.properties.push(abstractProperty);
    this.entityInstanceService.onNewProperty(abstractProperty, abstractEntity);

    this.maxgraphService.assignToParent(abstractPropertyCell, source);
    this.maxgraphService.formatCell(source, true);

    const entities = this.maxgraphService.graph
      .getIncomingEdges(source, null)
      .map(edge => edge.source)
      .filter(cell => MaxGraphHelper.getModelElement(cell) instanceof DefaultEntity);

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
        const entityModel = MaxGraphHelper.getModelElement<DefaultEntity>(entity);
        entityModel.properties.push(newProperty);
        this.entityPropertyConnector.connect(entityModel, newProperty, entity, newPropertyCell);
      }

      this.propertyAbstractPropertyConnector.connect(newProperty, abstractProperty, newPropertyCell, abstractPropertyCell);
    }

    this.maxgraphService.formatShapes();
  }
}
