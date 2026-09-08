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

import {ModelStyle} from '../../models';

export const MODEL_NODES = [
  ModelStyle.ASPECT,
  ModelStyle.PROPERTY,
  ModelStyle.OPERATION,
  ModelStyle.EVENT,
  ModelStyle.CHARACTERISTIC,
  ModelStyle.CONSTRAINT,
  ModelStyle.ENTITY,
  ModelStyle.VALUE,
  ModelStyle.ABSTRACT_ENTITY,
  ModelStyle.ABSTRACT_PROPERTY,
  ModelStyle.UNIT,
] as const;

export const MODEL_PROPERTIES = [
  ModelStyle.ASPECT_PROP,
  ModelStyle.PROPERTY_PROP,
  ModelStyle.OPERATION_PROP,
  ModelStyle.EVENT_PROP,
  ModelStyle.CHARACTERISTIC_PROP,
  ModelStyle.CONSTRAINT_PROP,
  ModelStyle.ENTITY_PROP,
  ModelStyle.ABSTRACT_ENTITY_PROP,
  ModelStyle.ABSTRACT_PROPERTY_PROP,
  ModelStyle.UNIT_PROP,
  ModelStyle.TRAIT_PROP,
] as const;
