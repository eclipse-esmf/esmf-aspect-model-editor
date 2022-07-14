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

import {DefaultEnumeration, DefaultEntityValue} from '@ame/meta-model';

export interface ILastSavedModel {
  rdf: string;
  changed: boolean;
  date: Date;
}

export interface IEnumEntityValue {
  enumeration?: DefaultEnumeration;
  entityValue: DefaultEntityValue;
  parentEntityValue?: DefaultEntityValue;
}
