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

export enum MxAttributeName {
  META_MODEL_PROPERTY = 'metaModelProperty',
  META_MODEL_PROPERTY_LOCALE = 'metaModelPropertyLocale',
}

export class MxCellAttribute {
  constructor(public name: string, public value: string) {}
}

export class MxCellConfig {
  constructor(public label: string, public attributes: Array<MxCellAttribute>) {}
}
