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

import {MxGraphAttributeService, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {DefaultEntity, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {InheritanceConnector} from './inheritance-connector';
import mxCell = mxgraph.mxCell;

export class PropertyInheritanceConnector extends InheritanceConnector {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected sammLangService: SammLanguageSettingsService,
    protected notificationsService: NotificationsService,
    protected translate: LanguageTranslationService,
  ) {
    super(mxGraphService, mxGraphAttributeService, sammLangService, notificationsService, translate);
  }

  public connect(parentMetaModel: NamedElement, childMetaModel: NamedElement, parentCell: mxCell, childCell: mxCell) {
    if (
      parentMetaModel instanceof DefaultProperty &&
      ((childMetaModel instanceof DefaultProperty && childMetaModel.isAbstract) || childMetaModel instanceof DefaultProperty)
    ) {
      parentMetaModel.name = `[${childMetaModel.name}]`;
      parentMetaModel.preferredNames.clear();
      parentMetaModel.descriptions.clear();
      parentMetaModel.exampleValue = '';
      parentCell.setId(`[${childMetaModel.name}]`);
    }

    super.connect(parentMetaModel, childMetaModel, parentCell, childCell);
  }

  isInheritedElement(element: NamedElement): boolean {
    return element instanceof DefaultProperty || (element instanceof DefaultEntity && element.isAbstractEntity());
  }

  protected hasEntityParent(cell: mxgraph.mxCell) {
    return !this.mxGraphService.resolveParents(cell)?.some(cell => MxGraphHelper.getModelElement(cell) instanceof DefaultEntity);
  }
}
