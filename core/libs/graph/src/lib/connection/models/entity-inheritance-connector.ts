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

import {inject} from '@angular/core';
import {DefaultCharacteristic, DefaultEntity, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {EntityPropertyConnectionHandler} from '../multi-shape-connection-handlers/entity--property.service';
import {PropertyAbstractPropertyConnectionHandler} from '../multi-shape-connection-handlers/property--abstract-property.service';
import {InheritanceConnector} from './inheritance-connector';

export class EntityInheritanceConnector extends InheritanceConnector {
  protected propertyAbstractPropertyConnector = inject(PropertyAbstractPropertyConnectionHandler);
  protected entityPropertyConnector = inject(EntityPropertyConnectionHandler);

  connectWithAbstract(parentMetaModel: DefaultEntity, childMetaModel: DefaultEntity, parent: Cell, child: Cell) {
    if (parentMetaModel.getExtends()?.aspectModelUrn === childMetaModel.aspectModelUrn) {
      return;
    }

    const abstractProperties = childMetaModel.properties.filter(
      abstractProperty =>
        abstractProperty.isAbstract &&
        !childMetaModel.properties?.some(p => p.getExtends()?.aspectModelUrn === abstractProperty.aspectModelUrn),
    );

    const newProperties = abstractProperties.map(abstractProperty => {
      const [namespace, name] = abstractProperty.aspectModelUrn.split('#');
      const property = new DefaultProperty({
        name: `[${name}]`,
        aspectModelUrn: '',
        metaModelVersion: abstractProperty.metaModelVersion,
        extends_: abstractProperty,
        characteristic: this.elementCreator.createEmptyElement(DefaultCharacteristic),
      });
      property.aspectModelUrn = `${namespace}#[${name}]`;
      property.characteristic.parents.push(property);
      return property;
    });

    parentMetaModel.properties = [...parentMetaModel.properties, ...newProperties];

    for (let i = 0; i < newProperties.length; i++) {
      const propertyCell = this.renderTree(newProperties[i], parent);
      this.entityPropertyConnector.connect(parentMetaModel, newProperties[i], parent, propertyCell);

      this.propertyAbstractPropertyConnector.connect(
        newProperties[i],
        abstractProperties[i],
        propertyCell,
        this.maxgraphService.resolveCellByModelElement(abstractProperties[i]),
      );
    }

    this.maxgraphService.formatCell(parent);
    this.maxgraphService.formatCell(child);
    this.maxgraphService.formatShapes();
  }

  isInheritedElement(element: NamedElement): boolean {
    return element instanceof DefaultEntity || (element instanceof DefaultEntity && element.isAbstractEntity());
  }
}
