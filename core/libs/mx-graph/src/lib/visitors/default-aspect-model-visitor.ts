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

/* eslint-disable @typescript-eslint/no-unused-vars */
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

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Base,
  BaseMetaModelElement,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantityKind,
  DefaultUnit,
} from '@ame/meta-model';
import {AspectModelVisitor} from './aspect-model-visitor';

export class DefaultAspectModelVisitor<T, U> implements AspectModelVisitor<T, U> {

  visitedElements = []; // Keep track of already visited elements

  visit(element: BaseMetaModelElement, context: U): T {
    let wasVisited = false;
    if (this.visitedElements.includes(element)) {
      wasVisited = true;
    } else {
      this.visitedElements.push(element);
    }
    const item: U = element.accept(<any>this, context);
    if (wasVisited) {
      // In case the element was visited -> don't visit its lower attributes since they were already visited previously
      // This avoids duplication of bamm-c elements
      // TODO: Might need further investigation
      return null;
    }

    if (item) {
      // by heaving attribute 'parents' on entityValue we will call this recursively forever so we need to exclude it
      Object.keys(element)
        .filter(attributeName => attributeName !== 'parents')
        .forEach(attributeName => {
          const attributeValue: any = element[attributeName];
          if (attributeValue instanceof Base) {
            return this.visit(attributeValue, item);
          }

          if (attributeValue?.property && attributeValue?.keys) {
            return this.visit(attributeValue.property, item);
          }

          if (Array.isArray(attributeValue)) {
            return attributeValue.forEach(arrayElement => {
              if (arrayElement instanceof Base) {
                return this.visit(arrayElement, item);
              }

              if (arrayElement?.value instanceof DefaultEntityValue) {
                return this.visit(arrayElement.value, item);
              }

              if (arrayElement.property && arrayElement.keys) {
                return this.visit(arrayElement.property, item);
              }
              return null;
            });
          }
        });
    }

    return null;
  }

  visitAspect(aspect: DefaultAspect, context: U): T {
    return undefined;
  }

  visitCharacteristic(characteristic: DefaultCharacteristic, context: U): T {
    return undefined;
  }

  visitConstraint(constraint: DefaultConstraint, context: U): T {
    return undefined;
  }

  visitEntity(entity: DefaultEntity, context: U): T {
    return undefined;
  }

  visitOperation(operation: DefaultOperation, context: U): T {
    return undefined;
  }

  visitProperty(property: DefaultProperty, context: U): T {
    return undefined;
  }

  visitQuantityKind(quantityKind: DefaultQuantityKind, context: U): T {
    return undefined;
  }

  visitUnit(unit: DefaultUnit, context: U): T {
    return undefined;
  }

  visitEntityValue(entityValue: DefaultEntityValue, context: U): T {
    return undefined;
  }

  visitEvent(event: DefaultEvent, context: U): T {
    return undefined;
  }
}
