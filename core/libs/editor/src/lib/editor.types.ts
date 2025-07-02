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

import {DefaultEntityInstance, DefaultEnumeration} from '@esmf/aspect-model-loader';

export interface ILastSavedModel {
  rdf: string;
  changed: boolean;
  date: Date;
}

export interface IEnumEntityValue {
  enumeration?: DefaultEnumeration;
  entityValue: DefaultEntityInstance;
  parentEntityValue?: DefaultEntityInstance;
}

export enum CharacteristicClassType {
  Collection = 'Collection',
  Set = 'Set',
  SortedSet = 'SortedSet',
  List = 'List',
  TimeSeries = 'TimeSeries',
  Measurement = 'Measurement',
  Quantifiable = 'Quantifiable',
  Duration = 'Duration',
  Either = 'Either',
  Characteristic = 'Characteristic',
  Code = 'Code',
  Enumeration = 'Enumeration',
  SingleEntity = 'SingleEntity',
  State = 'State',
  StructuredValue = 'StructuredValue',
}
