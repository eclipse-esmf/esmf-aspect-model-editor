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
import {Injectable, inject} from '@angular/core';
import {DefaultProperty, DefaultValue} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {BaseConnectionHandler} from '../base-connection-handler.service';

@Injectable({providedIn: 'root'})
export class PropertyValueConnectionHandler extends BaseConnectionHandler {
  private notificationService = inject(NotificationsService);
  private translate = inject(LanguageTranslationService);

  public connect(parentMetaModel: DefaultProperty, childMetaModel: DefaultValue, parentCell: Cell, childCell: Cell) {
    if (parentMetaModel.isPredefined) {
      this.notificationService.warning({title: this.translate.language.notificationService.childForPredefinedElementError});
      return;
    }

    if (MaxGraphHelper.isEntityCycleInheritance(childCell, parentMetaModel, this.maxgraphService.graph)) {
      this.notificationService.warning({
        title: this.translate.language.notificationService.recursiveElements,
        message: this.translate.language.notificationService.circularConnectionMessage,
        timeout: 5000,
      });
      return;
    }

    const currentExampleValue = parentMetaModel.exampleValue as DefaultValue;

    if (currentExampleValue && currentExampleValue.aspectModelUrn !== childMetaModel.aspectModelUrn) {
      const obsoleteEdge = this.maxgraphService.graph
        .getOutgoingEdges(parentCell, null)
        .find(edge => MaxGraphHelper.getModelElement(edge.target) instanceof DefaultValue);

      if (obsoleteEdge) {
        const exampleValue = MaxGraphHelper.getModelElement<DefaultValue>(obsoleteEdge.target);
        MaxGraphHelper.removeRelation(parentMetaModel, exampleValue);

        this.maxgraphService.removeCells([obsoleteEdge]);
      }
    }

    parentMetaModel.exampleValue = childMetaModel;
    childMetaModel.parents.push(parentMetaModel);

    this.refreshPropertiesLabel(parentCell, parentMetaModel);

    this.maxgraphService.assignToParent(childCell, parentCell);
  }
}
