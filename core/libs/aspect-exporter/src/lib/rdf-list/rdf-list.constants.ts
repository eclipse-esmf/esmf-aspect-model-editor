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
  DefaultAspect,
  DefaultEntity,
  DefaultEnumeration,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultStructuredValue,
  DefaultUnit,
  Samm,
  SammC,
} from '@esmf/aspect-model-loader';
import {NamedNode} from 'n3';
import {ListProperties, Relations} from './rdf-list.types';

export class RdfListConstants {
  static getRelations(samm: Samm, sammC: SammC): Relations[] {
    return [
      {
        source: DefaultAspect,
        children: [
          {type: DefaultProperty, predicate: samm.PropertiesProperty()},
          {type: DefaultOperation, predicate: samm.OperationsProperty()},
          {type: DefaultEvent, predicate: samm.EventsProperty()},
        ],
      },
      {
        source: DefaultOperation,
        children: [{type: DefaultProperty, predicate: samm.InputProperty()}],
      },
      {
        source: DefaultEntity,
        children: [
          {type: DefaultProperty, predicate: samm.PropertiesProperty()},
          {type: DefaultEntity, predicate: samm.PropertiesProperty()},
        ],
      },
      // {
      //   source: DefaultAbstractEntity,
      //   children: [
      //     {type: DefaultAbstractProperty, predicate: samm.PropertiesProperty()},
      //     {type: DefaultProperty, predicate: samm.PropertiesProperty()},
      //   ],
      // },
      {
        source: DefaultEnumeration,
        children: [{predicate: sammC.ValuesProperty()}],
      },
      {
        source: DefaultStructuredValue,
        children: [{predicate: sammC.ElementsProperty()}],
      },
      {
        source: DefaultUnit,
        children: [{type: DefaultUnit, predicate: samm.QuantityKindsProperty()}],
      },
      {
        source: DefaultEvent,
        children: [{type: DefaultProperty, predicate: samm.ParametersProperty()}],
      },
    ];
  }

  static getPredicateByKey(key: ListProperties, samm: Samm, sammC: SammC): NamedNode<string> {
    const predicates = {
      [ListProperties.elements]: sammC.ElementsProperty(),
      [ListProperties.values]: sammC.ValuesProperty(),
      [ListProperties.operations]: samm.OperationsProperty(),
      [ListProperties.properties]: samm.PropertiesProperty(),
      [ListProperties.abstractProperties]: samm.PropertiesProperty(),
      [ListProperties.input]: samm.InputProperty(),
      [ListProperties.quantityKinds]: samm.QuantityKindsProperty(),
      [ListProperties.events]: samm.EventsProperty(),
      [ListProperties.parameters]: samm.ParametersProperty(),
    };

    return predicates[key];
  }
}
