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

import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {NotificationsService} from '@ame/shared';
import {ShapeConnectorService} from '@ame/connection';
import {Injectable} from '@angular/core';
import {CanExtend, DefaultAbstractEntity, DefaultEntity} from '../aspect-meta-model';
import {LanguageTranslationService} from '@ame/translation';

@Injectable({
  providedIn: 'root',
})
export class BaseEntityModelService {
  constructor(
    private mxGraphService: MxGraphService,
    private notificationService: NotificationsService,
    private shapeConnectorService: ShapeConnectorService,
    private translate: LanguageTranslationService,
  ) {}

  checkExtendedElement(metaModelElement: CanExtend, extendedElement: CanExtend) {
    if (extendedElement && ![DefaultEntity, DefaultAbstractEntity].some(c => extendedElement instanceof c)) {
      return;
    }

    const resolvedCell = extendedElement && this.mxGraphService.resolveCellByModelElement(extendedElement);

    if (resolvedCell && MxGraphHelper.isEntityCycleInheritance(resolvedCell, metaModelElement, this.mxGraphService.graph)) {
      this.notificationService.warning({
        title: this.translate.language.NOTIFICATION_SERVICE.RECURSIVE_ELEMENTS,
        message: this.translate.language.NOTIFICATION_SERVICE.CIRCULAR_CONNECTION_MESSAGE,
        timeout: 5000,
      });
      return;
    }

    if (extendedElement && extendedElement instanceof DefaultAbstractEntity && !extendedElement.predefined) {
      this.shapeConnectorService.connectShapes(
        metaModelElement,
        extendedElement,
        this.mxGraphService.resolveCellByModelElement(metaModelElement),
        resolvedCell,
      );
    }

    metaModelElement.extendedElement = extendedElement;
  }
}
