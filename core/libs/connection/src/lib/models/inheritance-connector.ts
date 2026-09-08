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

import {MaxGraphHelper} from '@ame/max-graph';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {inject} from '@angular/core';
import {DefaultEntity, DefaultProperty, NamedElement} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseConnectionHandler} from '../base-connection-handler.service';

export abstract class InheritanceConnector extends BaseConnectionHandler {
  protected readonly notificationsService = inject(NotificationsService);
  protected readonly translate = inject(LanguageTranslationService);

  public connect(parentMetaModel: NamedElement, childMetaModel: NamedElement, parentCell: Cell, childCell: Cell) {
    if (parentMetaModel?.isPredefined) {
      this.notificationsService.warning({title: this.translate.language.notificationService.childForPredefinedElementError});
      return;
    }

    if (parentMetaModel instanceof DefaultProperty || parentMetaModel instanceof DefaultEntity) {
      (parentMetaModel as DefaultProperty | DefaultEntity).extends_ = childMetaModel as any;
    }

    this.checkAndRemoveExtendElement(parentCell);
    this.maxgraphService.assignToParent(childCell, parentCell);
    this.refreshPropertiesLabel(parentCell, parentMetaModel);
  }

  public checkAndRemoveExtendElement(parentCell: Cell) {
    const parentElementModel = MaxGraphHelper.getModelElement(parentCell);
    this.maxgraphAttributeService.graph.getOutgoingEdges(parentCell, null).forEach((outEdge: Cell) => {
      const targetElementModel = MaxGraphHelper.getModelElement(outEdge.target);
      if (this.isInheritedElement(targetElementModel)) {
        this.maxgraphService.removeCells([parentCell.removeEdge(outEdge, true)]);
        MaxGraphHelper.removeRelation(parentElementModel, targetElementModel);
      }
    });
  }

  abstract isInheritedElement(element: NamedElement): boolean;
}
