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

import {Type, Unit} from '@ame/meta-model';
import {LocaleInterface} from './locale.interface';

export interface BasePropertiesInterface {
  name?: string;
  preferredName?: LocaleInterface[];
  description?: LocaleInterface[];
  see?: string[];
  refines?: string;
  extends?: string;
  characteristic?: string;

  // characteristic
  dataType?: string;

  // property
  optional?: boolean;
  notInPayload?: boolean;
  payloadName?: string;
  exampleValue?: string;

  // constraints
  characteristicType?: Type;
  minValue?: any;
  maxValue?: any;
  lowerBoundDefinition?: any;
  upperBoundDefinition?: any;
  scale?: number;
  integer?: number;
  languageCode?: string;
  value?: any;
  localeCode?: string;

  // nodes
  constraint?: string;

  //units
  commonCode?: string;
  referenceUnit?: Unit;
  symbol?: string;
  conversionFactor?: string;
  numericConversionFactor?: string;
}
