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

import {LanguageTranslationService, NotificationsService} from '@ame/shared';
import {inject, Injectable, Injector} from '@angular/core';
import {DefaultEntity} from '@esmf/aspect-model-loader';
import {GraphAdapterPort} from '../../ports/graph-adapter.port';
import {ShapeConnectorPort} from '../../ports/shape-connector.port';

@Injectable({providedIn: 'root'})
export class BaseEntityModelService {
  private readonly notificationService = inject(NotificationsService);
  private readonly shapeConnectorService = inject(ShapeConnectorPort);
  private readonly injector = inject(Injector);
  private readonly translate = inject(LanguageTranslationService);

  private get graphAdapter(): GraphAdapterPort | null {
    return this.injector.get<GraphAdapterPort | null>(GraphAdapterPort, null, {optional: true});
  }

  checkExtendedElement(metaModelElement: DefaultEntity, extendedElement: DefaultEntity) {
    if (!(extendedElement instanceof DefaultEntity)) {
      return;
    }

    const resolvedCell = extendedElement && this.graphAdapter?.resolveCellByModelElement(extendedElement);

    if (resolvedCell && this.graphAdapter?.isEntityCycleInheritance(resolvedCell, metaModelElement)) {
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
        this.graphAdapter?.resolveCellByModelElement(metaModelElement),
        resolvedCell,
      );
    }

    metaModelElement.extends_ = extendedElement;
  }
}
