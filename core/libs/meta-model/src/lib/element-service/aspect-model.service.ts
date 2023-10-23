/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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

import {Injectable} from '@angular/core';
import {BaseModelService} from './base-model-service';
import {BaseMetaModelElement, DefaultAspect, OverWrittenPropertyKeys} from '@ame/meta-model';
import {mxgraph} from 'mxgraph-factory';
import {AspectRenderService, MxGraphHelper, MxGraphService} from '@ame/mx-graph';
import {TitleService} from '@ame/shared';

@Injectable({providedIn: 'root'})
export class AspectModelService extends BaseModelService {
  constructor(private aspectRenderer: AspectRenderService, private titleService: TitleService, private mxGraphService: MxGraphService) {
    super();
  }

  isApplicable(metaModelElement: BaseMetaModelElement): boolean {
    return metaModelElement instanceof DefaultAspect;
  }

  update(cell: mxgraph.mxCell, form: {[key: string]: any}) {
    const metaModelElement = MxGraphHelper.getModelElement<DefaultAspect>(cell);
    if (!this.rdfService.currentRdfModel.originalAbsoluteFileName && form.name !== metaModelElement.name) {
      this.rdfService.currentRdfModel.originalAbsoluteFileName = this.rdfService.currentRdfModel.absoluteAspectModelFileName;
    }
    super.update(cell, form);

    if (form.editedProperties) {
      for (const {property, keys} of metaModelElement.properties) {
        const newKeys: OverWrittenPropertyKeys = form.editedProperties[property.aspectModelUrn];
        keys.notInPayload = newKeys.notInPayload;
        keys.optional = newKeys.optional;
        keys.payloadName = newKeys.payloadName;
      }
    }

    this.rdfService.currentRdfModel.aspectModelFileName = metaModelElement.name + '.ttl';
    this.aspectRenderer.update({cell});
    this.titleService.updateTitle(metaModelElement?.aspectModelUrn.replace('urn:samm:', '') + 'ttl', 'Aspect');
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
