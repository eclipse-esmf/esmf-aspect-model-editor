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
import {Injectable, inject} from '@angular/core';
import {DefaultProperty, DefaultStructuredValue} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MultiShapeConnector} from '../models';

@Injectable({
  providedIn: 'root',
})
export class StructuredValueCharacteristicPropertyConnectionHandler
  implements MultiShapeConnector<DefaultStructuredValue, DefaultProperty>
{
  private mxGraphService = inject(MxGraphService);
  private mxGraphAttributeService = inject(MxGraphAttributeService);
  private sammLangService = inject(SammLanguageSettingsService);
  private notificationsService = inject(NotificationsService);

  connect(parentMetaModel: DefaultStructuredValue, childMetaModel: DefaultProperty, first: mxgraph.mxCell, second: mxgraph.mxCell): void {
    const isRecursiveConnection = MxGraphHelper.isChildOf(childMetaModel, parentMetaModel);

    if (isRecursiveConnection) {
      return this.notificationsService.warning({
        title: 'Unable to connect elements',
        message: 'StructuredValue can not be recursively connected with Property element',
        timeout: 5000,
      });
    }

    const [childCell, parentCell] = [second, first];
    const isPropertyElementIncluded = this.isPropertyElementIncluded(childMetaModel, parentMetaModel);

    if (!isPropertyElementIncluded) {
      this.addPropertyElement(childMetaModel, parentMetaModel);
    }

    MxGraphHelper.updateLabel(parentCell, this.mxGraphAttributeService.graph, this.sammLangService);
    this.mxGraphService.assignToParent(childCell, parentCell);
    this.mxGraphService.formatCell(parentCell);
    this.mxGraphService.formatShapes();
  }

  private isPropertyElementIncluded(childMetaModel: DefaultProperty, parentMetaModel: DefaultStructuredValue): boolean {
    return parentMetaModel.elements.some(el => {
      if (typeof el !== 'object') return false;
      return el.aspectModelUrn === childMetaModel.aspectModelUrn;
    });
  }

  private addPropertyElement(childMetaModel: DefaultProperty, parentMetaModel: DefaultStructuredValue): void {
    const isStartsWithDelimiter = typeof parentMetaModel.elements[0] === 'string';
    const isEndsWithDelimiter = typeof parentMetaModel.elements[parentMetaModel.elements.length - 1] === 'string';

    isStartsWithDelimiter
      ? parentMetaModel.elements.unshift(childMetaModel)
      : isEndsWithDelimiter
        ? parentMetaModel.elements.push(childMetaModel)
        : undefined;
  }
}
