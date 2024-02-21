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
  BaseMetaModelElement,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEither,
  DefaultEntity,
  DefaultEntityValue,
  DefaultEnumeration,
  DefaultEvent,
  DefaultFixedPointConstraint,
  DefaultLengthConstraint,
  DefaultOperation,
  DefaultProperty,
  DefaultRangeConstraint,
  DefaultScalar,
  DefaultState,
  DefaultUnit,
  Type,
} from '@ame/meta-model';
import {DataFactory, NamedNode, Quad, Util} from 'n3';
import {simpleDataTypes} from '@ame/shared';
import {MetaModelElementInstantiator} from '@ame/instantiator';
import {RdfModel} from './rdf-model';
import {Samm, SammC, SammE, SammU} from '@ame/vocabulary';

declare const sammUDefinition: any;

export class RdfModelUtil {
  static isSammUDefinition(urn: string, sammU: SammU): boolean {
    return urn && urn.includes(sammU.getNamespace());
  }

  static isCharacteristicInstance(urn: string, sammC: SammC): boolean {
    return urn && urn.includes(sammC.getNamespace());
  }

  static isUnitInstance(urn: string, sammU: SammU): boolean {
    return urn && urn.includes(sammU.getNamespace());
  }

  static getValueWithoutUrnDefinition(value: any): string {
    if (!value) {
      return '';
    }

    if (value instanceof DefaultEntityValue) {
      return value.name;
    }

    if (`${value}`.startsWith('urn:samm') || `${value}`.startsWith(Samm.XSD_URI) || `${value}`.startsWith(Samm.RDF_URI)) {
      return `${value}`.split('#').pop();
    }
    return `${value}`;
  }

  static getValuesWithoutUrnDefinition(values: Array<DefaultEntityValue | string | number | boolean>): string {
    return values.map(value => this.getValueWithoutUrnDefinition(value)).join(', ');
  }

  static resolveAccurateType(
    metaModelElement: BaseMetaModelElement,
    predicateUrn: string,
    rdfModel: RdfModel,
    characteristicType: Type,
  ): NamedNode {
    const samm = rdfModel.SAMM();
    const sammC = rdfModel.SAMMC();

    if (
      metaModelElement instanceof DefaultLengthConstraint &&
      (sammC.isMinValueProperty(predicateUrn) || sammC.isMaxValueProperty(predicateUrn))
    ) {
      return this.getDataType(new DefaultScalar(simpleDataTypes?.nonNegativeInteger?.isDefinedBy));
    } else if (
      metaModelElement instanceof DefaultRangeConstraint &&
      (sammC.isMinValueProperty(predicateUrn) || sammC.isMaxValueProperty(predicateUrn))
    ) {
      if (characteristicType) {
        return this.getDataType(characteristicType);
      }
      return this.getDataType(new DefaultScalar(simpleDataTypes?.string?.isDefinedBy));
    } else if (
      metaModelElement instanceof DefaultFixedPointConstraint &&
      (sammC.isScaleValueProperty(predicateUrn) || sammC.isIntegerValueProperty(predicateUrn))
    ) {
      return this.getDataType(new DefaultScalar(simpleDataTypes?.positiveInteger?.isDefinedBy));
    } else if (metaModelElement instanceof DefaultProperty && samm.isExampleValueProperty(predicateUrn)) {
      return this.getDataType(metaModelElement?.getDeepLookUpDataType());
    } else if (metaModelElement instanceof DefaultEnumeration && sammC.isValuesProperty(predicateUrn)) {
      return this.getDataType(metaModelElement.dataType);
    } else if (metaModelElement instanceof DefaultState && sammC.isDefaultValueProperty(predicateUrn)) {
      return this.getDataType(metaModelElement.dataType);
    } else if (metaModelElement instanceof DefaultUnit && samm.isNumericConversionFactorProperty(predicateUrn)) {
      return this.getDataType(new DefaultScalar(simpleDataTypes?.double?.isDefinedBy));
    }

    return null;
  }

  static getFullQualifiedModelName(modelElement: BaseMetaModelElement) {
    const samm = new Samm(modelElement.metaModelVersion);
    const sammC = new SammC(samm);
    const sammE = new SammE(samm);
    const sammU = new SammU(samm);
    let namespace: string;
    if (
      modelElement.className === 'DefaultCharacteristic' ||
      modelElement.className === 'DefaultConstraint' ||
      modelElement.className === 'DefaultEntity' ||
      modelElement.className === 'DefaultAbstractEntity' ||
      modelElement.className === 'DefaultEvent' ||
      modelElement instanceof DefaultAbstractProperty ||
      modelElement instanceof DefaultProperty ||
      modelElement instanceof DefaultOperation ||
      modelElement instanceof DefaultEvent ||
      modelElement instanceof DefaultAspect
    ) {
      namespace = samm.getNamespace();
    } else if (modelElement instanceof DefaultCharacteristic || modelElement instanceof DefaultConstraint) {
      namespace = sammC.getNamespace();
    } else if (modelElement instanceof DefaultUnit) {
      namespace = modelElement.name in sammUDefinition.units ? sammU.getNamespace() : samm.getNamespace();
    } else if (modelElement instanceof DefaultEntity) {
      namespace = sammE.getNamespace();
    } else {
      namespace = ':';
    }
    return `${namespace}${modelElement.className.replace('Default', '')}`;
  }

