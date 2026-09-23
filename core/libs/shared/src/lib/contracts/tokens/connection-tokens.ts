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

import {InjectionToken} from '@angular/core';

export interface IShapeConnectorService {
  connectShapes(firstModelElement: any, secondModelElement: any, firstCell: any, secondCell: any, modelInfo?: any): any;
  createAndConnectShape(metaModel: any, source: any, modelInfo?: any): any;
  connectSelectedElements(cells?: any[]): any;
}

export const SHAPE_CONNECTOR_SERVICE = new InjectionToken<IShapeConnectorService>('SHAPE_CONNECTOR_SERVICE');
