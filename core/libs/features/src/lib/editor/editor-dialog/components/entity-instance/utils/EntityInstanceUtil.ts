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

import {CacheUtils} from '@ame/cache';
import {isDataTypeLangString} from '@ame/shared';
import {CacheStrategy, DefaultEntityInstance, DefaultProperty, DefaultTrait} from '@esmf/aspect-model-loader';

export class EntityInstanceUtil {
  static existingEntityValues(currentCachedFile: CacheStrategy, property: DefaultProperty): DefaultEntityInstance[] {
    return CacheUtils.getCachedElements(currentCachedFile, DefaultEntityInstance).filter(value => {
      const characteristic =
        property.characteristic instanceof DefaultTrait ? property.characteristic.baseCharacteristic : property.characteristic;
      return value.type.aspectModelUrn === characteristic?.dataType?.getUrn?.();
    });
  }

  static isDefaultPropertyWithLangString(property: DefaultProperty): boolean {
    return property instanceof DefaultProperty && isDataTypeLangString(property.characteristic?.dataType);
  }
}
