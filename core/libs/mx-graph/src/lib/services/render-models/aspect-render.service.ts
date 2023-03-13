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
import {DefaultAspect} from '@ame/meta-model';
import {MxGraphHelper} from '@ame/mx-graph';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {RendererUpdatePayload} from '../../models';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {RdfService} from '@ame/rdf/services';
import {NamedNode} from 'n3';

@Injectable({
  providedIn: 'root',
})
export class AspectRenderService extends BaseRenderService {
  constructor(mxGraphService: MxGraphService, languageSettingsService: LanguageSettingsService, rdfService: RdfService) {
    super(mxGraphService, languageSettingsService, rdfService);
  }

  update({cell}: RendererUpdatePayload) {
    super.update({
      cell,
      callback: () => {
        this.renderOptionalProperties(cell);
      },
    });
  }

  delete(cell: mxgraph.mxCell) {
    const aspectModelElement = MxGraphHelper.getModelElement(cell);
    const store = this.rdfService.currentRdfModel.store;

    const aspectQuads = store.getQuads(new NamedNode(aspectModelElement.aspectModelUrn), null, null, null);
    store.removeQuads(aspectQuads);

    this.mxGraphService.removeCells([cell]);
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultAspect;
  }
}
