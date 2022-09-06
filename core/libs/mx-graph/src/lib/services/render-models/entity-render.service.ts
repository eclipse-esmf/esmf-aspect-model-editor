/*
 * Copyright (c) 2022 Robert Bosch Manufacturing Solutions GmbH
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
import {DefaultEntity} from '@ame/meta-model';
import {LanguageSettingsService} from '@ame/settings-dialog';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';
import {BaseEntityRendererService} from './base-entity-renderer.service';

@Injectable({
  providedIn: 'root',
})
export class EntityRenderService extends BaseRenderService {
  constructor(
    mxGraphService: MxGraphService,
    languageSettingsService: LanguageSettingsService,
    private baseEntityRenderer: BaseEntityRendererService
  ) {
    super(mxGraphService, languageSettingsService);
  }

  update({cell}) {
    this.baseEntityRenderer.handleExtendsElement(cell);
    this.renderParents(cell);
    super.update({
      cell,
      callback: () => {
        this.renderOptionalProperties(cell);
      },
    });
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultEntity;
  }
}
