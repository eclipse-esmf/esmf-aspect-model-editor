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

/**
 * Default visitor to traverse alle concepts defined within the different namespaces.
 */
export class DefaultNamespaceVisitor implements ModelVisitor<NamedElement, Map<string, Array<NamedElement>>> {
  /**
   * Visits each element in the provided map and performs an operation on it.
   *
   * @param {Map<string, Array<NamedElement>>} map map of elements to visit. The key represents the namespace of the elements of the array.
   */
  public visit(map: Map<string, Array<NamedElement>>): void {
    for (const mapKey of map.keys()) {
      const modelElements: Array<NamedElement> = map.get(mapKey);
      for (const element of modelElements) {
        element.accept(this, map);
      }
    }
  }

  visitAspect(aspect: Aspect, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitCharacteristic(characteristic: Characteristic, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitConstraint(constraint: Constraint, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitEntity(entity: Entity, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitOperation(operation: Operation, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitEvent(unit: Event, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitProperty(property: Property, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitQuantityKind(quantityKind: QuantityKind, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitUnit(unit: Unit, context: Map<string, Array<NamedElement>>): NamedElement {
    return undefined;
  }

  visitScalar(scalar: DefaultScalar, context: Map<string, NamedElement[]>) {
    return undefined;
  }

  visitScalarValue(scalarValue: ScalarValue, context: Map<string, NamedElement[]>) {
    return undefined;
  }

  visitEntityInstance(scalarValue: EntityInstance, context: Map<string, NamedElement[]>) {
    return undefined;
  }
}