  static resolvePredicate(child: BaseMetaModelElement, parent: BaseMetaModelElement, rdfModel: RdfModel): NamedNode {
    if (parent instanceof DefaultAspect) {
      if (child instanceof DefaultProperty) {
        return rdfModel.SAMM().PropertiesProperty();
      }
      if (child instanceof DefaultOperation) {
        return rdfModel.SAMM().OperationsProperty();
      }
    }
    if (parent instanceof DefaultEither && child instanceof DefaultCharacteristic) {
      if (parent.right && parent.right.aspectModelUrn === child.aspectModelUrn) {
        return rdfModel.SAMMC().EitherRightProperty();
      } else if (parent.left && parent.left.aspectModelUrn === child.aspectModelUrn) {
        return rdfModel.SAMMC().EitherLeftProperty();
      }
    }
    if (parent instanceof DefaultProperty && child instanceof DefaultCharacteristic) {
      return rdfModel.SAMM().CharacteristicProperty();
    }
    if (parent instanceof DefaultCharacteristic && child instanceof DefaultEntity) {
      return rdfModel.SAMM().DataTypeProperty();
    }
    if (parent instanceof DefaultEntity && child instanceof DefaultProperty) {
      return rdfModel.SAMM().PropertiesProperty();
    }

    return null;
  }

  static getDataType(dataType?: Type) {
    return dataType ? DataFactory.namedNode(dataType.getUrn()) : null;
  }

  static getEffectiveType(quad: Quad, rdfModel: RdfModel): Quad {
    const samm = rdfModel.SAMM();

    if (Util.isBlankNode(quad.subject)) {
      let resolvedQuad: Array<Quad>;
      if (samm.isDataTypeProperty(quad.predicate.value)) {
        resolvedQuad = [quad];
      } else {
        resolvedQuad = rdfModel.store.getQuads(quad.subject, null, null, null);
      }

      quad = resolvedQuad.find(propertyQuad => samm.isDataTypeProperty(propertyQuad.predicate.value));
    } else if (quad.predicate.value === `${samm.getRdfSyntaxNameSpace()}type`) {
      quad = rdfModel.store
        .getQuads(quad.subject, null, null, null)
        .find(propertyQuad => samm.isDataTypeProperty(propertyQuad.predicate.value));
    }

    return quad;
  }

  /**
   * capitalizes first letter : e.g. : "hello" -> "Hello"
   *
   * @param stringVal initial value
   * @returns formatted string
   */
  static capitalizeFirstLetter(stringVal: string): string {
    if (!stringVal) {
      return null;
    }
    return stringVal.charAt(0).toUpperCase() + stringVal.slice(1);
  }

  /**
   * Check if the aspectModelUrn is a predefined characteristic
   *
   * @param aspectModelUrn urn of the characteristic
   * @param sammC definition of the characteristic
   * @return boolean if the characteristic is an predefined value
   */
  static isPredefinedCharacteristic(aspectModelUrn: string, sammC: SammC): boolean {
    return [
      `${sammC.getNamespace()}Timestamp`,
      `${sammC.getNamespace()}Text`,
      `${sammC.getNamespace()}MultiLanguageText`,
      `${sammC.getNamespace()}Boolean`,
      `${sammC.getNamespace()}Locale`,
      `${sammC.getNamespace()}Language`,
      `${sammC.getNamespace()}UnitReference`,
      `${sammC.getNamespace()}ResourcePath`,
      `${sammC.getNamespace()}MimeType`,
    ].some(predefinedUrn => predefinedUrn === aspectModelUrn);
  }

  static isEntity(quad: Quad, rdfModel: RdfModel): boolean {
    const samm = rdfModel.SAMM();
    if (samm.Entity().equals(quad.object)) {
      return true;
    }

    return !!rdfModel.findAnyProperty(quad).find(quadProperty => samm.Entity().equals(quadProperty.subject));
  }

  static isEntityValue(elementType: string, metaModelElementInstantiator: MetaModelElementInstantiator): boolean {
    let quads = metaModelElementInstantiator.rdfModel.store.getQuads(
      DataFactory.namedNode(elementType),
      null,
      metaModelElementInstantiator.samm.Entity(),
      null,
    );

    if (quads.length) {
      return true;
    }

    const externalRdfModel = metaModelElementInstantiator.getRdfModelByElement(DataFactory.namedNode(elementType));
    quads = externalRdfModel?.store.getQuads(DataFactory.namedNode(elementType), null, metaModelElementInstantiator.samm.Entity(), null);

    return !!quads?.length;
  }

  static getUrnFromFileName(fileName: string): string {
    return `urn:samm:${this.getNamespaceFromRdf(fileName)}`;
  }

  static getNamespaceFromRdf(fileName: string): string {
    return `${this.getNamespaceNameFromRdf(fileName)}:${this.getNamespaceVersionFromRdf(fileName)}`;
  }

  static getNamespaceNameFromRdf(fileName: string): string {
    return this.splitRdfIntoChunks(fileName)[0];
  }

  static getNamespaceVersionFromRdf(fileName: string): string {
    return this.splitRdfIntoChunks(fileName)[1];
  }

  static getFileNameFromRdf(fileName: string): string {
    return this.splitRdfIntoChunks(fileName)[2];
  }

  static splitRdfIntoChunks(fileName: string): [string, string, string] {
    const chunks: string[] = fileName.split(':');
    if (chunks.length !== 3) throw new Error(`Unable to extract namespace name from "${fileName}": it should match "x:y:z" pattern`);
    return chunks as [string, string, string];
  }

  static buildAbsoluteFileName(namespace: string, namespaceVersion: string, fileName: string): string {
    return `${namespace}:${namespaceVersion}:${fileName}`;
  }

  static extractCommentsFromRdfContent(content: string): Array<string> {
    const comments: Array<string> = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.startsWith('@prefix')) {
        break;
      }

      if (line.startsWith('#')) {
        comments.push(line);
      }
    }

    return comments;
  }
}
