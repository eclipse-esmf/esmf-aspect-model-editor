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
import {DefaultEvent} from '@esmf/aspect-model-loader';
import {mxgraph} from 'mxgraph-factory';
import {MxGraphHelper} from '../../helpers';
import {BaseRenderService} from './base-render-service';

@Injectable({providedIn: 'root'})
export class EventRenderService extends BaseRenderService {
  isApplicable(cell: mxgraph.mxCell): boolean {
    return MxGraphHelper.getModelElement(cell) instanceof DefaultEvent;
  }
}
