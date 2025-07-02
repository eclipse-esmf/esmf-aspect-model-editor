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

import {LoadedFilesService} from '@ame/cache';
import {MxGraphHelper} from '@ame/mx-graph';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Injectable} from '@angular/core';
import {DefaultAspect} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {NamedNode} from 'n3';
import {RendererUpdatePayload} from '../../models';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';

@Injectable({
  providedIn: 'root',
})
export class AspectRenderService extends BaseRenderService {
  constructor(
    mxGraphService: MxGraphService,
    sammLangService: SammLanguageSettingsService,
    protected loadedFilesService: LoadedFilesService,
  ) {
    super(mxGraphService, sammLangService, loadedFilesService);
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
    const modelElement = MxGraphHelper.getModelElement(cell);
    const store = this.loadedFilesService.currentLoadedFile.rdfModel.store;

    const aspectQuads = store.getQuads(new NamedNode(modelElement.aspectModelUrn), null, null, null);
    store.removeQuads(aspectQuads);

    this.mxGraphService.removeCells([cell]);
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultAspect;
  }
}
