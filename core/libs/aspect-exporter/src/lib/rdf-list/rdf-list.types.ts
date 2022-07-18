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

import {Aspect, Entity, Enumeration, Operation, OverWrittenProperty, StructuredValue, Unit, Event} from '@ame/meta-model';
import {BlankNode, NamedNode, Quad_Object} from 'n3';

// For now ListElementType is any because
export type ListElementType = any;
export type SourceElementType = Aspect | Operation | Enumeration | StructuredValue | Entity | Unit | Event;
export enum ListProperties {
  properties = 'properties',
  abstractProperties = 'abstractProperties',
  operations = 'operations',
  input = 'input',
  values = 'values',
  elements = 'elements',
  quantityKinds = 'quantityKinds',
  events = 'events',
  parameters = 'parameters',
}

export interface ListElement {
  node: Quad_Object;
  name?: string;
}

export interface Relations {
  source: any;
  children: RelationsChild[];
}

export interface RelationsChild {
  type?: ListElementType;
  predicate: NamedNode;
}

export interface StoreListReferences {
  subject: NamedNode;
  predicate: NamedNode;
  list: Quad_Object;
  created: boolean;
  filterDuplicates: boolean;
  filteredList: ListElementType[];
}

export interface CreateEmptyRdfList {
  createEmpty(source: Aspect, property: ListProperties.properties | ListProperties.operations | ListProperties.events): void;
  createEmpty(source: Entity, property: ListProperties.properties | ListProperties.abstractProperties): void;
  createEmpty(source: Event, property: ListProperties.parameters): void;
  createEmpty(source: Enumeration, property: ListProperties.values): void;
  createEmpty(source: StructuredValue, property: ListProperties.elements): void;
  createEmpty(source: Unit, property: ListProperties.quantityKinds): void;
}

export interface EmptyRdfList {
  emptyList(source: Aspect, property: ListProperties.properties | ListProperties.operations | ListProperties.events): void;
  emptyList(source: Entity, property: ListProperties.properties | ListProperties.abstractProperties): void;
  emptyList(source: Event, property: ListProperties.parameters): void;
  emptyList(source: Enumeration, property: ListProperties.values): void;
  emptyList(source: StructuredValue, property: ListProperties.elements): void;
  emptyList(source: Unit, property: ListProperties.quantityKinds): void;
}

export interface OverWrittenListElement {
  metaModelElement: OverWrittenProperty;
  blankNode: BlankNode;
}

export interface ResolvedListElements {
  listElements: Quad_Object[];
  overWrittenListElements: OverWrittenListElement[];
}
