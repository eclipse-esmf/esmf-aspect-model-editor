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
import {DefaultEntity, DefaultEnumeration, DefaultProperty, Entity} from '@esmf/aspect-model-loader';

export interface IEntityInstanceService {
  onPropertyRemove(property: DefaultProperty, acceptCallback: () => void): void;
  onNewProperty(property: DefaultProperty, entity: Entity): void;
  onEntityRemove(entity: DefaultEntity, acceptCallback: () => void): void;
  onEntityDisconnect(characteristic: DefaultEnumeration, entity: DefaultEntity, acceptCallback: () => void): void;
}

export const ENTITY_INSTANCE_SERVICE = new InjectionToken<IEntityInstanceService>('ENTITY_INSTANCE_SERVICE');
