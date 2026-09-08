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
  Characteristic,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultCollection,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEnumeration,
  DefaultEvent,
  DefaultOperation,
  DefaultProperty,
  DefaultQuantifiable,
  DefaultScalar,
  DefaultStructuredValue,
  DefaultTrait,
  DefaultUnit,
  DefaultValue,
  Property,
} from '@esmf/aspect-model-loader';

export const DEFAULT_TEST_VERSION = '2.0.0';

export const createTestScalar = (urn = 'http://www.w3.org/2001/XMLSchema#string', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultScalar({urn, metaModelVersion});

export const createTestAspect = (name = 'TestAspect', urn = 'urn:aspect', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultAspect({name, aspectModelUrn: urn, metaModelVersion});

export const createTestProperty = (name = 'TestProperty', urn = 'urn:prop', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultProperty({name, aspectModelUrn: urn, metaModelVersion});

export const createTestCharacteristic = (name = 'TestCharacteristic', urn = 'urn:char', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultCharacteristic({name, aspectModelUrn: urn, metaModelVersion});

export const createTestEntity = (name = 'TestEntity', urn = 'urn:entity', isAbstract = false, metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultEntity({name, aspectModelUrn: urn, isAbstract, metaModelVersion});

export const createTestCollection = (name = 'TestCollection', urn = 'urn:collection', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultCollection({name, aspectModelUrn: urn, metaModelVersion});

export const createTestEither = (
  name = 'TestEither',
  urn = 'urn:either',
  left: Characteristic | null = null,
  right: Characteristic | null = null,
  metaModelVersion = DEFAULT_TEST_VERSION,
) => new DefaultEither({name, aspectModelUrn: urn, left: left as Characteristic, right: right as Characteristic, metaModelVersion});

export const createTestEnumeration = (
  name = 'TestEnumeration',
  urn = 'urn:enum',
  values: DefaultValue[] = [],
  metaModelVersion = DEFAULT_TEST_VERSION,
) => new DefaultEnumeration({name, aspectModelUrn: urn, values, metaModelVersion});

export const createTestValue = (name = 'TestValue', urn = 'urn:val', value = 'val', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultValue({name, aspectModelUrn: urn, value, metaModelVersion});

export const createTestEvent = (name = 'TestEvent', urn = 'urn:event', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultEvent({name, aspectModelUrn: urn, metaModelVersion});

export const createTestOperation = (
  name = 'TestOperation',
  urn = 'urn:op',
  input: Property[] = [],
  metaModelVersion = DEFAULT_TEST_VERSION,
) => new DefaultOperation({name, aspectModelUrn: urn, input, metaModelVersion});

export const createTestQuantifiable = (name = 'TestQuantifiable', urn = 'urn:quant', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultQuantifiable({name, aspectModelUrn: urn, metaModelVersion});

export const createTestUnit = (name = 'TestUnit', urn = 'urn:unit', quantityKinds: any[] = [], metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultUnit({name, aspectModelUrn: urn, quantityKinds, metaModelVersion});

export const createTestStructuredValue = (
  name = 'TestStructuredValue',
  urn = 'urn:sv',
  deconstructionRule = '',
  elements: Array<string | Property> = [],
  metaModelVersion = DEFAULT_TEST_VERSION,
) => new DefaultStructuredValue({name, aspectModelUrn: urn, deconstructionRule, elements, metaModelVersion});

export const createTestTrait = (name = 'TestTrait', urn = 'urn:trait', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultTrait({name, aspectModelUrn: urn, metaModelVersion});

export const createTestConstraint = (name = 'TestConstraint', urn = 'urn:constraint', metaModelVersion = DEFAULT_TEST_VERSION) =>
  new DefaultConstraint({name, aspectModelUrn: urn, metaModelVersion});
