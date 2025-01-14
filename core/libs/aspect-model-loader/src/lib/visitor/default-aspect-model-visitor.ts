/*
 * Copyright (c) 2023 Robert Bosch Manufacturing Solutions GmbH
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
  Aspect,
  Characteristic,
  Constraint,
  DefaultProperty,
  DefaultScalar,
  Entity,
  EntityInstance,
  Event,
  Operation,
  Property,
  QuantityKind,
  Unit,
} from '../aspect-meta-model';
import {NamedElement} from '../aspect-meta-model/named-element';
import {ScalarValue} from '../aspect-meta-model/scalar-value';
import {ModelVisitor} from './model-visitor';

export class DefaultAspectModelVisitor<T extends NamedElement, U> implements ModelVisitor<T, U> {
  skipProperties: Array<string> = ['_wrappedProperty', '_parents', 'parents'];

  /**
   * Visits each element and performs an operation on it.
   *
   * @param {NamedElement} element element to visit.
   * @param {U} context context for visiting the element.
   * @return {T} result of visiting the element.
   */
  visit(element: NamedElement, context: U): T {
    const item: U = element.accept(<any>this, context);
    this.getObjectKeys(element).forEach(attributeKey => {
      const attributeValue: any = this.getValue(attributeKey, element);
      if (this.skipProperties.find(prop => attributeKey === prop) == undefined) {
        if (this.isPropertyInstanceDefinition(attributeValue)) {
          return this.visit(attributeValue, item);
        } else if (Array.isArray(attributeValue)) {
          attributeValue.forEach(arrayElement => {
            if (this.isPropertyInstanceDefinition(arrayElement)) {
              return this.visit(arrayElement, item);
            }
          });
        }
      }
    });
    return null;
  }

  private getObjectKeys(element: NamedElement): Array<string> {
    return Object.keys(element);
  }

  private getValue(key: string, element: NamedElement): any {
    return element[key];
  }

  private isPropertyInstanceDefinition(attributeValue: any): boolean {
    return attributeValue instanceof DefaultProperty;
  }

  visitAspect(aspect: Aspect, context: U): T {
    return undefined;
  }

  visitCharacteristic(characteristic: Characteristic, context: U): T {
    return undefined;
  }

  visitConstraint(constraint: Constraint, context: U): T {
    return undefined;
  }

  visitEntity(entity: Entity, context: U): T {
    return undefined;
  }

  visitOperation(operation: Operation, context: U): T {
    return undefined;
  }

  visitEvent(unit: Event, context: U): T {
    return undefined;
  }

  visitProperty(property: Property, context: U): T {
    return undefined;
  }

  visitQuantityKind(quantityKind: QuantityKind, context: U): T {
    return undefined;
  }

  visitUnit(unit: Unit, context: U): T {
    return undefined;
  }

  visitScalar(scalar: DefaultScalar, context: U): T {
    return undefined;
  }

  visitScalarValue(scalarValue: ScalarValue, context: U): T {
    return undefined;
  }

  visitEntityInstance(scalarValue: EntityInstance, context: U): T {
    return undefined;
  }
}
