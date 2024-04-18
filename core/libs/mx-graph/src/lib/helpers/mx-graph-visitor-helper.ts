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
  Aspect,
  Base,
  BaseMetaModelElement,
  CanExtend,
  Characteristic,
  Constraint,
  DefaultAbstractEntity,
  DefaultAbstractProperty,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEither,
  DefaultEncodingConstraint,
  DefaultEntity,
  DefaultEntityInstance,
  DefaultEnumeration,
  DefaultEvent,
  DefaultFixedPointConstraint,
  DefaultLanguageConstraint,
  DefaultLengthConstraint,
  DefaultLocaleConstraint,
  DefaultOperation,
  DefaultProperty,
  DefaultRangeConstraint,
  DefaultRegularExpressionConstraint,
  DefaultState,
  DefaultStructuredValue,
  DefaultUnit,
  Property,
  QuantityKind,
  Unit,
} from '@ame/meta-model';
import {RdfModel, RdfModelUtil} from '@ame/rdf/utils';
import {SammLanguageSettingsService} from '@ame/settings-dialog';
import * as locale from 'locale-codes';
import {ModelBaseProperties} from '../models';
import {MxGraphHelper} from './mx-graph-helper';

export interface ShapeAttribute {
  label: string;
  key: string;
  lang?: string;
  extended?: boolean;
}

export class MxGraphVisitorHelper {
  static addDataType(metaModelElement: Characteristic): ShapeAttribute {
    if (
      metaModelElement.dataType &&
      ((metaModelElement.dataType.getUrn() &&
        !metaModelElement.dataType.getUrn().startsWith('urn') &&
        !(metaModelElement instanceof DefaultEither)) ||
        (metaModelElement.dataType.getUrn().includes('meta-model') && metaModelElement.dataType.getUrn().includes('#curie')))
    ) {
      return {
        label: `dataType = ${RdfModelUtil.getValueWithoutUrnDefinition(metaModelElement.dataType.getUrn())}`,
        key: 'dataType',
      };
    }

    return null;
  }

  static addValues(characteristic: Characteristic): ShapeAttribute {
    if (
      characteristic instanceof DefaultEnumeration &&
      characteristic.values?.length &&
      !characteristic.values.every(value => value instanceof DefaultEntityInstance)
    ) {
      return {
        label: `values = ${RdfModelUtil.getValuesWithoutUrnDefinition(characteristic.values)}`,
        key: 'values',
      };
    }
    return null;
  }

  static addDefaultValue(characteristic: Characteristic): ShapeAttribute {
    if (characteristic instanceof DefaultState && characteristic.defaultValue) {
      return {
        label: `defaultValue = ${RdfModelUtil.getValuesWithoutUrnDefinition(Array(characteristic.defaultValue))}`,
        key: 'defaultValue',
      };
    }
    return null;
  }

  static addLocalizedDescriptions(metaModelElement: CanExtend | Base, sammLangService: SammLanguageSettingsService): ShapeAttribute[] {
    const languages: string[] =
      metaModelElement.getAllLocalesDescriptions().length >= ((metaModelElement as CanExtend)?.extendedDescription?.size || 0)
        ? metaModelElement.getAllLocalesDescriptions()
        : Array.from((metaModelElement as CanExtend)?.extendedDescription?.keys());

    return languages
      .map(languageCode => {
        const langTag = locale.getByTag(languageCode).tag;
        sammLangService.addSammLanguageCode(langTag);
        const description = metaModelElement.getDescription(langTag);
        const extendedDescription = (metaModelElement as CanExtend)?.extendedDescription?.get(langTag);

        if (description || extendedDescription) {
          return {
            label: `description = ${description || extendedDescription} @${langTag}`,
            key: 'description',
            lang: langTag,
            extended: !!extendedDescription && !description,
          };
        }
        return null;
      })
      .filter(e => !!e);
  }

  static addLocalizedPreferredNames(metaModelElement: CanExtend | Base, sammLangService: SammLanguageSettingsService): ShapeAttribute[] {
    const languages: string[] =
      metaModelElement.getAllLocalesPreferredNames().length >= ((metaModelElement as CanExtend)?.extendedPreferredName?.size || 0)
        ? metaModelElement.getAllLocalesPreferredNames()
        : Array.from((metaModelElement as CanExtend)?.extendedPreferredName?.keys());

    return languages
      .map(languageCode => {
        const langTag = locale.getByTag(languageCode).tag;
        sammLangService.addSammLanguageCode(langTag);
        const preferredName = metaModelElement.getPreferredName(langTag);
        const extendedPreferredName = (metaModelElement as CanExtend)?.extendedPreferredName?.get(langTag);
        if (preferredName || extendedPreferredName) {
          return {
            label: `preferredName = ${preferredName || extendedPreferredName} @${langTag}`,
            key: 'preferredName',
            lang: langTag,
            extended: !!extendedPreferredName && !preferredName,
          };
        }
        return null;
      })
      .filter(e => !!e);
  }

