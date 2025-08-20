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

import {ModelTree} from '@ame/loader-filters';
import {
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantityKind,
  DefaultUnit,
  NamedElement,
} from '@esmf/aspect-model-loader';

export interface ModelRenderer<T, U> {
  render(elementTree: ModelTree<NamedElement>, context: U): T;

  renderProperty(property: ModelTree<DefaultProperty>, context: U): T;

  renderAbstractProperty(abstractProperty: ModelTree<DefaultProperty>, context: U): T;

  renderAspect(aspect: ModelTree<DefaultAspect>, context: U): T;

  renderEvent(event: ModelTree<DefaultEvent>, context: U): T;

  renderOperation(operation: ModelTree<DefaultOperation>, context: U): T;

  renderConstraint(constraint: ModelTree<DefaultConstraint>, context: U): T;

  renderCharacteristic(characteristic: ModelTree<DefaultCharacteristic>, context: U): T;

  renderUnit(unit: ModelTree<DefaultUnit>, context: U): T;

  renderQuantityKind(quantityKind: ModelTree<DefaultQuantityKind>, context: U): T;

  renderEntity(entity: ModelTree<DefaultEntity>, context: U): T;

  renderAbstractEntity(abstractEntity: ModelTree<DefaultEntity>, context: U): T;

  renderEntityValue(entityValue: ModelTree<DefaultEntityInstance>, context: U): T;
}
