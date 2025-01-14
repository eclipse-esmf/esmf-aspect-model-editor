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

const RDF_URI = 'http://www.w3.org/1999/02/22-rdf-syntax-ns';
const XSD_URI = 'http://www.w3.org/2001/XMLSchema';

export class Samm {
  static readonly XSD_URI = XSD_URI;
  static readonly RDF_URI = RDF_URI;
  static readonly RDFS_URI = 'http://www.w3.org/2000/01/rdf-schema';
  static readonly BASE_URI = 'urn:samm:org.eclipse.esmf.samm:';

  static readonly RDF_LANG_STRING = `${RDF_URI}#langString`;
  static readonly XML_LANG_STRING = `${XSD_URI}#langString`;

  private alias = 'samm';

  constructor(public version: string) {}

  static isDefaultNamespaceUri(value: string): boolean {
    return (
      value.startsWith(Samm.XSD_URI) || value.startsWith(Samm.RDF_URI) || value.startsWith(Samm.RDFS_URI) || value.startsWith(Samm.BASE_URI)
    );
  }

  static isSammPrefix(value: string): boolean {
    return value.startsWith('urn:samm');
  }

  getAlias(): string {
    return this.alias;
  }

  static getBaseUri(): string {
    return Samm.BASE_URI;
  }

  getUri(): string {
    return `${Samm.BASE_URI}meta-model:${this.version}`;
  }

  getAspectModelUrn(elementName: string): string {
    return `${this.getNamespace()}${elementName}`;
  }

  getNamespace(): string {
    return `${this.getUri()}#`;
  }

  getRdfSyntaxNameSpace(): string {
    return `${Samm.RDF_URI}#`;
  }

  getXSDNameSpace(): string {
    return `${Samm.XSD_URI}#`;
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

  PayloadNameProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}payloadName`);
  }

  isPayloadNameProperty(value: string): boolean {
    return this.PayloadNameProperty().value === value;
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

  NotInPayloadProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}notInPayload`);
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

  Constraint(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Constraint`);
  }

  Characteristic(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Characteristic`);
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

  Property(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Property`);
  }

  property(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}property`);
  }

  AbstractProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}AbstractProperty`);
  }

  isReferenceProperty(value: string): boolean {
    return this.property().value === value;
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

  Event(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Event`);
  }

  EventsProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}events`);
  }

  isEventsProperty(value: string): boolean {
    return this.EventsProperty().value === value;
  }

  ParametersProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}parameters`);
  }

  isParametersProperty(value: string): boolean {
    return this.ParametersProperty().value === value;
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

  isAbstractEntity(value: string) {
    return this.AbstractEntity().value === value;
  }

  Extends(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}extends`);
  }

  isExtends(value: string): boolean {
    return this.Extends().value === value;
  }

  isQuantityKindProperty(value: string): boolean {
    return `${this.getNamespace()}quantityKind` === value;
  }

  QuantityKindProperty() {
    return DataFactory.namedNode(`${this.getNamespace()}quantityKind`);
  }

  QuantityKindsProperty() {
    return DataFactory.namedNode(`${this.getNamespace()}quantityKinds`);
  }

  ReferenceUnitProperty(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}referenceUnit`);
  }

  isReferenceUnitProperty(value: string): boolean {
    return this.ReferenceUnitProperty().value === value;
  }
  Unit(): NamedNode {
    return DataFactory.namedNode(`${this.getNamespace()}Unit`);
  }

  isCommonCodeProperty(value: string): boolean {
    return `${this.getNamespace()}commonCode` === value;
  }

  isConversionFactorProperty(value: string): boolean {
    return `${this.getNamespace()}conversionFactor` === value;
  }

  isSymbolProperty(value: string): boolean {
    return `${this.getNamespace()}symbol` === value;
  }

  isNumericConversionFactorProperty(value: string): boolean {
    return `${this.getNamespace()}numericConversionFactor` === value;
  }
}
