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

import {FiltersService} from '@ame/loader-filters';
import {DefaultEntity, DefaultAbstractEntity, DefaultAbstractProperty, DefaultProperty, BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService} from '@ame/mx-graph';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {mxgraph} from 'mxgraph-factory';
import {InheritanceConnector} from './inheritance-connector';
import {EntityPropertyConnectionHandler, PropertyAbstractPropertyConnectionHandler} from '../multi-shape-connection-handlers';

export class EntityInheritanceConnector extends InheritanceConnector {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected notificationsService: NotificationsService,
    protected filtersService: FiltersService,
    protected propertyAbstractPropertyConnector?: PropertyAbstractPropertyConnectionHandler,
    protected entityPropertyConnector?: EntityPropertyConnectionHandler
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationsService);
  }

  connectWithAbstract(
    parentMetaModel: DefaultEntity,
    childMetaModel: DefaultAbstractEntity | DefaultEntity,
    parent: mxgraph.mxCell,
    child: mxgraph.mxCell
  ) {
    if (parentMetaModel.extendedElement?.aspectModelUrn === childMetaModel.aspectModelUrn) {
      return;
    }

    const abstractProperties = childMetaModel.allProperties
      .map(({property}) => property)
      .filter(
        abstractProperty =>
          abstractProperty instanceof DefaultAbstractProperty &&
          !childMetaModel.allProperties?.some(({property: p}) => p.extendedElement?.aspectModelUrn === abstractProperty.aspectModelUrn)
      );

    const newProperties = abstractProperties.map(abstractProperty => {
      const property = DefaultProperty.createInstance();
      property.metaModelVersion = abstractProperty.metaModelVersion;
      const [namespace, name] = abstractProperty.aspectModelUrn.split('#');
      property.aspectModelUrn = `${namespace}#[${name}]`;
      property.extendedElement = abstractProperty;
      return property;
    });

    parentMetaModel.properties = [
      ...parentMetaModel.properties,
      ...newProperties.map(property => ({
        property,
        keys: {},
      })),
    ];

    for (let i = 0; i < newProperties.length; i++) {
      const propertyCell = this.mxGraphService.renderModelElement(
        this.filtersService.createNode(newProperties[i], {parent: parentMetaModel})
      );
      this.entityPropertyConnector.connect(parentMetaModel, newProperties[i], parent, propertyCell);

      this.propertyAbstractPropertyConnector.connect(
        newProperties[i],
        abstractProperties[i],
        propertyCell,
        this.mxGraphService.resolveCellByModelElement(abstractProperties[i])
      );
    }

    this.mxGraphService.formatCell(parent);
    this.mxGraphService.formatCell(child);
    this.mxGraphService.formatShapes();
  }

  isInheritedElement(element: BaseMetaModelElement): boolean {
    return element instanceof DefaultEntity || element instanceof DefaultAbstractEntity;
  }
}
