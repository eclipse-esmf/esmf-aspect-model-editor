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
import {Injectable, inject} from '@angular/core';
import {DefaultCharacteristic, DefaultEntity, DefaultProperty} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseConnectionHandler} from '../base-connection-handler.service';
import {MultiShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class AbstractEntityAbstractPropertyConnectionHandler
  extends BaseConnectionHandler
  implements MultiShapeConnector<DefaultEntity, DefaultProperty>
{
  private entityInstanceService = inject(EntityInstanceService);

  public connect(parentMetaModel: DefaultEntity, childMetaModel: DefaultProperty, parentCell: mxgraph.mxCell, childCell: mxgraph.mxCell) {
    if (!parentMetaModel.isAbstractEntity() || !childMetaModel.isAbstract) return;

    if (!parentMetaModel.properties.find(property => property.aspectModelUrn === childMetaModel.aspectModelUrn)) {
      parentMetaModel.properties.push(childMetaModel);
      this.entityInstanceService.onNewProperty(childMetaModel, parentMetaModel);
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
        characteristic: this.elementCreator.createEmptyElement(DefaultCharacteristic),
      });

      MxGraphHelper.establishRelation(property, childMetaModel);

      // adding property to its parent (entity)
      grandParentElement.properties.push(property);
      MxGraphHelper.establishRelation(grandParentElement, property);

      this.renderTree(property, grandParent);
    }

    this.mxGraphService.assignToParent(childCell, parentCell);
    this.mxGraphService.formatShapes();
  }
}
