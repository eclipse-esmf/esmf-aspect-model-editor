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
import {MxGraphAttributeService, MxGraphService} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {DefaultEntity, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {EntityPropertyConnectionHandler, PropertyAbstractPropertyConnectionHandler} from '../multi-shape-connection-handlers';
import {InheritanceConnector} from './inheritance-connector';

export class EntityInheritanceConnector extends InheritanceConnector {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected sammLangService: SammLanguageSettingsService,
    protected notificationsService: NotificationsService,
    protected filtersService: FiltersService,
    protected translate: LanguageTranslationService,
    protected propertyAbstractPropertyConnector?: PropertyAbstractPropertyConnectionHandler,
    protected entityPropertyConnector?: EntityPropertyConnectionHandler,
  ) {
    super(mxGraphService, mxGraphAttributeService, sammLangService, notificationsService, translate);
  }

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
      });
      property.aspectModelUrn = `${namespace}#[${name}]`;
      return property;
    });

    parentMetaModel.properties = [...parentMetaModel.properties, ...newProperties];

    for (let i = 0; i < newProperties.length; i++) {
      const propertyCell = this.mxGraphService.renderModelElement(
        this.filtersService.createNode(newProperties[i], {parent: parentMetaModel}),
      );
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
