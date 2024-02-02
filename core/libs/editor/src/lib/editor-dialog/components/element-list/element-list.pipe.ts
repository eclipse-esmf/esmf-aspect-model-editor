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
import {BaseMetaModelElement} from '@ame/meta-model';
import {elementShortcuts, getElementType} from '@ame/shared';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'modelElementParser',
})
export class ModelElementParser implements PipeTransform {
  transform(element: BaseMetaModelElement) {
    const type = getElementType(element);
    return {
      shortcut: elementShortcuts[type],
      element,
      type,
    };
  }
}
