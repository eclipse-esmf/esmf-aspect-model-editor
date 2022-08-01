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
  Aspect,
  Base,
  BaseMetaModelElement,
  Characteristic,
  Constraint,
  DefaultAbstractEntity,
  DefaultAspect,
  DefaultCharacteristic,
  DefaultConstraint,
  DefaultEither,
  DefaultEncodingConstraint,
  DefaultEntity,
  DefaultEntityValue,
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
import {RdfModelUtil} from '@ame/rdf/utils';
import {LanguageSettingsService} from '@ame/settings-dialog';
import * as locale from 'locale-codes';
import {ModelBaseProperties} from '../models';
import {MxGraphHelper} from './mx-graph-helper';

export interface PropertyInformation {
  label: string;
  key: string;
  lang?: string;
}

export class MxGraphVisitorHelper {
  static addDataType(metaModelElement: Characteristic): PropertyInformation {
    if (
      metaModelElement.dataType &&
      metaModelElement.dataType.getUrn() &&
      !metaModelElement.dataType.getUrn().startsWith('urn') &&
      !(metaModelElement instanceof DefaultEither)
    ) {
      return {
        label: `dataType = ${RdfModelUtil.getValueWithoutUrnDefinition(metaModelElement.dataType.getUrn())}`,
        key: 'dataType',
      };
    }
    return null;
  }

  static addValues(characteristic: Characteristic): PropertyInformation {
    if (
      characteristic instanceof DefaultEnumeration &&
      characteristic.values?.length &&
      !characteristic.values.every(value => value instanceof DefaultEntityValue)
    ) {
      return {
        label: `values = ${RdfModelUtil.getValuesWithoutUrnDefinition(characteristic.values)}`,
        key: 'values',
      };
    }
    return null;
  }

  static addDefaultValue(characteristic: Characteristic): PropertyInformation {
    if (characteristic instanceof DefaultState && characteristic.defaultValue) {
      return {
        label: `defaultValue = ${RdfModelUtil.getValuesWithoutUrnDefinition(Array(characteristic.defaultValue))}`,
        key: 'defaultValue',
      };
    }
    return null;
  }

  static addLocalizedDescriptions(metaModelElement: Base, languageSettingsService: LanguageSettingsService): PropertyInformation[] {
    return metaModelElement
      .getAllLocalesDescriptions()
      .map(languageCode => {
        const langTag = locale.getByTag(languageCode).tag;
        languageSettingsService.addLanguageCode(langTag);
        const description = metaModelElement.getDescription(langTag);
        if (description) {
          return {
            label: `description = ${description} @${langTag}`,
            key: 'description',
            lang: langTag,
          };
        }
        return null;
      })
      .filter(e => !!e);
  }

  static addLocalizedPreferredNames(metaModelElement: Base, languageSettingsService: LanguageSettingsService): PropertyInformation[] {
    return metaModelElement
      .getAllLocalesPreferredNames()
      .map(languageCode => {
        const langTag = locale.getByTag(languageCode).tag;
        languageSettingsService.addLanguageCode(langTag);
        const preferredName = metaModelElement.getPreferredName(langTag);
        if (preferredName) {
          return {label: `preferredName = ${preferredName} @${langTag}`, key: 'preferredName', lang: langTag};
        }
        return null;
      })
      .filter(e => !!e);
  }

  static addExtends(entity: DefaultEntity | DefaultAbstractEntity): PropertyInformation {
    if (entity.extendedElement !== null && entity.extendedElement !== undefined) {
      return {label: `extends = ${entity.extendedElement.name}`, key: 'extends'};
    }
    return null;
  }

  static addValue(constraint: Constraint): PropertyInformation {
    if (constraint instanceof DefaultEncodingConstraint || constraint instanceof DefaultRegularExpressionConstraint) {
      if (constraint.value !== null && constraint.value !== undefined) {
        return {label: `value = ${RdfModelUtil.getValueWithoutUrnDefinition(constraint.value)}`, key: 'value'};
      }
    }
    return null;
  }

