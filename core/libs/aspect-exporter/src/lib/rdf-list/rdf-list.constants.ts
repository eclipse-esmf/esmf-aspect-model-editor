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
import {Relations} from './rdf-list.types';

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
      // DefaultAbstractEntity can be created by DefaultEntity with isAbstract flag
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
}
