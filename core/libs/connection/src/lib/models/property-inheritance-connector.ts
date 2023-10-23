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

import {BaseMetaModelElement, DefaultProperty, DefaultAbstractProperty, DefaultAbstractEntity, DefaultEntity} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphHelper} from '@ame/mx-graph';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {mxgraph} from 'mxgraph-factory';
import {InheritanceConnector} from './inheritance-connector';

import mxCell = mxgraph.mxCell;

export class PropertyInheritanceConnector extends InheritanceConnector {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected notificationsService: NotificationsService
  ) {
    super(mxGraphService, mxGraphAttributeService, languageSettingsService, notificationsService);
  }

  public connect(parentMetaModel: BaseMetaModelElement, childMetaModel: BaseMetaModelElement, parentCell: mxCell, childCell: mxCell) {
    if (
      parentMetaModel instanceof DefaultProperty &&
      (childMetaModel instanceof DefaultAbstractProperty || childMetaModel instanceof DefaultProperty)
    ) {
      parentMetaModel.name = `[${childMetaModel.name}]`;
      parentMetaModel.preferredNames.clear();
      parentMetaModel.descriptions.clear();
      parentMetaModel.exampleValue = '';
      parentCell.setId(`[${childMetaModel.name}]`);
    }

    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }

  isInheritedElement(element: BaseMetaModelElement): boolean {
    return element instanceof DefaultProperty || element instanceof DefaultAbstractProperty;
  }

  protected hasEntityParent(cell: mxgraph.mxCell) {
    return !this.mxGraphService
      .resolveParents(cell)
      ?.some(cell => [DefaultAbstractEntity, DefaultEntity].some(c => MxGraphHelper.getModelElement(cell) instanceof c));
  }
}
