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
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import {Injectable} from '@angular/core';
import {DefaultTrait} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {MxGraphService} from '../mx-graph.service';
import {BaseRenderService} from './base-render-service';

@Injectable({
  providedIn: 'root',
})
export class TraitRenderService extends BaseRenderService {
  constructor(
    mxGraphService: MxGraphService,
    sammLangService: SammLanguageSettingsService,
    protected loadedFilesService: LoadedFilesService,
  ) {
    super(mxGraphService, sammLangService, loadedFilesService);
  }

  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultTrait;
  }
}
