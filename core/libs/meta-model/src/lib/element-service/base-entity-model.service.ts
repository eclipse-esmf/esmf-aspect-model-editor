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

import {ShapeConnectorService} from '@ame/connection';
import {MaxGraphHelper, MaxGraphService} from '@ame/max-graph';
import {NotificationsService} from '@ame/shared';
import {LanguageTranslationService} from '@ame/translation';
import {inject, Injectable} from '@angular/core';
import {DefaultEntity} from '@esmf/aspect-model-loader';

@Injectable({providedIn: 'root'})
export class BaseEntityModelService {
  private readonly notificationService = inject(NotificationsService);
  private readonly shapeConnectorService = inject(ShapeConnectorService);
  private readonly maxgraphService = inject(MaxGraphService);
  private readonly translate = inject(LanguageTranslationService);

  checkExtendedElement(metaModelElement: DefaultEntity, extendedElement: DefaultEntity) {
    if (!(extendedElement instanceof DefaultEntity)) {
      return;
    }

    const resolvedCell = extendedElement && this.maxgraphService.resolveCellByModelElement(extendedElement);

    if (resolvedCell && MaxGraphHelper.isEntityCycleInheritance(resolvedCell, metaModelElement, this.maxgraphService.graph)) {
      this.notificationService.warning({
        title: this.translate.language.notificationService.recursiveElements,
        message: this.translate.language.notificationService.circularConnectionMessage,
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
        this.maxgraphService.resolveCellByModelElement(metaModelElement),
        resolvedCell,
      );
    }

    metaModelElement.extends_ = extendedElement;
  }
}
