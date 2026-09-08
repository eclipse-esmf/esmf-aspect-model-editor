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

import {MaxGraphAttributeService, MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {NotificationsService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultProperty, DefaultStructuredValue} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {MultiShapeConnector} from '../models';

@Injectable({providedIn: 'root'})
export class StructuredValueCharacteristicPropertyConnectionHandler implements MultiShapeConnector<
  DefaultStructuredValue,
  DefaultProperty
> {
  private maxgraphService = inject(MaxGraphService);
  private maxgraphAttributeService = inject(MaxGraphAttributeService);
  private sammLangService = inject(SammLanguageSettingsService);
  private notificationsService = inject(NotificationsService);

  connect(parentMetaModel: DefaultStructuredValue, childMetaModel: DefaultProperty, first: Cell, second: Cell): void {
    const isRecursiveConnection = MaxGraphHelper.isChildOf(childMetaModel, parentMetaModel);

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

    MaxGraphHelper.updateLabel(parentCell, this.maxgraphAttributeService.graph, this.sammLangService);
    this.maxgraphService.assignToParent(childCell, parentCell);
    this.maxgraphService.formatCell(parentCell);
    this.maxgraphService.formatShapes();
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

    if (isStartsWithDelimiter) {
      parentMetaModel.elements.unshift(childMetaModel);
    } else {
      if (isEndsWithDelimiter) {
        parentMetaModel.elements.push(childMetaModel);
      }
    }
  }
}