  static addExtends(element: any): ShapeAttribute {
    if (element.extendedElement !== null && element.extendedElement !== undefined) {
      return {label: `extends = ${element.extendedElement.name}`, key: 'extends'};
    }
    return null;
  }

  static addValue(constraint: Constraint): ShapeAttribute {
    if (constraint instanceof DefaultEncodingConstraint || constraint instanceof DefaultRegularExpressionConstraint) {
      if (constraint.value !== null && constraint.value !== undefined) {
        return {label: `value = ${RdfModelUtil.getValueWithoutUrnDefinition(constraint.value)}`, key: 'value'};
      }
    }
    return null;
  }

  static addSee(metaModelElement: Base): ShapeAttribute {
    if (metaModelElement.getSeeReferences()?.length > 0 || (metaModelElement as CanExtend)?.extendedSee?.length) {
      let extended = false;
      let elements = (metaModelElement.getSeeReferences() || []).map(e =>
        e.startsWith('urn:samm') && e.includes('#') ? e.split('#')[1] : e,
      );

      if (!elements.length) {
        elements = (metaModelElement as CanExtend)?.extendedSee.map(e =>
          e.startsWith('urn:samm') && e.includes('#') ? e.split('#')[1] : e,
        );
        extended = true;
      }

      return {
        label: `see = ${elements.join(',')}`,
        key: 'see',
        extended,
      };
    }
    return null;
  }

  static addMinValue(constraint: Constraint): ShapeAttribute {
    if (
      (constraint instanceof DefaultLengthConstraint || constraint instanceof DefaultRangeConstraint) &&
      constraint.minValue !== null &&
      constraint.minValue !== undefined
    ) {
      return {label: `minValue = ${constraint.minValue}`, key: 'minValue'};
    }
    return null;
  }

  static addMaxValue(constraint: Constraint): ShapeAttribute {
    if (
      (constraint instanceof DefaultLengthConstraint || constraint instanceof DefaultRangeConstraint) &&
      constraint.maxValue !== null &&
      constraint.maxValue !== undefined
    ) {
      return {label: `maxValue = ${constraint.maxValue}`, key: 'maxValue'};
    }
    return null;
  }

  static addBoundDefinition(constraint: Constraint): ShapeAttribute[] {
    const bounds: ShapeAttribute[] = [];
    if (constraint instanceof DefaultRangeConstraint) {
      if (constraint.upperBoundDefinition) {
        bounds.push({label: `upperBoundDefinition = ${constraint.upperBoundDefinition}`, key: 'upperBoundDefinition'});
      }
      if (constraint.lowerBoundDefinition) {
        bounds.push({label: `lowerBoundDefinition = ${constraint.lowerBoundDefinition}`, key: 'lowerBoundDefinition'});
      }
    }
    return bounds;
  }

  static addLanguageCode(constraint: Constraint): ShapeAttribute {
    if (constraint instanceof DefaultLanguageConstraint && constraint.languageCode !== null && constraint.languageCode !== undefined) {
      return {label: `languageCode = ${constraint.languageCode}`, key: 'languageCode'};
    }
    return null;
  }

  static addScale(constraint: Constraint): ShapeAttribute {
    if (constraint instanceof DefaultFixedPointConstraint && constraint.scale !== null && constraint.scale !== undefined) {
      return {label: `scale = ${constraint.scale}`, key: 'scale'};
    }
    return null;
  }

  static addInteger(constraint: Constraint): ShapeAttribute {
    if (constraint instanceof DefaultFixedPointConstraint && constraint.integer !== null && constraint.integer !== undefined) {
      return {label: `integer = ${constraint.integer}`, key: 'integer'};
    }
    return null;
  }

  static addLocaleCode(constraint: Constraint): ShapeAttribute {
    if (constraint instanceof DefaultLocaleConstraint && constraint.localeCode) {
      return {label: `localeCode = ${constraint.localeCode}`, key: 'localeCode'};
    }
    return null;
  }

  static addConversionFactor(unit: Unit): ShapeAttribute {
    if (unit.conversionFactor) {
      return {label: `conversionFactor = ${unit.conversionFactor}`, key: 'conversionFactor'};
    }
    return null;
  }

