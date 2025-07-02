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

import {AspectRenderService, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {TitleService} from '@ame/shared';
import {SidebarStateService} from '@ame/sidebar';
import {Injectable} from '@angular/core';
import {DefaultAspect, NamedElement} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {BaseModelService} from './base-model-service';

@Injectable({providedIn: 'root'})
export class AspectModelService extends BaseModelService {
  constructor(
    private aspectRenderer: AspectRenderService,
    private titleService: TitleService,
    private mxGraphService: MxGraphService,
    private sidebarStateService: SidebarStateService,
  ) {
    super();
  }

  isApplicable(metaModelElement: NamedElement): boolean {
    return metaModelElement instanceof DefaultAspect;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultAspect>(cell);
    if (form.name && form.name !== metaModelElement.name) {
      this.loadedFilesService.updateAbsoluteName(this.loadedFile.absoluteName, `${this.loadedFile.namespace}:${form.name}.ttl`);
    }
    super.update(cell, form);

    if (form.editedProperties) {
      for (const property of metaModelElement.properties) {
        const newKeys = form.editedProperties[property.aspectModelUrn];
        if (!metaModelElement.propertiesPayload[property.aspectModelUrn]) {
          metaModelElement.propertiesPayload[property.aspectModelUrn] = {} as any;
        }

        metaModelElement.propertiesPayload[property.aspectModelUrn].notInPayload = newKeys.notInPayload;
        metaModelElement.propertiesPayload[property.aspectModelUrn].optional = newKeys.optional;
        metaModelElement.propertiesPayload[property.aspectModelUrn].payloadName = newKeys.payloadName;
      }
    }

    this.aspectRenderer.update({cell});
    this.titleService.updateTitle(this.loadedFile.absoluteName);
    this.sidebarStateService.workspace.refresh();
  }

  delete(cell: mxgraph.mxCell) {
    const aspect = MxGraphHelper.getModelElement(cell);
    for (const {target} of this.mxGraphService.graph.getOutgoingEdges(cell)) {
      MxGraphHelper.removeRelation(aspect, MxGraphHelper.getModelElement(target));
    }
    super.delete(cell);
    this.aspectRenderer.delete(cell);
  }
}
