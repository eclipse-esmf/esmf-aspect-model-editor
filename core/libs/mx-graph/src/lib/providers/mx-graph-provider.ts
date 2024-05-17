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

import {mxgraphFactory} from 'mxgraph-factory';

export const {
  mxGraph,
  mxUtils,
  mxEvent,
  mxEditor,
  mxConstants,
  mxStackLayout,
  mxCompactTreeLayout,
  mxHierarchicalLayout,
  mxLayoutManager,
  mxCell,
  mxGeometry,
  mxPoint,
  mxOutline,
  mxCodec,
  mxCellOverlay,
  mxImage,
  mxRectangle,
  mxRubberband,
  mxCodecRegistry
} = mxgraphFactory({
  mxImageBasePath: 'assets/mxgraph/images',
  mxBasePath: 'assets/mxgraph',
  mxLoadResources: false,
  mxLoadStylesheets: false,
  mxResourceExtension: '.properties'
});