  static addNumericConversionFactor(unit: Unit): ShapeAttribute {
    if (unit.conversionFactor) {
      return {label: `numericConversionFactor = ${unit.numericConversionFactor}`, key: 'conversionFactor'};
    }
    return null;
  }

  static addSymbol(unit: Unit): ShapeAttribute {
    if (unit.symbol) {
      return {label: `symbol = ${unit.symbol}`, key: 'symbol'};
    }
    return null;
  }

  static addCode(unit: Unit): ShapeAttribute {
    if (unit.code) {
      return {label: `code = ${unit.code}`, key: 'code'};
    }
    return null;
  }

  static addReferenceUnit(unit: Unit): ShapeAttribute {
    if (unit.referenceUnit) {
      return {label: `referenceUnit = ${unit.referenceUnit.name}`, key: 'referenceUnit'};
    }
    return null;
  }

  static addExampleValue(property: Property): ShapeAttribute {
    if (property.exampleValue) {
      return {label: `exampleValue = ${property.exampleValue}`, key: 'exampleValue'};
    }
    return null;
  }

  static addIsCollectionAspect(aspect: Aspect): ShapeAttribute {
    if (aspect.isCollectionAspect) {
      return {label: `isCollectionAspect = ${aspect.isCollectionAspect}`, key: 'isCollectionAspect'};
    }
    return null;
  }

  static addQuantityKinds(quantityKinds: Array<QuantityKind>): ShapeAttribute {
    if (quantityKinds) {
      const quantityKindLabels = [];
      quantityKinds.forEach(quantityKind => {
        if (quantityKind.label || quantityKind.name) {
          quantityKindLabels.push(quantityKind.label || quantityKind.name);
        }
      });
      if (quantityKindLabels.length > 0) {
        return {label: `quantityKinds = ${quantityKindLabels.join(', ')}`, key: 'quantityKinds'};
      }
    }

    return null;
  }

  static addDeconstructionRule(characteristic: Characteristic): ShapeAttribute {
    if (characteristic instanceof DefaultStructuredValue && characteristic.deconstructionRule) {
      return {label: `deconstructionRule = ${characteristic.deconstructionRule}`, key: 'deconstructionRule'};
    }
    return null;
  }

  static addElements(characteristic: Characteristic): ShapeAttribute {
    if (characteristic instanceof DefaultStructuredValue && characteristic.elements && characteristic.elements.length > 0) {
      return {label: `elements = ${this.getElementList(characteristic).join(' ')}`, key: 'elements'};
    }
    return null;
  }

  static getElementList(characteristic: DefaultStructuredValue): Array<string | Property> {
    return characteristic.elements.map(element => (typeof element === 'string' ? element : element.property.name));
  }

  static getOperationProperties(operation: DefaultOperation, sammLangService: SammLanguageSettingsService) {
    return [
      ...this.addLocalizedPreferredNames(operation, sammLangService),
      ...this.addLocalizedDescriptions(operation, sammLangService),
      this.addSee(operation),
    ].filter(e => !!e);
  }

  static getEntityProperties(entity: DefaultEntity, sammLangService: SammLanguageSettingsService) {
    return [
      this.addExtends(entity),
      ...this.addLocalizedPreferredNames(entity, sammLangService),
      ...this.addLocalizedDescriptions(entity, sammLangService),
      this.addSee(entity),
    ].filter(e => !!e);
  }

  static getAbstractEntityProperties(entity: any, sammLangService: SammLanguageSettingsService) {
    return this.getEntityProperties(entity, sammLangService);
  }

  static getUnitProperties(unit: DefaultUnit, sammLangService: SammLanguageSettingsService) {
    return [
      ...this.addLocalizedPreferredNames(unit, sammLangService),
      this.addCode(unit),
      this.addSymbol(unit),
      this.addConversionFactor(unit),
      this.addNumericConversionFactor(unit),
      this.addQuantityKinds(unit.quantityKinds),
      this.addReferenceUnit(unit),
    ].filter(e => !!e);
  }

  static getPropertyProperties(property: DefaultProperty, sammLangService: SammLanguageSettingsService) {
    return [
      this.addExtends(property),
      ...this.addLocalizedPreferredNames(property, sammLangService),
      ...this.addLocalizedDescriptions(property, sammLangService),
      this.addSee(property),
      this.addExampleValue(property),
    ].filter(e => !!e);
  }

  static getAbstractPropertyProperties(abstractProperty: any, sammLangService: SammLanguageSettingsService) {
    return this.getPropertyProperties(abstractProperty, sammLangService);
  }

