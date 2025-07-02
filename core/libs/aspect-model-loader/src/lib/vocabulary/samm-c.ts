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

import {DataFactory, NamedNode} from 'n3';
import {BoundDefinition} from '../aspect-meta-model/bound-definition';
import {Samm} from './samm';

export class SammC {
  private alias = 'samm-c';

  constructor(private samm: Samm) {}

  getAlias(): string {
    return this.alias;
  }

  getUri(): string {
    return `${Samm.getBaseUri()}characteristic:${this.samm.version}`;
  }

  isStandardCharacteristic(elementUrn: string): boolean {
    return elementUrn.startsWith(this.getNamespace());
  }

  ElementCharacteristicProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}elementCharacteristic`);
  }

  isElementCharacteristicProperty(value: string): boolean {
    return this.ElementCharacteristicProperty().value === value;
  }

  isBaseCharacteristicProperty(value: string): boolean {
    return this.BaseCharacteristicProperty().value === value;
  }

  BaseCharacteristicProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}baseCharacteristic`);
  }

  isConstraintProperty(value: string): boolean {
    return this.ConstraintProperty().value === value;
  }

  ConstraintProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}constraint`);
  }

  getNamespace(): string {
    return `${this.getUri()}#`;
  }

  getAspectModelUrn(elementName: string): string {
    return `${this.getNamespace()}${elementName}`;
  }

  EncodingConstraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}EncodingConstraint`);
  }

  RangeConstraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}RangeConstraint`);
  }

  LanguageConstraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}LanguageConstraint`);
  }

  LocaleConstraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}LocaleConstraint`);
  }

  EitherCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Either`);
  }

  FixedPointConstraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}FixedPointConstraint`);
  }

  QuantifiableCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Quantifiable`);
  }

  LengthConstraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}LengthConstraint`);
  }

  RegularExpressionConstraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}RegularExpressionConstraint`);
  }

  DurationCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Duration`);
  }

  CodeCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Code`);
  }

  EnumerationCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Enumeration`);
  }

  MeasurementCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Measurement`);
  }

  SingleEntityCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}SingleEntity`);
  }

  AllowDuplicatesProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}allowDuplicates`);
  }

  isAllowDuplicatesProperty(value: string): boolean {
    return this.AllowDuplicatesProperty().value === value;
  }

  OrderedProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}ordered`);
  }

  isOrderedProperty(value: string): boolean {
    return this.OrderedProperty().value === value;
  }

  CollectionCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Collection`);
  }

  StructuredValueCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}StructuredValue`);
  }

  StateCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}State`);
  }

  SetCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Set`);
  }

  SortedSetCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}SortedSet`);
  }

  ListCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}List`);
  }

  TimeSeriesCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}TimeSeries`);
  }

  UnitProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}unit`);
  }

  isUnitProperty(value: string): boolean {
    return this.UnitProperty().value === value;
  }

  ValuesProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}values`);
  }

  isValuesProperty(value: string): boolean {
    return this.ValuesProperty().value === value;
  }

  DefaultValueProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}defaultValue`);
  }

  isDefaultValueProperty(value: string): boolean {
    return this.DefaultValueProperty().value === value;
  }

  MinValueProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}minValue`);
  }

  isMinValueProperty(value: string): boolean {
    return this.MinValueProperty().value === value;
  }

  MaxValueProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}maxValue`);
  }

  isMaxValueProperty(value: string): boolean {
    return this.MaxValueProperty().value === value;
  }

  UpperBoundDefinitionProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}upperBoundDefinition`);
  }

  isUpperBoundDefinitionProperty(value: string): boolean {
    return this.UpperBoundDefinitionProperty().value === value;
  }

  LowerBoundDefinitionProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}lowerBoundDefinition`);
  }

  isLowerBoundDefinitionProperty(value: string): boolean {
    return this.LowerBoundDefinitionProperty().value === value;
  }

  getUpperBoundDefinitionList(): Array<any> {
    return [
      {value: BoundDefinition.AT_MOST, isDefinedBy: `${this.getNamespace()}${BoundDefinition.AT_MOST}`},
      {value: BoundDefinition.LESS_THAN, isDefinedBy: `${this.getNamespace()}${BoundDefinition.LESS_THAN}`},
    ];
  }

  getLowerBoundDefinitionList(): Array<any> {
    return [
      {value: BoundDefinition.AT_LEAST, isDefinedBy: `${this.getNamespace()}${BoundDefinition.AT_LEAST}`},
      {value: BoundDefinition.GREATER_THAN, isDefinedBy: `${this.getNamespace()}${BoundDefinition.GREATER_THAN}`},
    ];
  }

  LanguageCodeProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}languageCode`);
  }

  isLanguageCodeProperty(value: string): boolean {
    return this.LanguageCodeProperty().value === value;
  }

  LocaleCodeProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}localeCode`);
  }

  isLocaleCodeProperty(value: string): boolean {
    return this.LocaleCodeProperty().value === value;
  }

  ScaleProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}scale`);
  }

  isScaleValueProperty(value: string): boolean {
    return this.ScaleProperty().value === value;
  }

  IntegerProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}integer`);
  }

  isIntegerValueProperty(value: string): boolean {
    return this.IntegerProperty().value === value;
  }

  EitherRightProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}right`);
  }

  isEitherRightProperty(value: string): boolean {
    return this.EitherRightProperty().value === value;
  }

  EitherLeftProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}left`);
  }

  isEitherLeftProperty(value: string): boolean {
    return this.EitherLeftProperty().value === value;
  }

  DeconstructionRuleProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}deconstructionRule`);
  }

  isDeconstructionRuleProperty(value: string): boolean {
    return this.DeconstructionRuleProperty().value === value;
  }

  ElementsProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}elements`);
  }

  isElementsProperty(value: string): boolean {
    return this.ElementsProperty().value === value;
  }

  TraitCharacteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Trait`);
  }

  get metaModelPluralNames() {
    return [this.samm.PropertiesProperty().value, this.samm.OperationsProperty().value, this.samm.EventsProperty().value];
  }

  get metaModelSingularNames() {
    return [this.samm.Property().value, this.samm.Operation().value, this.samm.Event().value];
  }

  getMetaModelNames(plural = true): Array<string> {
    return [
      this.samm.Aspect().value,
      ...(plural ? this.metaModelPluralNames : this.metaModelSingularNames),
      this.samm.OperationsProperty().value,
      this.samm.Characteristic().value,
      this.samm.Constraint().value,
      this.samm.Entity().value,
      this.samm.EventsProperty().value,
      this.LanguageConstraint().value,
      this.LocaleConstraint().value,
      this.RangeConstraint().value,
      this.EncodingConstraint().value,
      this.LengthConstraint().value,
      this.RegularExpressionConstraint().value,
      this.FixedPointConstraint().value,
      this.StateCharacteristic().value,
      this.EitherCharacteristic().value,
      this.CodeCharacteristic().value,
      this.DurationCharacteristic().value,
      this.MeasurementCharacteristic().value,
      this.EnumerationCharacteristic().value,
      this.QuantifiableCharacteristic().value,
      this.CollectionCharacteristic().value,
      this.ListCharacteristic().value,
      this.SetCharacteristic().value,
      this.SingleEntityCharacteristic().value,
      this.SortedSetCharacteristic().value,
      this.StructuredValueCharacteristic().value,
      this.TimeSeriesCharacteristic().value,
    ];
  }
}
