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
import {Bamm, Bammc, Bamme, Bammu} from '@ame/vocabulary';

export class RdfModelUtil {
  static isBammuDefinition(urn: string, bammu: Bammu): boolean {
    return urn && urn.includes(bammu.getNamespace());
  }

  static isCharacteristicInstance(urn: string, bammc: Bammc): boolean {
    return urn && urn.includes(bammc.getNamespace());
  }

  static isUnitInstance(urn: string, bammu: Bammu): boolean {
    return urn && urn.includes(bammu.getNamespace());
  }

  static getValueWithoutUrnDefinition(value: any): string {
    if (!value) {
      return '';
    }

    if (value instanceof DefaultEntityValue) {
      return value.name;
    }

    if (`${value}`.startsWith('urn:bamm') || `${value}`.startsWith(Bamm.XSD_URI) || `${value}`.startsWith(Bamm.RDF_URI)) {
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
    characteristicType: Type
  ): NamedNode {
    const bamm = rdfModel.BAMM();
    const bammc = rdfModel.BAMMC();

    if (
      metaModelElement instanceof DefaultLengthConstraint &&
      (bammc.isMinValueProperty(predicateUrn) || bammc.isMaxValueProperty(predicateUrn))
    ) {
      return this.getDataType(new DefaultScalar(simpleDataTypes?.nonNegativeInteger?.isDefinedBy));
    } else if (
      metaModelElement instanceof DefaultRangeConstraint &&
      (bammc.isMinValueProperty(predicateUrn) || bammc.isMaxValueProperty(predicateUrn))
    ) {
      if (characteristicType) {
        return this.getDataType(characteristicType);
      }
      return this.getDataType(new DefaultScalar(simpleDataTypes?.string?.isDefinedBy));
    } else if (
      metaModelElement instanceof DefaultFixedPointConstraint &&
      (bammc.isScaleValueProperty(predicateUrn) || bammc.isIntegerValueProperty(predicateUrn))
    ) {
      return this.getDataType(new DefaultScalar(simpleDataTypes?.positiveInteger?.isDefinedBy));
    } else if (metaModelElement instanceof DefaultProperty && bamm.isExampleValueProperty(predicateUrn)) {
      return this.getDataType(metaModelElement?.getDeepLookUpDataType());
    } else if (metaModelElement instanceof DefaultEnumeration && bammc.isValuesProperty(predicateUrn)) {
      return this.getDataType(metaModelElement.dataType);
    } else if (metaModelElement instanceof DefaultState && bammc.isDefaultValueProperty(predicateUrn)) {
      return this.getDataType(metaModelElement.dataType);
    }

    return null;
  }

  static getFullQualifiedModelName(modelElement: BaseMetaModelElement) {
    const bamm = new Bamm(modelElement.metaModelVersion);
    const bammc = new Bammc(bamm);
    const bamme = new Bamme(bamm);
    const bammu = new Bammu(bamm);
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
      namespace = bamm.getNamespace();
    } else if (modelElement instanceof DefaultCharacteristic || modelElement instanceof DefaultConstraint) {
      namespace = bammc.getNamespace();
    } else if (modelElement instanceof DefaultUnit) {
      namespace = bammu.getNamespace();
    } else if (modelElement instanceof DefaultEntity) {
      namespace = bamme.getNamespace();
    } else {
      namespace = ':';
    }
    return `${namespace}${modelElement.className.replace('Default', '')}`;
  }

  static resolvePredicate(child: BaseMetaModelElement, parent: BaseMetaModelElement, rdfModel: RdfModel): NamedNode {
    if (parent instanceof DefaultAspect) {
      if (child instanceof DefaultProperty) {
        return rdfModel.BAMM().PropertiesProperty();
      }
      if (child instanceof DefaultOperation) {
        return rdfModel.BAMM().OperationsProperty();
      }
    }
    if (parent instanceof DefaultEither && child instanceof DefaultCharacteristic) {
      if (parent.right && parent.right.aspectModelUrn === child.aspectModelUrn) {
        return rdfModel.BAMMC().EitherRightProperty();
      } else if (parent.left && parent.left.aspectModelUrn === child.aspectModelUrn) {
        return rdfModel.BAMMC().EitherLeftProperty();
      }
    }
    if (parent instanceof DefaultProperty && child instanceof DefaultCharacteristic) {
      return rdfModel.BAMM().CharacteristicProperty();
    }
    if (parent instanceof DefaultCharacteristic && child instanceof DefaultEntity) {
      return rdfModel.BAMM().DataTypeProperty();
    }
    if (parent instanceof DefaultEntity && child instanceof DefaultProperty) {
      return rdfModel.BAMM().PropertiesProperty();
    }

    return null;
  }

  static getDataType(dataType?: Type) {
    return dataType ? DataFactory.namedNode(dataType.getUrn()) : null;
  }

  static getEffectiveType(quad: Quad, rdfModel: RdfModel): Quad {
    const bamm = rdfModel.BAMM();

    if (Util.isBlankNode(quad.subject)) {
      let resolvedQuad: Array<Quad>;
      if (bamm.isDataTypeProperty(quad.predicate.value)) {
        resolvedQuad = [quad];
      } else {
        resolvedQuad = rdfModel.store.getQuads(quad.subject, null, null, null);
      }

      quad = resolvedQuad.find(propertyQuad => bamm.isDataTypeProperty(propertyQuad.predicate.value));
    } else if (quad.predicate.value === `${bamm.getRdfSyntaxNameSpace()}type`) {
      quad = rdfModel.store
        .getQuads(quad.subject, null, null, null)
        .find(propertyQuad => bamm.isDataTypeProperty(propertyQuad.predicate.value));
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
   * @param bammc definition of the characteristic
   * @return boolean if the characteristic is an predefined value
   */
  static isPredefinedCharacteristic(aspectModelUrn: string, bammc: Bammc): boolean {
    return [
      `${bammc.getNamespace()}Timestamp`,
      `${bammc.getNamespace()}Text`,
      `${bammc.getNamespace()}MultiLanguageText`,
      `${bammc.getNamespace()}Boolean`,
      `${bammc.getNamespace()}Locale`,
      `${bammc.getNamespace()}Language`,
      `${bammc.getNamespace()}UnitReference`,
      `${bammc.getNamespace()}ResourcePath`,
      `${bammc.getNamespace()}MimeType`,
    ].some(predefinedUrn => predefinedUrn === aspectModelUrn);
  }

  static isEntity(quad: Quad, rdfModel: RdfModel): boolean {
    const bamm = rdfModel.BAMM();
    if (bamm.Entity().equals(quad.object)) {
      return true;
    }

    return !!rdfModel.findAnyProperty(quad).find(quadProperty => bamm.Entity().equals(quadProperty.subject));
  }

  static isEntityValue(elementType: string, metaModelElementInstantiator: MetaModelElementInstantiator): boolean {
    let quads = metaModelElementInstantiator.rdfModel.store.getQuads(
      DataFactory.namedNode(elementType),
      null,
      metaModelElementInstantiator.bamm.Entity(),
      null
    );

    if (quads.length) {
      return true;
    }

    const externalRdfModel = metaModelElementInstantiator.getRdfModelByElement(DataFactory.namedNode(elementType));
    quads = externalRdfModel?.store.getQuads(DataFactory.namedNode(elementType), null, metaModelElementInstantiator.bamm.Entity(), null);

    return !!quads?.length;
  }
}
