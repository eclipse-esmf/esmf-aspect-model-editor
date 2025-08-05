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

import {FiltersService} from '@ame/loader-filters';
import {ElementCreatorService} from '@ame/shared';
import {inject} from '@angular/core';
import {DefaultCharacteristic, DefaultEntity, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {EntityPropertyConnectionHandler, PropertyAbstractPropertyConnectionHandler} from '../multi-shape-connection-handlers';
import {InheritanceConnector} from './inheritance-connector';

export class EntityInheritanceConnector extends InheritanceConnector {
  protected filtersService = inject(FiltersService);
  protected propertyAbstractPropertyConnector? = inject(PropertyAbstractPropertyConnectionHandler);
  protected entityPropertyConnector = inject(EntityPropertyConnectionHandler);
  protected elementCreator = inject(ElementCreatorService);

  connectWithAbstract(parentMetaModel: DefaultEntity, childMetaModel: DefaultEntity, parent: mxgraph.mxCell, child: mxgraph.mxCell) {
    if (parentMetaModel.getExtends()?.aspectModelUrn === childMetaModel.aspectModelUrn) {
      return;
    }

    if (!childMetaModel.isAbstractEntity()) {
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
        this.mxGraphService.resolveCellByModelElement(abstractProperties[i]),
      );
    }

    this.mxGraphService.formatCell(parent);
    this.mxGraphService.formatCell(child);
    this.mxGraphService.formatShapes();
  }

  isInheritedElement(element: NamedElement): boolean {
    return element instanceof DefaultEntity || (element instanceof DefaultEntity && element.isAbstractEntity());
  }
}
