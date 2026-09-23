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

import {Injectable} from '@angular/core';
import {DefaultAspect} from '@esmf/aspect-model-loader';
import {Cell} from '@maxgraph/core';
import {NamedNode} from 'n3';
import {MaxGraphHelper} from '../../helpers';
import {RendererUpdatePayload} from '../../models';
import {BaseRenderService} from './base-render-service';

@Injectable({providedIn: 'root'})
export class AspectRenderService extends BaseRenderService {
  update({cell}: RendererUpdatePayload) {
    super.update({
      cell,
      callback: () => {
        this.renderOptionalProperties(cell);
      },
    });
  }

  delete(cell: Cell) {
    const modelElement = MaxGraphHelper.getModelElement(cell);
    const store = this.loadedFilesService.currentLoadedFile.rdfModel.store;

    const aspectQuads = store.getQuads(new NamedNode(modelElement.aspectModelUrn), null, null, null);
    store.removeQuads(aspectQuads);

    this.maxgraphService.removeCells([cell]);
  }

  isApplicable(cell: Cell): boolean {
    return MaxGraphHelper.getModelElement(cell) instanceof DefaultAspect;
  }
}