  static addSee(metaModelElement: Base): PropertyInformation {
    if (metaModelElement.getSeeReferences() && metaModelElement.getSeeReferences().length > 0) {
      return {label: `see = ${metaModelElement.getSeeReferences().join(',')}`, key: 'see'};
    }
    return null;
  }

  static addMinValue(constraint: Constraint): PropertyInformation {
    if (
      (constraint instanceof DefaultLengthConstraint || constraint instanceof DefaultRangeConstraint) &&
      constraint.minValue !== null &&
      constraint.minValue !== undefined
    ) {
      return {label: `minValue = ${constraint.minValue}`, key: 'minValue'};
    }
    return null;
  }

  static addMaxValue(constraint: Constraint): PropertyInformation {
    if (
      (constraint instanceof DefaultLengthConstraint || constraint instanceof DefaultRangeConstraint) &&
      constraint.maxValue !== null &&
      constraint.maxValue !== undefined
    ) {
      return {label: `maxValue = ${constraint.maxValue}`, key: 'maxValue'};
    }
    return null;
  }

  static addBoundDefinition(constraint: Constraint): PropertyInformation[] {
    const bounds: PropertyInformation[] = [];
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

  static addLanguageCode(constraint: Constraint): PropertyInformation {
    if (constraint instanceof DefaultLanguageConstraint && constraint.languageCode !== null && constraint.languageCode !== undefined) {
      return {label: `languageCode = ${constraint.languageCode}`, key: 'languageCode'};
    }
    return null;
  }

  static addScale(constraint: Constraint): PropertyInformation {
    if (constraint instanceof DefaultFixedPointConstraint && constraint.scale !== null && constraint.scale !== undefined) {
      return {label: `scale = ${constraint.scale}`, key: 'scale'};
    }
    return null;
  }

  static addInteger(constraint: Constraint): PropertyInformation {
    if (constraint instanceof DefaultFixedPointConstraint && constraint.integer !== null && constraint.integer !== undefined) {
      return {label: `integer = ${constraint.integer}`, key: 'integer'};
    }
    return null;
  }

  static addLocaleCode(constraint: Constraint): PropertyInformation {
    if (constraint instanceof DefaultLocaleConstraint && constraint.localeCode) {
      return {label: `localeCode = ${constraint.localeCode}`, key: 'localeCode'};
    }
    return null;
  }

  static addConversionFactor(unit: Unit): PropertyInformation {
    if (unit.conversionFactor) {
      return {label: `conversionFactor = ${unit.conversionFactor}`, key: 'conversionFactor'};
    }
    return null;
  }

  static addNumericConversionFactor(unit: Unit): PropertyInformation {
    if (unit.conversionFactor) {
      return {label: `numericConversionFactor = ${unit.numericConversionFactor}`, key: 'conversionFactor'};
    }
    return null;
  }

  static addSymbol(unit: Unit): PropertyInformation {
    if (unit.symbol) {
      return {label: `symbol = ${unit.symbol}`, key: 'symbol'};
    }
    return null;
  }

  static addCode(unit: Unit): PropertyInformation {
    if (unit.code) {
      return {label: `code = ${unit.code}`, key: 'code'};
    }
    return null;
  }

  static addReferenceUnit(unit: Unit): PropertyInformation {
    if (unit.referenceUnit) {
      return {label: `referenceUnit = ${unit.referenceUnit.name}`, key: 'referenceUnit'};
    }
    return null;
  }

  static addExampleValue(property: Property): PropertyInformation {
    if (property.exampleValue) {
      return {label: `exampleValue = ${property.exampleValue}`, key: 'exampleValue'};
    }
    return null;
  }

  static addIsCollectionAspect(aspect: Aspect): PropertyInformation {
    if (aspect.isCollectionAspect) {
      return {label: `isCollectionAspect = ${aspect.isCollectionAspect}`, key: 'isCollectionAspect'};
    }
    return null;
  }

  static addQuantityKinds(quantityKinds: Array<QuantityKind>): PropertyInformation {
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

  static addDeconstructionRule(characteristic: Characteristic): PropertyInformation {
    if (characteristic instanceof DefaultStructuredValue && characteristic.deconstructionRule) {
      return {label: `deconstructionRule = ${characteristic.deconstructionRule}`, key: 'deconstructionRule'};
    }
    return null;
  }

  static addElements(characteristic: Characteristic): PropertyInformation {
    if (characteristic instanceof DefaultStructuredValue && characteristic.elements && characteristic.elements.length > 0) {
      return {label: `elements = ${this.getElementList(characteristic).join(' ')}`, key: 'elements'};
    }
    return null;
  }

  static getElementList(characteristic: DefaultStructuredValue): Array<string | Property> {
    return characteristic.elements.map(element => (typeof element === 'string' ? element : element.property.name));
  }

  static getOperationProperties(operation: DefaultOperation, languageSettingsService: LanguageSettingsService) {
    return [
      ...MxGraphVisitorHelper.addLocalizedPreferredNames(operation, languageSettingsService),
      ...MxGraphVisitorHelper.addLocalizedDescriptions(operation, languageSettingsService),
      MxGraphVisitorHelper.addSee(operation),
    ].filter(e => !!e);
  }

  static getEntityProperties(entity: DefaultEntity, languageSettingsService: LanguageSettingsService) {
    return [
      MxGraphVisitorHelper.addExtends(entity),
      ...MxGraphVisitorHelper.addLocalizedPreferredNames(entity, languageSettingsService),
      ...MxGraphVisitorHelper.addLocalizedDescriptions(entity, languageSettingsService),
      MxGraphVisitorHelper.addSee(entity),
    ].filter(e => !!e);
  }

  static getAbstractEntityProperties(entity: any, languageSettingsService: LanguageSettingsService) {
    return this.getEntityProperties(entity, languageSettingsService);
  }

  static getUnitProperties(unit: DefaultUnit, languageSettingsService: LanguageSettingsService) {
    return [
      ...MxGraphVisitorHelper.addLocalizedPreferredNames(unit, languageSettingsService),
      MxGraphVisitorHelper.addCode(unit),
      MxGraphVisitorHelper.addSymbol(unit),
      MxGraphVisitorHelper.addConversionFactor(unit),
      MxGraphVisitorHelper.addNumericConversionFactor(unit),
      MxGraphVisitorHelper.addQuantityKinds(unit.quantityKinds),
      MxGraphVisitorHelper.addReferenceUnit(unit),
    ].filter(e => !!e);
  }

  static getPropertyProperties(property: DefaultProperty, languageSettingsService: LanguageSettingsService) {
    return [
      ...MxGraphVisitorHelper.addLocalizedPreferredNames(property, languageSettingsService),
      ...MxGraphVisitorHelper.addLocalizedDescriptions(property, languageSettingsService),
      MxGraphVisitorHelper.addSee(property),
      MxGraphVisitorHelper.addExampleValue(property),
    ].filter(e => !!e);
  }

  static getCharacteristicProperties(characteristic: DefaultCharacteristic, languageSettingsService: LanguageSettingsService) {
    return [
      ...MxGraphVisitorHelper.addLocalizedPreferredNames(characteristic, languageSettingsService),
      ...MxGraphVisitorHelper.addLocalizedDescriptions(characteristic, languageSettingsService),
      MxGraphVisitorHelper.addSee(characteristic),
      MxGraphVisitorHelper.addDataType(characteristic),
      MxGraphVisitorHelper.addValues(characteristic),
      MxGraphVisitorHelper.addDefaultValue(characteristic),
      MxGraphVisitorHelper.addDeconstructionRule(characteristic),
      MxGraphVisitorHelper.addElements(characteristic),
    ].filter(e => !!e);
  }

  static getAspectProperties(aspect: DefaultAspect, languageSettingsService: LanguageSettingsService) {
    return [
      ...MxGraphVisitorHelper.addLocalizedPreferredNames(aspect, languageSettingsService),
      ...MxGraphVisitorHelper.addLocalizedDescriptions(aspect, languageSettingsService),
      MxGraphVisitorHelper.addSee(aspect),
      MxGraphVisitorHelper.addIsCollectionAspect(aspect),
    ].filter(e => !!e);
  }

  static getConstraintProperties(constraint: DefaultConstraint, languageSettingsService: LanguageSettingsService) {
    return [
      ...MxGraphVisitorHelper.addLocalizedPreferredNames(constraint, languageSettingsService),
      ...MxGraphVisitorHelper.addLocalizedDescriptions(constraint, languageSettingsService),
      MxGraphVisitorHelper.addSee(constraint),
      MxGraphVisitorHelper.addValue(constraint),
      MxGraphVisitorHelper.addMinValue(constraint),
      MxGraphVisitorHelper.addMaxValue(constraint),
      ...MxGraphVisitorHelper.addBoundDefinition(constraint),
      MxGraphVisitorHelper.addLanguageCode(constraint),
      MxGraphVisitorHelper.addScale(constraint),
      MxGraphVisitorHelper.addInteger(constraint),
      MxGraphVisitorHelper.addLocaleCode(constraint),
    ].filter(e => !!e);
  }

  static getEventProperties(event: DefaultEvent, languageSettingsService: LanguageSettingsService) {
    return [
      ...MxGraphVisitorHelper.addLocalizedPreferredNames(event, languageSettingsService),
      ...MxGraphVisitorHelper.addLocalizedDescriptions(event, languageSettingsService),
      MxGraphVisitorHelper.addSee(event),
    ].filter(e => !!e);
  }

  static getElementProperties(element: BaseMetaModelElement, languageSettingsService: LanguageSettingsService) {
    if (element instanceof DefaultOperation) {
      return this.getOperationProperties(element, languageSettingsService);
    }

    if (element instanceof DefaultEntity) {
      return this.getEntityProperties(element, languageSettingsService);
    }

    if (element instanceof DefaultUnit) {
      return this.getUnitProperties(element, languageSettingsService);
    }

    if (element instanceof DefaultProperty) {
      return this.getPropertyProperties(element, languageSettingsService);
    }

    if (element instanceof DefaultCharacteristic) {
      return this.getCharacteristicProperties(element, languageSettingsService);
    }

    if (element instanceof DefaultAspect) {
      return this.getAspectProperties(element, languageSettingsService);
    }

    if (element instanceof DefaultConstraint) {
      return this.getConstraintProperties(element, languageSettingsService);
    }

    if (element instanceof DefaultEvent) {
      return this.getEventProperties(element, languageSettingsService);
    }

    if (element instanceof DefaultAbstractEntity) {
      return this.getAbstractEntityProperties(element, languageSettingsService);
    }

    return null;
  }

  static getModelInfo(modelElement: BaseMetaModelElement, aspect: BaseMetaModelElement): ModelBaseProperties {
    try {
      const [, currentNamespace] = MxGraphHelper.getNamespaceFromElement(aspect);
      const [, elementNamespace] = MxGraphHelper.getNamespaceFromElement(modelElement);

      const [aspectVersionedNamespace] = aspect.aspectModelUrn.split('#');
      const [elementVersionedNamespace] = modelElement.aspectModelUrn.split('#');

      return {
        version: modelElement.metaModelVersion,
        namespace: elementNamespace,
        external: modelElement.isExternalReference(),
        predefined: !!(modelElement as DefaultCharacteristic)?.isPredefined && (modelElement as DefaultCharacteristic)?.isPredefined(),
        sameNamespace: elementNamespace === currentNamespace,
        sameVersionedNamespace: aspectVersionedNamespace === elementVersionedNamespace,
        fileName: modelElement.fileName,
      };
    } catch (error) {
      return null;
    }
  }
}
