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

import {ElementRelationUtil, getModelElement, SIDEBAR_STATE_SERVICE, TitleService} from '@ame/shared';
import {inject, Injectable} from '@angular/core';
import {DefaultAspect, NamedElement} from '@esmf/aspect-model-loader';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class AspectModelService extends BaseModelService {
  private readonly titleService = inject(TitleService);
  private readonly sidebarStateService = inject(SIDEBAR_STATE_SERVICE, {optional: true});

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultAspect;
  }

  update(cell: any, form: {[key: string]: any}) {
    const metaModelElement = getModelElement<DefaultAspect>(cell);
    if (form.name && form.name !== metaModelElement.name) {
      this.loadedFilesService.currentLoadedFile.originalAspectModelUrn = metaModelElement.aspectModelUrn;
      this.loadedFilesService.updateAbsoluteName(this.loadedFile.absoluteName, `${this.loadedFile.namespace}:${form.name}.ttl`);
    }
    super.update(cell, form);

    if (form.editedProperties) {
      if (!metaModelElement.propertiesPayload) {
        metaModelElement.propertiesPayload = {};
      }
      for (const property of metaModelElement.properties) {
        const newKeys = form.editedProperties[property.aspectModelUrn];
        if (!newKeys) {
          continue;
        }
        if (!metaModelElement.propertiesPayload[property.aspectModelUrn]) {
          metaModelElement.propertiesPayload[property.aspectModelUrn] = {} as any;
        }

        metaModelElement.propertiesPayload[property.aspectModelUrn].notInPayload = newKeys.notInPayload;
        metaModelElement.propertiesPayload[property.aspectModelUrn].optional = newKeys.optional;
        metaModelElement.propertiesPayload[property.aspectModelUrn].payloadName = newKeys.payloadName;
      }
    }

    this.graphAdapter?.updateCell(cell);
    this.titleService.updateTitle(this.loadedFile.absoluteName);
    this.sidebarStateService?.workspace?.refresh?.();
  }

  delete(cell: any) {
    const aspect = getModelElement(cell);
    const outgoingEdges = this.graphAdapter?.getOutgoingEdges(cell) || [];
    for (const {target} of outgoingEdges) {
      ElementRelationUtil.removeRelation(aspect, getModelElement(target), this.loadedFilesService);
    }
    super.delete(cell);
    this.graphAdapter?.deleteAspectCell(cell);
  }
}
