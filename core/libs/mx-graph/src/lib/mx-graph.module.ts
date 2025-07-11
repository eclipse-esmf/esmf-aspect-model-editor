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

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  MxGraphAttributeService,
  MxGraphGeometryProviderService,
  MxGraphService,
  MxGraphSetupService,
  MxGraphShapeOverlayService,
  MxGraphShapeSelectorService,
} from './services';

@NgModule({
  providers: [
    MxGraphAttributeService,
    MxGraphGeometryProviderService,
    MxGraphService,
    MxGraphSetupService,
    MxGraphShapeOverlayService,
    MxGraphShapeSelectorService,
  ],
  exports: [],
  imports: [CommonModule],
})
export class MxGraphModule {}
