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

import {DataFactory, NamedNode} from 'n3';

export class Bamm {
  static readonly XSD_URI = 'http://www.w3.org/2001/XMLSchema';
  static readonly RDF_URI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns';
  static readonly RDFS_URI = 'http://www.w3.org/2000/01/rdf-schema';
  static readonly BASE_URI = 'urn:bamm:io.openmanufacturing:';

  private alias = 'bamm';

  constructor(public version: string, public identifier: string = 'urn:bamm:io.openmanufacturing:') {}

  static isDefaultNamespaceUri(value: string) {
    return (
      value.startsWith(Bamm.XSD_URI) || value.startsWith(Bamm.RDF_URI) || value.startsWith(Bamm.RDFS_URI) || value.startsWith(Bamm.BASE_URI)
    );
  }

  getAlias(): string {
    return this.alias;
  }

  getBaseUri(): string {
    return this.identifier || Bamm.BASE_URI;
  }

  getUri(): string {
    return `${this.getBaseUri()}meta-model:${this.version}`;
  }

  getAspectModelUrn(elementName: string): string {
    return `${this.getNamespace()}${elementName}`;
  }

  getNamespace(): string {
    return `${this.getUri()}#`;
  }

  getRdfSyntaxNameSpace(): string {
    return `${Bamm.RDF_URI}#`;
  }

  getXSDNameSpace(): string {
    return `${Bamm.XSD_URI}#`;
  }

  RdfType(): NamedNode {
    return DataFactory.namedNode(`${this.getRdfSyntaxNameSpace()}type`);
  }

  RdfRest(): NamedNode {
    return DataFactory.namedNode(`${this.getRdfSyntaxNameSpace()}rest`);
  }

  isRdfRest(value: string): boolean {
    return this.RdfRest().value === value;
  }

  RdfFirst(): NamedNode {
    return DataFactory.namedNode(`${this.getRdfSyntaxNameSpace()}first`);
  }

  isRdfFirst(value: string): boolean {
    return this.RdfFirst().value === value;
  }

  RdfNil(): NamedNode {
    return DataFactory.namedNode(`${this.getRdfSyntaxNameSpace()}nil`);
  }

  isRdfNill(value: string): boolean {
    return this.RdfNil().value === value;
  }

  isRdfTypeProperty(value: string): boolean {
    return this.RdfType().value === value;
  }

  isXSDType(urn: string) {
    return urn && urn.startsWith('xsd:');
  }

  Aspect(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Aspect`);
  }

  NameProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}name`);
  }

  isNameProperty(value: string): boolean {
    return this.NameProperty().value === value;
  }

  isDescriptionProperty(value: string): boolean {
    return this.DescriptionProperty().value === value;
  }

  DescriptionProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}description`);
  }

  isPreferredNameProperty(value: string): boolean {
    return this.PreferredNameProperty().value === value;
  }

  PreferredNameProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}preferredName`);
  }

  OptionalProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}optional`);
  }

  isOptionalProperty(value: string): boolean {
    return this.OptionalProperty().value === value;
  }

  isPayloadNameProperty(value: string): boolean {
    return this.payloadNameProperty().value === value;
  }

  NotInPayloadProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}notInPayload`);
  }

  payloadNameProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}payloadName`);
  }

  isNotInPayloadProperty(value: string): boolean {
    return this.NotInPayloadProperty().value === value;
  }

  SeeProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}see`);
  }

  isSeeProperty(value: string): boolean {
    return this.SeeProperty().value === value;
  }

  ExampleValueProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}exampleValue`);
  }

  isExampleValueProperty(value: string): boolean {
    return this.ExampleValueProperty().value === value;
  }

  OutputProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}output`);
  }

  isOutputProperty(value: string): boolean {
    return this.OutputProperty().value === value;
  }

  InputProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}input`);
  }

  isInputProperty(value: string): boolean {
    return this.InputProperty().value === value;
  }

  ParametersProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}parameters`);
  }

  isParametersProperty(value: string): boolean {
    return this.ParametersProperty().value === value;
  }

  Constraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Constraint`);
  }

  Characteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Characteristic`);
  }

  isCharacteristic(value: string): boolean {
    return value === this.Characteristic().value;
  }

  isConstraint(value: string): boolean {
    return value === this.Constraint().value;
  }

  CharacteristicProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}characteristic`);
  }

  isCharacteristicProperty(value: string): boolean {
    return this.CharacteristicProperty().value === value;
  }

  isPropertiesProperty(value: string): boolean {
    return this.PropertiesProperty().value === value;
  }

  PropertiesProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}properties`);
  }

  isPropertyProperty(value: string): boolean {
    return this.PropertyProperty().value === value;
  }

  PropertyProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}property`);
  }

  Property(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Property`);
  }

  isPropertyElement(value: string): boolean {
    return value === this.Property().value;
  }

  isOperationElement(value: string): boolean {
    return value === this.Operation().value;
  }

  isOperationsProperty(value: string): boolean {
    return this.OperationsProperty().value === value;
  }

  OperationsProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}operations`);
  }

  Operation(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Operation`);
  }

  EventsProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}events`);
  }

  Event(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Event`);
  }

  isEventElement(value: string): boolean {
    return value === this.Event().value;
  }

  isEventsProperty(value: string): boolean {
    return this.EventsProperty().value === value;
  }

  UnitProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}unit`);
  }

  isUnitProperty(value: string): boolean {
    return value === this.UnitProperty().value;
  }

  CodeProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}code`);
  }

  isCodeProperty(value: string): boolean {
    return this.CodeProperty().value === value;
  }

  SymbolProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}symbol`);
  }

  isSymbolProperty(value: string): boolean {
    return this.SymbolProperty().value === value;
  }

  ReferenceUnitProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}referenceUnit`);
  }

  isReferenceUnitProperty(value: string): boolean {
    return this.ReferenceUnitProperty().value === value;
  }

  ConversionFactorProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}conversionFactor`);
  }

  isConversionFactorProperty(value: string): boolean {
    return this.ConversionFactorProperty().value === value;
  }

  QuantityKindsProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}quantityKinds`);
  }

  isQuantityKindsProperty(value: string): boolean {
    return this.QuantityKindsProperty().value === value;
  }

  isExtendsProperty(value: string): boolean {
    return this.ExtendsProperty().value === value;
  }

  ExtendsProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}extends`);
  }

  ValueProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}value`);
  }

  isValueProperty(value: string): boolean {
    return this.ValueProperty().value === value;
  }

  getEncodingList(): Array<any> {
    return [
      {value: 'US-ASCII', isDefinedBy: `${this.getNamespace()}US-ASCII`},
      {value: 'ISO-8859-1', isDefinedBy: `${this.getNamespace()}ISO-8859-1`},
      {value: 'UTF-8', isDefinedBy: `${this.getNamespace()}UTF-8`},
      {value: 'UTF-16', isDefinedBy: `${this.getNamespace()}UTF-16`},
      {value: 'UTF-16BE', isDefinedBy: `${this.getNamespace()}UTF-16BE`},
      {value: 'UTF-16LE', isDefinedBy: `${this.getNamespace()}UTF-16LE`},
    ];
  }

  isDataTypeProperty(value: string): boolean {
    return this.DataTypeProperty().value === value;
  }

  DataTypeProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}dataType`);
  }

  Entity(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Entity`);
  }

  AbstractEntity(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}AbstractEntity`);
  }

  isEntity(value: string): boolean {
    return this.Entity().value === value;
  }

  isAbstractEntity(value: string): boolean {
    return this.Entity().value === value;
  }
}
