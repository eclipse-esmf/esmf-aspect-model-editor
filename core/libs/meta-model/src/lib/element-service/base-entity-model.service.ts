/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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

import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {NotificationsService} from '@ame/shared';
import {Injectable} from '@angular/core';
import {CanExtend, DefaultAbstractEntity, DefaultEntity} from '../aspect-meta-model';

@Injectable({
  providedIn: 'root',
})
export class BaseEntityModelService {
  constructor(private mxGraphService: MxGraphService, private notificationService: NotificationsService) {}

  checkExtendedElement(metaModelElement: CanExtend, extendedElement: CanExtend) {
    if (extendedElement && ![DefaultEntity, DefaultAbstractEntity].some(c => extendedElement instanceof c)) {
      return;
    }

    const resolvedCell = extendedElement && this.mxGraphService.resolveCellByModelElement(extendedElement);

    if (resolvedCell && MxGraphHelper.isEntityCycleInheritance(resolvedCell, metaModelElement, this.mxGraphService.graph)) {
      this.notificationService.warning('Recursive elements', 'Can not connect elements due to circular connection', null, 5000);
      return;
    }

    metaModelElement.extendedElement = extendedElement;
  }
}