  static getCharacteristicProperties(characteristic: DefaultCharacteristic, sammLangService: SammLanguageSettingsService) {
    return [
      ...this.addLocalizedPreferredNames(characteristic, sammLangService),
      ...this.addLocalizedDescriptions(characteristic, sammLangService),
      this.addSee(characteristic),
      this.addDataType(characteristic),
      this.addValues(characteristic),
      this.addDefaultValue(characteristic),
      this.addDeconstructionRule(characteristic),
      this.addElements(characteristic),
    ].filter(e => !!e);
  }

  static getAspectProperties(aspect: DefaultAspect, sammLangService: SammLanguageSettingsService) {
    return [
      ...this.addLocalizedPreferredNames(aspect, sammLangService),
      ...this.addLocalizedDescriptions(aspect, sammLangService),
      this.addSee(aspect),
      this.addIsCollectionAspect(aspect),
    ].filter(e => !!e);
  }

  static getConstraintProperties(constraint: DefaultConstraint, sammLangService: SammLanguageSettingsService) {
    return [
      ...this.addLocalizedPreferredNames(constraint, sammLangService),
      ...this.addLocalizedDescriptions(constraint, sammLangService),
      this.addSee(constraint),
      this.addValue(constraint),
      this.addMinValue(constraint),
      this.addMaxValue(constraint),
      ...this.addBoundDefinition(constraint),
      this.addLanguageCode(constraint),
      this.addScale(constraint),
      this.addInteger(constraint),
      this.addLocaleCode(constraint),
    ].filter(e => !!e);
  }

  static getEventProperties(event: DefaultEvent, sammLangService: SammLanguageSettingsService) {
    return [
      ...this.addLocalizedPreferredNames(event, sammLangService),
      ...this.addLocalizedDescriptions(event, sammLangService),
      this.addSee(event),
    ].filter(e => !!e);
  }

  static getElementProperties(element: BaseMetaModelElement, sammLangService: SammLanguageSettingsService) {
    if (element instanceof DefaultOperation) {
      return this.getOperationProperties(element, sammLangService);
    }

    if (element instanceof DefaultEntity) {
      return this.getEntityProperties(element, sammLangService);
    }

    if (element instanceof DefaultUnit) {
      return this.getUnitProperties(element, sammLangService);
    }

    if (element instanceof DefaultProperty) {
      return this.getPropertyProperties(element, sammLangService);
    }

    if (element instanceof DefaultCharacteristic) {
      return this.getCharacteristicProperties(element, sammLangService);
    }

    if (element instanceof DefaultAspect) {
      return this.getAspectProperties(element, sammLangService);
    }

    if (element instanceof DefaultConstraint) {
      return this.getConstraintProperties(element, sammLangService);
    }

    if (element instanceof DefaultEvent) {
      return this.getEventProperties(element, sammLangService);
    }

    if (element instanceof DefaultAbstractEntity) {
      return this.getAbstractEntityProperties(element, sammLangService);
    }

    if (element instanceof DefaultAbstractProperty) {
      return this.getAbstractPropertyProperties(element, sammLangService);
    }

    return null;
  }

  static getModelInfo(modelElement: BaseMetaModelElement, rdfModel: RdfModel): ModelBaseProperties {
    try {
      const [currentNamespace] = rdfModel.getAspectModelUrn().replace('urn:samm:', '').split(':');
      const [, elementNamespace] = MxGraphHelper.getNamespaceFromElement(modelElement);

      const aspectVersionedNamespace = rdfModel.getAspectModelUrn().replace('#', '');
      const [elementVersionedNamespace] = modelElement.aspectModelUrn.split('#');

      let metaModelVersion = modelElement.metaModelVersion;
      if (modelElement instanceof DefaultEntityInstance) {
        metaModelVersion = modelElement.entity.metaModelVersion;
      }

      return {
        version: RdfModelUtil.getNamespaceVersionFromRdf(rdfModel.absoluteAspectModelFileName),
        sammVersion: metaModelVersion,
        namespace: elementNamespace,
        external: modelElement.isExternalReference(),
        predefined: !!(modelElement as DefaultCharacteristic)?.isPredefined?.(),
        sameNamespace: elementNamespace === currentNamespace,
        sameVersionedNamespace: aspectVersionedNamespace === elementVersionedNamespace,
        fileName: modelElement.fileName,
        isAbstract: modelElement.className.toLowerCase().includes('abstract'),
      };
    } catch (error) {
      return null;
    }
  }
}
