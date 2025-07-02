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
/* eslint-disable @typescript-eslint/no-empty-interface */

import {
  Characteristic,
  Constraint,
  DefaultScalar,
  Entity,
  Event,
  Operation,
  PropertyUrn,
  QuantityKind,
  Type,
  Unit,
} from '../aspect-meta-model';
import {BoundDefinition} from '../aspect-meta-model/bound-definition';
import {ComplexType} from '../aspect-meta-model/complex-type';
import {Property} from '../aspect-meta-model/default-property';
import {LangString} from '../aspect-meta-model/named-element';
import {Value} from '../aspect-meta-model/value';

export interface BaseProps {
  metaModelVersion: string;
}

export interface NamedElementProps extends BaseProps {
  aspectModelUrn: string;
  name: string;
  hasSyntheticName?: boolean;
  preferredNames?: Map<LangString, string>;
  descriptions?: Map<LangString, string>;
  see?: string[];
  isAnonymous?: boolean;
  isPredefined?: boolean;
}

export interface HasPropertiesProps {
  properties?: Property[];
}

export interface StructuredElementProps extends HasPropertiesProps, NamedElementProps {}

export interface ScalarValueProps extends Partial<NamedElementProps> {
  value: any;
  type: DefaultScalar;
}

export interface ScalarProps extends Omit<NamedElementProps, 'aspectModelUrn' | 'name'> {
  urn: string;
  scalar?: boolean;
  complexType?: boolean;
}

export interface AspectProps extends StructuredElementProps {
  isCollectionAspect?: boolean;
  operations?: Operation[];
  events?: Event[];
}

export interface EntityProps extends StructuredElementProps {
  isAbstract?: boolean;
  extends_?: ComplexType;
  extendingElements?: ComplexType[];
}

export interface PropertyProps extends NamedElementProps {
  characteristic?: Characteristic;
  exampleValue?: string;
  isAbstract?: boolean;
  extends_?: Property;
}

export interface EventProps extends StructuredElementProps {}

export interface EntityInstanceProps extends NamedElementProps {
  type?: Entity;
  assertions?: Map<PropertyUrn, Value>;
}

export interface QuantityKindProps extends NamedElementProps {
  label: string;
}

export interface UnitProps extends NamedElementProps {
  symbol?: string;
  code?: string;
  referenceUnit?: Unit;
  conversionFactor?: string;
  numericConversionFactor?: number;
  commonCode?: string;
  quantityKinds: QuantityKind[];
}

export interface OperationProps extends NamedElementProps {
  input: Property[];
  output?: Property;
}

// Characteristics props
export interface CharacteristicProps extends NamedElementProps {
  dataType?: Type;
}

export interface CollectionProps extends CharacteristicProps {
  allowDuplicates?: boolean;
  ordered?: boolean;
  elementCharacteristic?: Characteristic;
}

export interface QuantifiableProps extends CharacteristicProps {
  unit?: Unit;
}

export interface EitherProps extends CharacteristicProps {
  left: Characteristic;
  right: Characteristic;
}

export interface EnumerationProps extends CharacteristicProps {
  values: Value[];
}

export interface StateProps extends EnumerationProps {
  defaultValue: Value;
}

export interface StructuredValueProps extends CharacteristicProps {
  deconstructionRule: string;
  elements: Array<string | Property>;
}

export interface TraitProps extends CharacteristicProps {
  baseCharacteristic?: Characteristic;
  constraints?: Constraint[];
}

// Constraint props
export interface ConstraintProps extends NamedElementProps {}

export interface EncodingConstraintProps extends ConstraintProps {
  value: string;
}

export interface RegularExpressionConstraintProps extends ConstraintProps {
  value: string;
}

export interface FixedPointConstraintProps extends ConstraintProps {
  scale: number;
  integer: number;
}

export interface LanguageConstraintProps extends ConstraintProps {
  languageCode: LangString;
}

export interface LengthConstraintProps extends ConstraintProps {
  minValue?: number;
  maxValue?: number;
}

export interface LocaleConstraintProps extends ConstraintProps {
  localeCode: LangString;
}

export interface RangeConstraintProps extends ConstraintProps {
  minValue?: number;
  maxValue?: number;
  upperBoundDefinition?: BoundDefinition;
  lowerBoundDefinition?: BoundDefinition;
}
