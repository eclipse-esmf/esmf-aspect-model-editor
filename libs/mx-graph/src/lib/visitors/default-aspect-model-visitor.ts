/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Copyright (c) 2020 Robert Bosch Manufacturing Solutions GmbH, Germany. All rights reserved.
 */

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
} from '@bame/meta-model';
import {AspectModelVisitor} from './aspect-model-visitor';

export class DefaultAspectModelVisitor<T, U> implements AspectModelVisitor<T, U> {
  visit(element: BaseMetaModelElement, context: U): T {
    const item: U = element.accept(<any>this, context);

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
