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

import {ShapeConnectorService} from '@ame/connection';
import {MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {inject, Injectable} from '@angular/core';
import {DefaultEntity} from '@esmf/aspect-model-loader';

@Injectable({providedIn: 'root'})
export class BaseEntityModelService {
  private notificationService = inject(NotificationsService);
  private shapeConnectorService = inject(ShapeConnectorService);
  private mxGraphService = inject(MxGraphService);
  private translate = inject(LanguageTranslationService);

  checkExtendedElement(metaModelElement: DefaultEntity, extendedElement: DefaultEntity) {
    if (!(extendedElement instanceof DefaultEntity)) {
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

    if (
      extendedElement &&
      extendedElement instanceof DefaultEntity &&
      extendedElement.isAbstractEntity() &&
      !extendedElement.isPredefined
    ) {
      this.shapeConnectorService.connectShapes(
        metaModelElement,
        extendedElement,
        this.mxGraphService.resolveCellByModelElement(metaModelElement),
        resolvedCell,
      );
    }

    metaModelElement.extends_ = extendedElement;
  }
}
