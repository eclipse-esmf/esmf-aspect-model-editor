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

import {
  BaseMetaModelElement,
  DefaultAspect,
  DefaultProperty,
  DefaultOperation,
  DefaultEvent,
  DefaultCharacteristic,
  DefaultTrait,
  DefaultAbstractProperty,
  DefaultConstraint,
  DefaultCollection,
  DefaultStructuredValue,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultUnit,
  DefaultAbstractEntity,
} from '@ame/meta-model';
import {ClassReference, ModelFilter} from './filter-loader.interface';

export class FilterRelation {
  constructor(
    public from: ClassReference<BaseMetaModelElement>,
    public to: ClassReference<BaseMetaModelElement>[],
    public exceptInFilter: {
      [ModelFilter.DEFAULT]?: ClassReference<BaseMetaModelElement>[];
      [ModelFilter.PROPERTIES]?: ClassReference<BaseMetaModelElement>[];
    } = {}
  ) {
    if (!this.exceptInFilter[ModelFilter.DEFAULT]) {
      this.exceptInFilter[ModelFilter.DEFAULT] = [];
    }

    if (!this.exceptInFilter[ModelFilter.PROPERTIES]) {
      this.exceptInFilter[ModelFilter.PROPERTIES] = [];
    }
  }

  isExceptions(element: BaseMetaModelElement, filterMode: ModelFilter) {
    return this.exceptInFilter[filterMode].some(c => element instanceof c);
  }
}

export const filterRelations = [
  new FilterRelation(DefaultAspect, [DefaultProperty, DefaultOperation, DefaultEvent]),
  new FilterRelation(DefaultProperty, [DefaultCharacteristic, DefaultTrait, DefaultAbstractProperty, DefaultProperty], {
    [ModelFilter.PROPERTIES]: [DefaultProperty],
  }),
  new FilterRelation(DefaultAbstractProperty, [DefaultAbstractProperty]),
  new FilterRelation(DefaultTrait, [DefaultConstraint, DefaultCharacteristic], {
    [ModelFilter.PROPERTIES]: [DefaultProperty],
  }),
  new FilterRelation(DefaultCollection, [DefaultCharacteristic]),
  new FilterRelation(DefaultStructuredValue, [DefaultProperty]),
  new FilterRelation(DefaultEither, [DefaultCharacteristic]),
  new FilterRelation(DefaultCharacteristic, [DefaultEntity, DefaultEntityValue, DefaultUnit]),
  new FilterRelation(DefaultEntity, [DefaultProperty, DefaultEntity, DefaultAbstractEntity]),
  new FilterRelation(DefaultEntityValue, [DefaultEntityValue, DefaultEntity]),
  new FilterRelation(DefaultEvent, [DefaultProperty]),
  new FilterRelation(DefaultOperation, [DefaultProperty]),
  new FilterRelation(DefaultUnit, [DefaultUnit]),
  new FilterRelation(DefaultAbstractEntity, [DefaultAbstractEntity, DefaultProperty, DefaultAbstractProperty]),
];
