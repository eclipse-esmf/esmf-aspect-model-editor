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

import {BaseMetaModelElement} from '@ame/meta-model';
import {MxGraphService, MxGraphAttributeService, MxGraphVisitorHelper, MxGraphHelper} from '@ame/mx-graph';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {mxgraph} from 'mxgraph-factory';

import mxCell = mxgraph.mxCell;

export abstract class InheritanceConnector {
  constructor(
    protected mxGraphService: MxGraphService,
    protected mxGraphAttributeService: MxGraphAttributeService,
    protected languageSettingsService: LanguageSettingsService,
    protected notificationsService: NotificationsService
  ) {}

  public connect(parentMetaModel: BaseMetaModelElement, childMetaModel: BaseMetaModelElement, parentCell: mxCell, childCell: mxCell) {
    if (parentMetaModel?.isPredefined()) {
      this.notificationsService.warning({title: "A predefined element can't have a child"});
      return;
    }

    (parentMetaModel as any).extendedElement = childMetaModel;
    this.checkAndRemoveExtendElement(parentCell);
    this.mxGraphService.assignToParent(childCell, parentCell);
    parentCell['configuration'].fields = MxGraphVisitorHelper.getElementProperties(parentMetaModel, this.languageSettingsService);
    this.mxGraphAttributeService.graph.labelChanged(parentCell, MxGraphHelper.createPropertiesLabel(parentCell));
  }

  public checkAndRemoveExtendElement(parentCell: mxCell) {
    const parentElementModel = MxGraphHelper.getModelElement(parentCell);
    this.mxGraphAttributeService.graph.getOutgoingEdges(parentCell).forEach((outEdge: mxCell) => {
      const targetElementModel = MxGraphHelper.getModelElement(outEdge.target);
      if (this.isInheritedElement(targetElementModel)) {
        this.mxGraphService.removeCells([parentCell.removeEdge(outEdge, true)]);
        MxGraphHelper.removeRelation(parentElementModel, targetElementModel);
      }
    });
  }

  abstract isInheritedElement(element: BaseMetaModelElement): boolean;
}
